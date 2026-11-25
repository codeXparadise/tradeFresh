interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
}

export function MetricCard({ label, value, unit }: MetricCardProps) {
  return (
    <div
      className="tf-card"
      style={{
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '10px',
      }}
    >
      <span className="tf-label">{label}</span>
      <div
        className="tf-heading-font tf-tabular"
        style={{
          fontSize: '30px',
          lineHeight: 1.1,
          fontWeight: 600,
          color: 'var(--tf-ink)',
        }}
      >
        {value}
        {unit ? (
          <span
            style={{
              fontFamily: 'var(--font-family-body)',
              fontSize: '14px',
              fontWeight: 400,
              color: 'var(--tf-muted)',
              marginLeft: '6px',
            }}
          >
            {unit}
          </span>
        ) : null}
      </div>
    </div>
  );
}
