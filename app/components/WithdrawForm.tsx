import { FormEvent, useState } from "react";

import type { ActionResult } from "../hooks/useOzlax";
import { formatSol } from "../utils/format";

type Props = {
  onSubmit: (amount: number) => Promise<ActionResult>;
  loading: boolean;
  disabled: boolean;
  maxAmount?: number | null;
};

export default function WithdrawForm({ onSubmit, loading, disabled, maxAmount }: Props) {
  const [amount, setAmount] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setFeedback({ type: "error", message: "Enter a valid withdrawal amount." });
      return;
    }

    if (maxAmount !== null && maxAmount !== undefined && parsedAmount > maxAmount) {
      setFeedback({ type: "error", message: "Withdrawal amount exceeds your deposited balance." });
      return;
    }

    const result = await onSubmit(parsedAmount);
    setFeedback({ type: result.ok ? "success" : "error", message: result.message });
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
          <button
            type="button"
            className="field-action"
            disabled={disabled || loading || !maxAmount}
            onClick={() => setAmount(maxAmount ? maxAmount.toFixed(4) : "")}
          >
            Max
          </button>
        </div>
      </label>

      <div className="form-meta">
        <span>Deposited</span>
        <strong>{formatSol(maxAmount)}</strong>
      </div>

      <p className="form-note">Withdrawals settle pending rewards first, then reduce your deposited SOL position.</p>

      {feedback ? <div className={`feedback-message feedback-${feedback.type}`}>{feedback.message}</div> : null}

      <button type="submit" disabled={disabled || loading} className="button-secondary button-block">
        {loading ? "Withdrawing..." : "Withdraw SOL"}
      </button>
    </form>
  );
}
