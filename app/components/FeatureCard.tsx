type Props = {
  eyebrow?: string;
  title: string;
  description: string;
};

export default function FeatureCard({ eyebrow, title, description }: Props) {
  return (
    <article className="feature-card panel">
      {eyebrow ? <span className="card-eyebrow">{eyebrow}</span> : null}
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}
