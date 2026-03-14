type Props = {
  width?: string;
  height?: string;
  className?: string;
};

export default function Skeleton({ width = "100%", height = "1rem", className = "" }: Props) {
  return <span className={`skeleton ${className}`.trim()} style={{ width, height }} aria-hidden="true" />;
}
