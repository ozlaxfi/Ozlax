import { FormEvent, useEffect, useState } from "react";

import type { ActionResult } from "../hooks/useOzlax";
import { formatSol } from "../utils/format";

type Props = {
  onSubmit: (amount: number) => Promise<ActionResult>;
  loading: boolean;
  disabled: boolean;
  walletBalance?: number | null;
};

export default function DepositForm({ onSubmit, loading, disabled, walletBalance }: Props) {
  const [amount, setAmount] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (!loading) {
      return;
    }

    setFeedback(null);
  }, [loading]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount < 0.01) {
      setFeedback({ type: "error", message: "Enter at least 0.01 SOL to deposit." });
      return;
    }

    const result = await onSubmit(parsedAmount);
    setFeedback({ type: result.ok ? "success" : "error", message: result.message });
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
          <button
            type="button"
            className="field-action"
            disabled={disabled || loading || !walletBalance}
            onClick={() => setAmount(walletBalance ? walletBalance.toFixed(4) : "")}
          >
            Max
          </button>
        </div>
      </label>

      <div className="form-meta">
        <span>Wallet balance</span>
        <strong>{formatSol(walletBalance)}</strong>
      </div>

      <p className="form-note">Depositing settles pending rewards first, then increases your principal balance.</p>

      {feedback ? <div className={`feedback-message feedback-${feedback.type}`}>{feedback.message}</div> : null}

      <button type="submit" disabled={disabled || loading} className="button-primary button-block">
        {loading ? "Depositing..." : "Deposit SOL"}
      </button>
    </form>
  );
}
