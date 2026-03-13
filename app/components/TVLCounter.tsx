import { useEffect, useState } from "react";

import { formatCompactNumber } from "../utils/format";

type Props = {
  value: number;
};

export default function TVLCounter({ value }: Props) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    setDisplay(value);
  }, [value]);

  return <strong className="tvl-value">{formatCompactNumber(display, 2)} SOL</strong>;
}
