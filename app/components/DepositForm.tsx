import { FormEvent, useState } from "react";

import type { ActionResult } from "../hooks/useOzlax";
import { formatSol } from "../utils/format";
import ConfirmModal from "./ConfirmModal";
import { useToast } from "./Toast";

type Props = {
  onSubmit: (amount: number) => Promise<ActionResult>;
  loading: boolean;
  disabled: boolean;
  walletBalance?: number | null;
  weightedApy?: number | null;
};

const FEE_RESERVE_SOL = 0.01;

export default function DepositForm({ onSubmit, loading, disabled, walletBalance, weightedApy }: Props) {
  const [amount, setAmount] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { showToast } = useToast();
  const parsedAmount = Number(amount);
  const hasAmount = amount.trim().length > 0;
  const spendableBalance =
    walletBalance !== null && walletBalance !== undefined ? Math.max(walletBalance - FEE_RESERVE_SOL, 0) : null;
  const exceedsBalance = walletBalance !== null && walletBalance !== undefined && parsedAmount > walletBalance;
  const isValidAmount = hasAmount && Number.isFinite(parsedAmount) && parsedAmount >= 0.01 && !exceedsBalance;
  const submitDisabled = disabled || loading || !isValidAmount;
  const estimatedDailyYield = weightedApy && hasAmount && Number.isFinite(parsedAmount) ? (parsedAmount * weightedApy) / 365 : null;

  const fillAmount = (percentage: number) => {
    if (spendableBalance === null || spendableBalance <= 0) {
      return;
    }

    setAmount((spendableBalance * percentage).toFixed(4));
  };

  const validateAmount = () => {
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0.01) {
      showToast({
        tone: "error",
        title: "Deposit blocked",
        message: "Enter at least 0.01 SOL before sending the transaction.",
      });
      return false;
    }

    if (exceedsBalance) {
      showToast({
        tone: "error",
        title: "Deposit blocked",
        message: "That amount is larger than the SOL currently in your connected wallet.",
      });
      return false;
    }

    return true;
  };

  const executeDeposit = async () => {
    const result = await onSubmit(parsedAmount);
    setConfirmOpen(false);
    if (result.ok) {
      setAmount("");
    }
    showToast({
      tone: result.ok ? "success" : "error",
      title: result.ok ? "Deposit sent" : "Deposit failed",
      message: result.message,
      signature: result.signature,
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validateAmount()) {
      return;
    }
    setConfirmOpen(true);
  };

  return (
    <form className="glass-card action-card" onSubmit={handleSubmit}>
      <div className="card-head">
        <div>
          <span className="card-eyebrow">Deposit</span>
          <h3>Supply SOL to the vault</h3>
        </div>
        <span className="card-hint">Minimum 0.01 SOL</span>
      </div>

      <div className="form-meta form-meta-stack">
        <div>
          <span>Wallet balance</span>
          <strong>{formatSol(walletBalance)}</strong>
        </div>
        <div className="selector-row">
          {[0.25, 0.5, 0.75].map((percentage) => (
            <button
              key={percentage}
              type="button"
              className="selector-chip"
              disabled={disabled || loading || !spendableBalance}
              onClick={() => fillAmount(percentage)}
            >
              {`${Math.round(percentage * 100)}%`}
            </button>
          ))}
          <button
            type="button"
            className="selector-chip"
            disabled={disabled || loading || !spendableBalance}
            onClick={() => fillAmount(1)}
          >
            Max
          </button>
        </div>
      </div>

      <label className="field-group">
        <span className="field-label">Amount</span>
        <div className="field-input-row">
          <input
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="field-input"
            placeholder="0.10"
            disabled={disabled || loading}
          />
        </div>
        <p className="form-inline-hint">
          {hasAmount && !isValidAmount
            ? exceedsBalance
              ? "That deposit is larger than your wallet balance."
              : "Enter at least 0.01 SOL."
            : "Min 0.01 SOL. Quick-select buttons keep a small fee reserve in your wallet."}
        </p>
      </label>

      {estimatedDailyYield !== null && weightedApy !== null ? (
        <p className="form-note">
          Estimated daily yield: <strong>{`~${formatSol(estimatedDailyYield, 6)}`}</strong> based on the current weighted APY.
        </p>
      ) : null}

      <p className="form-note">Depositing settles pending rewards first, then increases your principal balance.</p>

      <button type="submit" disabled={submitDisabled} className="button-primary button-block">
        {loading ? "Depositing..." : "Deposit SOL"}
      </button>

      <ConfirmModal
        open={confirmOpen}
        title={`Deposit ${formatSol(parsedAmount)}`}
        confirmLabel="Confirm deposit"
        loading={loading}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={executeDeposit}
      >
        <p className="form-note">
          This deposit will settle any pending rewards first and then increase your principal inside the Ozlax vault.
        </p>
        <p className="form-inline-hint">
          You are about to deposit <strong>{formatSol(parsedAmount)}</strong>.
        </p>
      </ConfirmModal>
    </form>
  );
}
