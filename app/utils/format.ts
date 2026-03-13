export const formatSol = (value: number) => `${value.toFixed(4)} SOL`;

export const formatPercent = (value: number) => `${(value * 100).toFixed(2)}%`;

export const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value);

export const formatCompactNumber = (value: number, maximumFractionDigits = 1) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits,
  }).format(value);

export const formatTimestamp = (value: number) => {
  if (!value) {
    return "Pending";
  }

  return new Date(value * 1000).toLocaleString();
};

export const shortenAddress = (value: string) => {
  if (!value) {
    return "Not connected";
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`;
};
