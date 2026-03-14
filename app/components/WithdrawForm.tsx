import { FormEvent, useState } from "react";

import type { ActionResult } from "../hooks/useOzlax";
import { formatSol } from "../utils/format";
import { useToast } from "./Toast";

type Props = {
  onSubmit: (amount: number) => Promise<ActionResult>;
  loading: boolean;
  disabled: boolean;
  maxAmount?: number | null;
};

export default function WithdrawForm({ onSubmit, loading, disabled, maxAmount }: Props) {
  const [amount, setAmount] = useState("");
  const { showToast } = useToast();
  const parsedAmount = Number(amount);
  const hasAmount = amount.trim().length > 0;
  const exceedsMax = maxAmount !== null && maxAmount !== undefined && parsedAmount > maxAmount;
  const isValidAmount = hasAmount && Number.isFinite(parsedAmount) && parsedAmount > 0 && !exceedsMax;
  const submitDisabled = disabled || loading || !isValidAmount;

  const fillAmount = (percentage: number) => {
    if (maxAmount === null || maxAmount === undefined || maxAmount <= 0) {
      return;
    }

    setAmount((maxAmount * percentage).toFixed(4));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      showToast({
        tone: "error",
        title: "Withdrawal blocked",
        message: "Enter a valid amount before sending the transaction.",
      });
      return;
    }

    if (maxAmount !== null && maxAmount !== undefined && parsedAmount > maxAmount) {
      showToast({
        tone: "error",
        title: "Withdrawal blocked",
        message: "That amount is larger than your deposited balance.",
      });
      return;
    }

    const result = await onSubmit(parsedAmount);
    if (result.ok) {
      setAmount("");
    }
    showToast({
      tone: result.ok ? "success" : "error",
      title: result.ok ? "Withdrawal sent" : "Withdrawal failed",
      message: result.message,
      signature: result.signature,
    });
  };

  return (
    <form className="glass-card action-card" onSubmit={handleSubmit}>
      <div className="card-head">
        <div>
          <span className="card-eyebrow">Withdraw</span>
          <h3>Redeem principal</h3>
        </div>
        <span className="card-hint">Claimable anytime</span>
      </div>

      <div className="form-meta form-meta-stack">
        <div>
          <span>Deposited</span>
          <strong>{formatSol(maxAmount)}</strong>
        </div>
        <div className="selector-row">
          {[0.25, 0.5, 0.75].map((percentage) => (
            <button
              key={percentage}
              type="button"
              className="selector-chip"
              disabled={disabled || loading || !maxAmount}
              onClick={() => fillAmount(percentage)}
            >
              {`${Math.round(percentage * 100)}%`}
            </button>
          ))}
          <button
            type="button"
            className="selector-chip"
            disabled={disabled || loading || !maxAmount}
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
            min="0"
            step="0.01"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="field-input"
            placeholder="0.05"
            disabled={disabled || loading}
          />
        </div>
        <p className="form-inline-hint">
          {hasAmount && !isValidAmount
            ? exceedsMax
              ? "That withdrawal is larger than the SOL you have deposited."
              : "Enter a positive withdrawal amount."
            : "Use the quick-select buttons to size a withdrawal without typing the number by hand."}
        </p>
      </label>

      <p className="form-note">Withdrawals settle pending rewards first, then reduce your deposited SOL position.</p>

      <button type="submit" disabled={submitDisabled} className="button-secondary button-block">
        {loading ? "Withdrawing..." : "Withdraw SOL"}
      </button>
    </form>
  );
}
