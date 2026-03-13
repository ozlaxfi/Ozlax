import { FormEvent, useState } from "react";

type Props = {
  onSubmit: (amount: number) => Promise<void>;
  loading: boolean;
};

export default function WithdrawForm({ onSubmit, loading }: Props) {
  const [amount, setAmount] = useState("0.05");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit(Number(amount));
  };

  return (
    <form className="panel action-card" onSubmit={handleSubmit}>
      <div className="card-head">
        <div>
          <span className="card-eyebrow">Liquidity</span>
          <h3>Withdraw SOL</h3>
        </div>
        <span className="card-hint">Principal stays liquid</span>
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
      <p className="form-note">Withdrawals settle earned yield first, then reduce your principal position.</p>
      <button type="submit" disabled={loading} className="secondary-button">
        {loading ? "Submitting..." : "Withdraw"}
      </button>
    </form>
  );
}
