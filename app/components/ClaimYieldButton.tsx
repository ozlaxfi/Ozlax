import { useState } from "react";

import type { ActionResult } from "../hooks/useOzlax";
import { formatSol } from "../utils/format";
import ConfirmModal from "./ConfirmModal";
import { useToast } from "./Toast";

type Props = {
  onClick: () => Promise<ActionResult>;
  loading: boolean;
  pendingYield: number;
  disabled: boolean;
};

export default function ClaimYieldButton({ onClick, loading, pendingYield, disabled }: Props) {
  const [claimedAmount, setClaimedAmount] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { showToast } = useToast();

  const handleClick = async () => {
    const result = await onClick();
    setConfirmOpen(false);
    if (result.ok) {
      setClaimedAmount(result.amount ?? pendingYield);
    }
    showToast({
      tone: result.ok ? "success" : "error",
      title: result.ok ? "Claim sent" : "Claim failed",
      message: result.message,
      signature: result.signature,
    });
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
      <p className="form-inline-hint">Claimable now: {formatSol(pendingYield)}.</p>
      {claimedAmount ? <p className="form-note">Your most recent claim request covered {formatSol(claimedAmount)}.</p> : null}

      <button
        type="button"
        disabled={disabled || loading || pendingYield <= 0}
        className="button-primary button-block"
        onClick={() => setConfirmOpen(true)}
      >
        {loading ? "Claiming..." : pendingYield > 0 ? `Claim ${formatSol(pendingYield)}` : "Yield settles here"}
      </button>

      <ConfirmModal
        open={confirmOpen}
        title={`Claim ${formatSol(pendingYield)}`}
        confirmLabel="Confirm claim"
        loading={loading}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleClick}
      >
        <p className="form-note">
          Claiming realizes your current pending yield without touching the SOL you still have deposited in the vault.
        </p>
        <p className="form-inline-hint">
          You are about to claim <strong>{formatSol(pendingYield)}</strong>.
        </p>
      </ConfirmModal>
    </div>
  );
}
