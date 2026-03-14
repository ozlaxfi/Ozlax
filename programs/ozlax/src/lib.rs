use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

declare_id!("BSaLVpWMCC6sjuyy4D1r8UHFQ2xc9LXNSeHBZqbjguyx");

const ACC_PRECISION: u128 = 1_000_000_000_000;
const MIN_DEPOSIT_LAMPORTS: u64 = 10_000_000;

#[program]
pub mod ozlax {
    use super::*;

    pub fn initialize_vault(
        ctx: Context<InitializeVault>,
        fee_bps: u16,
        treasury: Pubkey,
        ozx_mint: Pubkey,
        marinade_stake_account: Pubkey,
        jito_stake_account: Pubkey,
    ) -> Result<()> {
        require!(fee_bps <= 5_000, OzlaxError::FeeTooHigh);

        let vault = &mut ctx.accounts.vault;
        vault.authority = ctx.accounts.authority.key();
        vault.treasury = treasury;
        vault.total_deposited = 0;
        vault.total_yield_harvested = 0;
        vault.acc_yield_per_share = 0;
        vault.fee_bps = fee_bps;
        vault.marinade_pct = 50;
        vault.jito_pct = 50;
        vault.bump = ctx.bumps.vault;
        // Stored for future governance gating. A later version could validate OZX holdings
        // without changing the current vault accounting model.
        vault.ozx_mint = ozx_mint;
        vault.marinade_stake_account = marinade_stake_account;
        vault.jito_stake_account = jito_stake_account;

        emit!(VaultInitializedEvent {
            authority: vault.authority,
            treasury,
            fee_bps,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        require!(amount >= MIN_DEPOSIT_LAMPORTS, OzlaxError::DepositTooSmall);

        let now_slot = Clock::get()?.slot;
        let user_key = ctx.accounts.user.key();
        let vault_info = ctx.accounts.vault.to_account_info();
        let user_info = ctx.accounts.user.to_account_info();

        {
            let vault = &mut ctx.accounts.vault;
            let user_position = &mut ctx.accounts.user_position;

            initialize_user_position_if_needed(user_position, user_key, ctx.bumps.user_position);
            settle_user_rewards(vault, user_position, &vault_info, &user_info, now_slot)?;
        }

        transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: user_info,
                    to: vault_info,
                },
            ),
            amount,
        )?;

        let vault = &mut ctx.accounts.vault;
        let user_position = &mut ctx.accounts.user_position;
        vault.total_deposited = vault
            .total_deposited
            .checked_add(amount)
            .ok_or(OzlaxError::MathOverflow)?;
        user_position.deposited_amount = user_position
            .deposited_amount
            .checked_add(amount)
            .ok_or(OzlaxError::MathOverflow)?;
        user_position.reward_debt = reward_debt(vault.acc_yield_per_share, user_position.deposited_amount)?;
        user_position.last_harvest_slot = now_slot;

