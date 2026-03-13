import { formatSol } from "../utils/format";

type Props = {
  onClick: () => Promise<void>;
  loading: boolean;
  pendingYield: number;
};

export default function ClaimYieldButton({ onClick, loading, pendingYield }: Props) {
  return (
    <div className="glass-panel action-card">
      <div className="card-head">
        <h3>Claim Yield</h3>
        <span>{formatSol(pendingYield)} pending</span>
      </div>
      <button type="button" disabled={loading || pendingYield <= 0} className="primary-button" onClick={() => void onClick()}>
        {loading ? "Submitting..." : "Claim Yield"}
      </button>
    </div>
  );
}
