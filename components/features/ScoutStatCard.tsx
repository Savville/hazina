interface ScoutStatCardProps {
  label: string;
  value: number;
  accentColor?: string;
}

/**
 * ScoutStatCard — displays a single numeric stat with a label.
 * Used in the dashboard stats row.
 */
export default function ScoutStatCard({
  label,
  value,
  accentColor = 'var(--color-primary)',
}: ScoutStatCardProps) {
  return (
    <div style={styles.card}>
      <span style={{ ...styles.value, color: accentColor }}>
        {value}
      </span>
      <span style={styles.label}>{label}</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    flex: '1 1 0',
    minWidth: '100px',
    backgroundColor: 'var(--color-dark-surface)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 'var(--radius-md)',
    padding: '1rem 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  value: {
    fontFamily: 'var(--font-heading)',
    fontSize: '2rem',
    fontWeight: 700,
    lineHeight: 1,
  },
  label: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.8125rem',
    color: 'var(--color-text-muted)',
    fontWeight: 500,
  },
};
