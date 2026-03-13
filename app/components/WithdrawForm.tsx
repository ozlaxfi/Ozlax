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
    <form className="glass-panel action-card" onSubmit={handleSubmit}>
      <div className="card-head">
        <h3>Withdraw SOL</h3>
        <span>Principal stays liquid</span>
      </div>
      <input
        type="number"
        min="0.01"
        step="0.01"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        className="glass-input"
      />
      <button type="submit" disabled={loading} className="secondary-button">
        {loading ? "Submitting..." : "Withdraw"}
      </button>
    </form>
  );
}
