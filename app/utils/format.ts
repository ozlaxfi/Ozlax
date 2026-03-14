const numberFormatter = new Intl.NumberFormat("en-US");

export const formatNumber = (value: number) => numberFormatter.format(value);

export const formatCompactNumber = (value: number, maximumFractionDigits = 1) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits,
  }).format(value);

export const formatSol = (value?: number | null, fractionDigits = 4) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "Pending sync";
  }

  return `${value.toFixed(fractionDigits)} SOL`;
};

export const formatCompactSol = (value?: number | null, fractionDigits = 2) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "Pending sync";
  }

  return `${formatCompactNumber(value, fractionDigits)} SOL`;
};

export const formatPercent = (value?: number | null, fractionDigits = 2) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "Pending sync";
  }

  return `${(value * 100).toFixed(fractionDigits)}%`;
};

export const formatWholePercent = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "Pending sync";
  }

  return `${value}%`;
};

export const formatTimestamp = (value?: number | null) => {
  if (!value) {
    return "Waiting for sync";
  }

  return new Date(value * 1000).toLocaleString();
};

export const formatSlot = (value?: number | null) => {
  if (!value) {
    return "Waiting for sync";
  }

  return `Slot ${formatNumber(value)}`;
};

export const shortenAddress = (value?: string | null) => {
  if (!value) {
    return "Not connected";
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`;
};

export const shortenSignature = (value?: string | null) => {
  if (!value) {
    return "Pending";
  }

  return `${value.slice(0, 6)}...${value.slice(-6)}`;
};
