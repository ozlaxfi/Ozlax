type Props = {
  title: string;
  description: string;
};

export default function FeatureCard({ title, description }: Props) {
  return (
    <article className="glass-panel feature-card">
      <div className="feature-glow" />
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}
