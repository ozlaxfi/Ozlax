import { useEffect, useState } from "react";

type Props = {
  value: number;
};

export default function TVLCounter({ value }: Props) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const duration = 1400;

    const step = (timestamp: number) => {
      const progress = Math.min((timestamp - start) / duration, 1);
      setDisplay(value * progress);
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <strong className="tvl-value">{display.toFixed(2)} SOL</strong>;
}
