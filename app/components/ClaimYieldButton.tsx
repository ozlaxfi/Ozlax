import { useState } from "react";

import type { ActionResult } from "../hooks/useOzlax";
import { formatSol } from "../utils/format";

type Props = {
  onClick: () => Promise<ActionResult>;
  loading: boolean;
  pendingYield: number;
  disabled: boolean;
};

export default function ClaimYieldButton({ onClick, loading, pendingYield, disabled }: Props) {
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleClick = async () => {
    const result = await onClick();
    setFeedback({ type: result.ok ? "success" : "error", message: result.message });
  };

  return (
    <div className="glass-card action-card action-card-highlight">
      <div className="card-head">
        <div>
          <span className="card-eyebrow">Claim</span>
          <h3>Realize harvested yield</h3>
        </div>
        <span className="card-hint">{formatSol(pendingYield)}</span>
      </div>

      <p className="form-note">
        Claiming pays out your accrued SOL rewards without reducing your deposited principal in the vault.
      </p>

      {feedback ? <div className={`feedback-message feedback-${feedback.type}`}>{feedback.message}</div> : null}

      <button
        type="button"
        disabled={disabled || loading || pendingYield <= 0}
        className="button-primary button-block"
        onClick={() => void handleClick()}
      >
        {loading ? "Claiming..." : pendingYield > 0 ? `Claim ${formatSol(pendingYield)}` : "No Yield Available"}
      </button>
    </div>
  );
}
