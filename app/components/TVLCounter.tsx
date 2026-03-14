import { useEffect, useState } from "react";

import { formatCompactNumber } from "../utils/format";

type Props = {
  value?: number | null;
};

export default function TVLCounter({ value }: Props) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === null || value === undefined || Number.isNaN(value)) {
      setDisplay(0);
      return;
    }

    let frame = 0;
    const startedAt = performance.now();
    const initialValue = display;
    const duration = 900;

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      setDisplay(initialValue + (value - initialValue) * eased);

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [value]);

  if (value === null || value === undefined || Number.isNaN(value)) {
    return <strong className="tvl-value tvl-placeholder">—</strong>;
  }

  return <strong className="tvl-value">{formatCompactNumber(display, 2)} SOL</strong>;
}
