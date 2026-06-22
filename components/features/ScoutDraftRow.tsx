interface ScoutDraftRowProps {
  id: string;
  landUse: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
}

const LAND_USE_LABELS: Record<string, string> = {
  agricultural: 'Agricultural',
  commercial:   'Commercial',
  industrial:   'Industrial',
  residential:  'Residential',
};

const LAND_USE_COLORS: Record<string, string> = {
  agricultural: '#16a34a',
  commercial:   '#2563eb',
  industrial:   '#d97706',
  residential:  'var(--color-primary)',
};

/**
 * ScoutDraftRow — renders a single draft report entry in the Drafts list.
 */
export default function ScoutDraftRow({
  id,
  landUse,
  latitude,
  longitude,
  createdAt,
}: ScoutDraftRowProps) {
  const label = landUse ? (LAND_USE_LABELS[landUse] ?? landUse) : 'No type set';
  const badgeColor =
    landUse
      ? (LAND_USE_COLORS[landUse] ?? 'var(--color-text-muted)')
      : 'var(--color-text-muted)';

  const location =
    latitude !== null && longitude !== null
      ? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
      : 'No location set';

  const date = new Date(createdAt).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div style={styles.row}>
      <div style={styles.left}>
        <span
          style={{
            ...styles.badge,
            backgroundColor: badgeColor + '22',
            color: badgeColor,
            border: `1px solid ${badgeColor}44`,
          }}
        >
          {label}
        </span>
        <span style={styles.location}>{location}</span>
        <span style={styles.date}>{date}</span>
      </div>
      <a href={`/scout/map?draft=${id}`} style={styles.continueBtn}>
        Continue
      </a>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.875rem 1rem',
    backgroundColor: 'var(--color-dark-surface)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 'var(--radius-md)',
    gap: '0.75rem',
  },
  left: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    flex: 1,
    minWidth: 0,
  },
  badge: {
    alignSelf: 'flex-start',
    fontFamily: 'var(--font-body)',
    fontSize: '0.6875rem',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    borderRadius: 'var(--radius-pill)',
    padding: '0.175rem 0.625rem',
  },
  location: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.8125rem',
    color: 'var(--color-text-inverse)',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  date: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.75rem',
    color: 'var(--color-text-muted)',
  },
  continueBtn: {
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    color: 'var(--color-text-muted)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 'var(--radius-md)',
    padding: '0.4rem 0.875rem',
    fontFamily: 'var(--font-body)',
    fontSize: '0.8125rem',
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'border-color 200ms ease, color 200ms ease',
  },
};
