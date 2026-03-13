import { FormEvent, useState } from "react";

type Props = {
  onSubmit: (amount: number) => Promise<void>;
  loading: boolean;
};

export default function DepositForm({ onSubmit, loading }: Props) {
  const [amount, setAmount] = useState("0.10");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit(Number(amount));
  };

  return (
    <form className="panel action-card" onSubmit={handleSubmit}>
      <div className="card-head">
        <div>
          <span className="card-eyebrow">Earn</span>
          <h3>Deposit SOL</h3>
        </div>
        <span className="card-hint">Min 0.01 SOL</span>
      </div>
      <label className="field-wrap">
        <span>Amount</span>
        <input
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className="glass-input"
        />
      </label>
      <p className="form-note">Deposits settle any pending rewards before principal increases.</p>
      <button type="submit" disabled={loading} className="primary-button">
        {loading ? "Submitting..." : "Deposit"}
      </button>
    </form>
  );
}