        emit!(DepositEvent {
            user: ctx.accounts.user.key(),
            amount,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        require!(amount > 0, OzlaxError::InvalidAmount);

        let now_slot = Clock::get()?.slot;
        let vault_info = ctx.accounts.vault.to_account_info();
        let user_info = ctx.accounts.user.to_account_info();

        require!(
            ctx.accounts.user_position.deposited_amount >= amount,
            OzlaxError::InsufficientDeposit
        );

        {
            let vault = &mut ctx.accounts.vault;
            let user_position = &mut ctx.accounts.user_position;
            settle_user_rewards(vault, user_position, &vault_info, &user_info, now_slot)?;
        }

        let vault = &mut ctx.accounts.vault;
        let user_position = &mut ctx.accounts.user_position;
        user_position.deposited_amount = user_position
            .deposited_amount
            .checked_sub(amount)
            .ok_or(OzlaxError::MathOverflow)?;
        vault.total_deposited = vault
            .total_deposited
            .checked_sub(amount)
            .ok_or(OzlaxError::MathOverflow)?;

        transfer_from_vault(
            &vault_info,
            &user_info,
            amount,
        )?;

        user_position.reward_debt = reward_debt(vault.acc_yield_per_share, user_position.deposited_amount)?;
        user_position.last_harvest_slot = now_slot;

        emit!(WithdrawEvent {
            user: ctx.accounts.user.key(),
            amount,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    pub fn claim_yield(ctx: Context<ClaimYield>) -> Result<()> {
        let now_slot = Clock::get()?.slot;
        let vault_info = ctx.accounts.vault.to_account_info();
        let user_info = ctx.accounts.user.to_account_info();

        let pending = pending_yield(&ctx.accounts.vault, &ctx.accounts.user_position)?;

        let vault = &mut ctx.accounts.vault;
        let user_position = &mut ctx.accounts.user_position;
        require!(pending > 0, OzlaxError::NoYieldAvailable);

        transfer_from_vault(&vault_info, &user_info, pending)?;

        user_position.yield_earned_claimed = user_position
            .yield_earned_claimed
            .checked_add(pending)
            .ok_or(OzlaxError::MathOverflow)?;
        user_position.reward_debt = reward_debt(vault.acc_yield_per_share, user_position.deposited_amount)?;
        user_position.last_harvest_slot = now_slot;

        emit!(YieldClaimedEvent {
            user: ctx.accounts.user.key(),
            amount: pending,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    pub fn harvest_yield(
        ctx: Context<HarvestYield>,
        marinade_yield: u64,
        jito_yield: u64,
    ) -> Result<()> {
        let vault_info = ctx.accounts.vault.to_account_info();
        let vault = &mut ctx.accounts.vault;

        require!(
            vault.authority == ctx.accounts.authority.key(),
            OzlaxError::Unauthorized
        );

        let total_yield = marinade_yield
            .checked_add(jito_yield)
            .ok_or(OzlaxError::MathOverflow)?;
        require!(total_yield > 0, OzlaxError::InvalidAmount);
        require!(vault.total_deposited > 0, OzlaxError::EmptyVault);

        let protocol_fee = (total_yield as u128)
            .checked_mul(vault.fee_bps as u128)
            .ok_or(OzlaxError::MathOverflow)?
            .checked_div(10_000)
            .ok_or(OzlaxError::MathOverflow)? as u64;
        let distributable = total_yield
            .checked_sub(protocol_fee)
            .ok_or(OzlaxError::MathOverflow)?;

        require!(
            vault_available_lamports(&vault_info)? >= total_yield,
            OzlaxError::EmptyVault
        );

        if protocol_fee > 0 {
            transfer_from_vault(&vault_info, &ctx.accounts.treasury.to_account_info(), protocol_fee)?;
        }

        let increment = (distributable as u128)
            .checked_mul(ACC_PRECISION)
            .ok_or(OzlaxError::MathOverflow)?
            .checked_div(vault.total_deposited as u128)
            .ok_or(OzlaxError::MathOverflow)?;

        vault.acc_yield_per_share = vault
            .acc_yield_per_share
            .checked_add(increment)
            .ok_or(OzlaxError::MathOverflow)?;
        vault.total_yield_harvested = vault
            .total_yield_harvested
            .checked_add(total_yield)
            .ok_or(OzlaxError::MathOverflow)?;

        emit!(YieldHarvestedEvent {
            total_yield,
            protocol_fee,
            distributable,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    pub fn rebalance(ctx: Context<Rebalance>, marinade_pct: u8, jito_pct: u8) -> Result<()> {
        require!(
            ctx.accounts.vault.authority == ctx.accounts.authority.key(),
            OzlaxError::Unauthorized
        );
        require!(
            marinade_pct.checked_add(jito_pct).ok_or(OzlaxError::MathOverflow)? == 100,
            OzlaxError::InvalidAllocation
        );

        let vault = &mut ctx.accounts.vault;
        vault.marinade_pct = marinade_pct;
        vault.jito_pct = jito_pct;

        emit!(RebalanceEvent {
            marinade_pct,
            jito_pct,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + VaultState::LEN,
        seeds = [b"vault"],
        bump
    )]
    pub vault: Account<'info, VaultState>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut, seeds = [b"vault"], bump = vault.bump)]
    pub vault: Account<'info, VaultState>,
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + UserPosition::LEN,
        seeds = [b"user-position", user.key().as_ref()],
        bump
    )]
    pub user_position: Account<'info, UserPosition>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut, seeds = [b"vault"], bump = vault.bump)]
    pub vault: Account<'info, VaultState>,
    #[account(
        mut,
        seeds = [b"user-position", user.key().as_ref()],
        bump = user_position.bump,
        constraint = user_position.owner == user.key() @ OzlaxError::Unauthorized
    )]
    pub user_position: Account<'info, UserPosition>,
    #[account(mut)]
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct ClaimYield<'info> {
    #[account(mut, seeds = [b"vault"], bump = vault.bump)]
    pub vault: Account<'info, VaultState>,
    #[account(
        mut,
        seeds = [b"user-position", user.key().as_ref()],
        bump = user_position.bump,
        constraint = user_position.owner == user.key() @ OzlaxError::Unauthorized
    )]
    pub user_position: Account<'info, UserPosition>,
    #[account(mut)]
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct HarvestYield<'info> {
    #[account(
        mut,
        seeds = [b"vault"],
        bump = vault.bump,
        has_one = authority @ OzlaxError::Unauthorized
    )]
    pub vault: Account<'info, VaultState>,
    pub authority: Signer<'info>,
    #[account(mut, address = vault.treasury)]
    pub treasury: SystemAccount<'info>,
}

#[derive(Accounts)]
pub struct Rebalance<'info> {
    #[account(
        mut,
        seeds = [b"vault"],
        bump = vault.bump,
        has_one = authority @ OzlaxError::Unauthorized
    )]
    pub vault: Account<'info, VaultState>,
    pub authority: Signer<'info>,
}

