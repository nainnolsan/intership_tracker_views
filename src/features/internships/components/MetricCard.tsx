interface MetricCardProps {
  label: string;
  value: string | number;
  tone?: 'neutral' | 'accent' | 'success' | 'danger';
}

export default function MetricCard({ label, value, tone = 'neutral' }: MetricCardProps) {
  return (
    <article className={`metric-card tone-${tone}`}>
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
    </article>
  );
}