#[account]
pub struct VaultState {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub total_deposited: u64,
    pub total_yield_harvested: u64,
    pub acc_yield_per_share: u128,
    pub fee_bps: u16,
    pub marinade_pct: u8,
    pub jito_pct: u8,
    pub bump: u8,
    pub ozx_mint: Pubkey,
    pub marinade_stake_account: Pubkey,
    pub jito_stake_account: Pubkey,
}

impl VaultState {
    pub const LEN: usize = 32 + 32 + 8 + 8 + 16 + 2 + 1 + 1 + 1 + 32 + 32 + 32;
}

#[account]
pub struct UserPosition {
    pub owner: Pubkey,
    pub deposited_amount: u64,
    pub yield_earned_claimed: u64,
    pub reward_debt: u128,
    pub last_harvest_slot: u64,
    pub bump: u8,
}

impl UserPosition {
    pub const LEN: usize = 32 + 8 + 8 + 16 + 8 + 1;
}

#[event]
pub struct VaultInitializedEvent {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub fee_bps: u16,
    pub timestamp: i64,
}

#[event]
pub struct DepositEvent {
    pub user: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct WithdrawEvent {
    pub user: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct YieldHarvestedEvent {
    pub total_yield: u64,
    pub protocol_fee: u64,
    pub distributable: u64,
    pub timestamp: i64,
}

#[event]
pub struct YieldClaimedEvent {
    pub user: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct RebalanceEvent {
    pub marinade_pct: u8,
    pub jito_pct: u8,
    pub timestamp: i64,
}

#[error_code]
pub enum OzlaxError {
    #[msg("Fee is above the allowed maximum.")]
    FeeTooHigh,
    #[msg("Deposit is below the minimum amount.")]
    DepositTooSmall,
    #[msg("Amount is invalid.")]
    InvalidAmount,
    #[msg("User deposit is too low.")]
    InsufficientDeposit,
    #[msg("Signer is not authorized.")]
    Unauthorized,
    #[msg("Allocation must sum to 100.")]
    InvalidAllocation,
    #[msg("No yield is available.")]
    NoYieldAvailable,
    #[msg("Vault has no distributable lamports.")]
    EmptyVault,
    #[msg("Math overflow.")]
    MathOverflow,
}

fn initialize_user_position_if_needed(user_position: &mut Account<UserPosition>, owner: Pubkey, bump: u8) {
    if user_position.owner == Pubkey::default() {
        user_position.owner = owner;
        user_position.deposited_amount = 0;
        user_position.yield_earned_claimed = 0;
        user_position.reward_debt = 0;
        user_position.last_harvest_slot = 0;
        user_position.bump = bump;
    }
}

fn pending_yield(vault: &VaultState, user_position: &UserPosition) -> Result<u64> {
    if user_position.deposited_amount == 0 {
        return Ok(0);
    }

    let accumulated = reward_debt(vault.acc_yield_per_share, user_position.deposited_amount)?;
    let pending = accumulated
        .checked_sub(user_position.reward_debt)
        .ok_or(OzlaxError::MathOverflow)?;

    u64::try_from(pending).map_err(|_| error!(OzlaxError::MathOverflow))
}

fn reward_debt(acc_yield_per_share: u128, deposited_amount: u64) -> Result<u128> {
    (deposited_amount as u128)
        .checked_mul(acc_yield_per_share)
        .ok_or(OzlaxError::MathOverflow)?
        .checked_div(ACC_PRECISION)
        .ok_or(OzlaxError::MathOverflow.into())
}

fn settle_user_rewards(
    vault: &mut Account<VaultState>,
    user_position: &mut Account<UserPosition>,
    vault_info: &AccountInfo,
    user_info: &AccountInfo,
    slot: u64,
) -> Result<()> {
    let pending = pending_yield(vault, user_position)?;
    if pending > 0 {
        transfer_from_vault(vault_info, user_info, pending)?;
        user_position.yield_earned_claimed = user_position
            .yield_earned_claimed
            .checked_add(pending)
            .ok_or(OzlaxError::MathOverflow)?;
    }

    user_position.reward_debt = reward_debt(vault.acc_yield_per_share, user_position.deposited_amount)?;
    user_position.last_harvest_slot = slot;
    Ok(())
}

fn transfer_from_vault(from: &AccountInfo, to: &AccountInfo, amount: u64) -> Result<()> {
    require!(amount > 0, OzlaxError::InvalidAmount);
    require!(vault_available_lamports(from)? >= amount, OzlaxError::EmptyVault);

    let updated_from = from
        .lamports()
        .checked_sub(amount)
        .ok_or(OzlaxError::MathOverflow)?;
    let updated_to = to
        .lamports()
        .checked_add(amount)
        .ok_or(OzlaxError::MathOverflow)?;

    **from.try_borrow_mut_lamports()? = updated_from;
    **to.try_borrow_mut_lamports()? = updated_to;

    Ok(())
}

fn vault_available_lamports(vault_info: &AccountInfo) -> Result<u64> {
    let rent_exempt_floor = Rent::get()?.minimum_balance(vault_info.data_len());
    vault_info
        .lamports()
        .checked_sub(rent_exempt_floor)
        .ok_or(OzlaxError::EmptyVault.into())
}
