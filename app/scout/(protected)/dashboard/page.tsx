import Link from 'next/link';
import ScoutStatCard from '@/components/features/ScoutStatCard';
import ScoutDraftRow from '@/components/features/ScoutDraftRow';

/**
 * Scout Dashboard — UI preview mode with static mock data.
 * Supabase queries will be re-enabled once credentials are confirmed working.
 */

const MOCK_AREAS = [
  { id: '1', name: 'Ruai Corridor', county: 'Nairobi' },
  { id: '2', name: 'Kamulu East', county: 'Nairobi' },
  { id: '3', name: 'Joska Township', county: 'Machakos' },
];

const MOCK_DRAFTS = [
  {
    id: 'draft-1',
    landUse: 'agricultural',
    latitude: -1.28530,
    longitude: 36.92410,
    createdAt: '2026-06-20T09:14:00Z',
  },
  {
    id: 'draft-2',
    landUse: 'residential',
    latitude: -1.30110,
    longitude: 36.95230,
    createdAt: '2026-06-19T14:37:00Z',
  },
  {
    id: 'draft-3',
    landUse: 'commercial',
    latitude: null,
    longitude: null,
    createdAt: '2026-06-18T11:05:00Z',
  },
];

export default function ScoutDashboardPage() {
  return (
    <div style={styles.page}>
      {/* Greeting */}
      <section style={styles.greetingSection}>
        <h1 style={styles.greeting}>Welcome back, scout.</h1>
        <p style={styles.greetingSub}>Here is your field activity summary.</p>
      </section>

      {/* Stats Row */}
      <section style={styles.section}>
        <div style={styles.statsRow}>
          <ScoutStatCard label="Submissions" value={7} />
          <ScoutStatCard
            label="Drafts"
            value={3}
            accentColor="rgba(255,255,255,0.85)"
          />
          <ScoutStatCard
            label="Areas Assigned"
            value={3}
            accentColor="rgba(255,255,255,0.5)"
          />
        </div>
      </section>

      {/* Assigned Areas */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Your Areas</h2>
        </div>
        <div style={styles.list}>
          {MOCK_AREAS.map((area) => (
            <div key={area.id} style={styles.areaRow}>
              <div style={styles.areaInfo}>
                <span style={styles.areaName}>{area.name}</span>
                <span style={styles.areaCounty}>{area.county} County</span>
              </div>
              <Link
                href={`/scout/form?area=${area.id}`}
                style={styles.startBtn}
              >
                Start Assessment
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Drafts */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Recent Drafts</h2>
        </div>
        <div style={styles.list}>
          {MOCK_DRAFTS.map((draft) => (
            <ScoutDraftRow
              key={draft.id}
              id={draft.id}
              landUse={draft.landUse}
              latitude={draft.latitude}
              longitude={draft.longitude}
              createdAt={draft.createdAt}
            />
          ))}
        </div>
      </section>

      {/* Floating CTA */}
      <Link href="/scout/form" style={styles.fab}>
        New Assessment
      </Link>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: '1.5rem 1.25rem 6rem',
    maxWidth: '720px',
    marginInline: 'auto',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  greetingSection: {
    paddingTop: '0.5rem',
  },
  greeting: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.625rem',
    fontWeight: 700,
    color: 'var(--color-text-inverse)',
    margin: '0 0 0.25rem',
  },
  greetingSub: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.9rem',
    color: 'var(--color-text-muted)',
    margin: 0,
  },
  statsRow: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--color-text-inverse)',
    margin: 0,
    letterSpacing: '0.01em',
    textTransform: 'uppercase',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  areaRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.875rem 1rem',
    backgroundColor: 'var(--color-dark-surface)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 'var(--radius-md)',
    gap: '0.75rem',
  },
  areaInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    flex: 1,
    minWidth: 0,
  },
  areaName: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: 'var(--color-text-inverse)',
  },
  areaCounty: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.8125rem',
    color: 'var(--color-text-muted)',
  },
  startBtn: {
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-text-inverse)',
    border: 'none',
    borderRadius: 'var(--radius-pill)',
    padding: '0.45rem 1rem',
    fontFamily: 'var(--font-body)',
    fontSize: '0.8125rem',
    fontWeight: 600,
    textDecoration: 'none',
    transition: 'background-color 200ms ease',
  },
  emptyState: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.875rem',
    color: 'var(--color-text-muted)',
    margin: 0,
    padding: '1rem',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 'var(--radius-md)',
    border: '1px dashed rgba(255,255,255,0.1)',
    textAlign: 'center',
  },
  fab: {
    position: 'fixed',
    bottom: '1.5rem',
    right: '1.25rem',
    zIndex: 200,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-text-inverse)',
    borderRadius: 'var(--radius-pill)',
    padding: '0.75rem 1.375rem',
    fontFamily: 'var(--font-body)',
    fontSize: '0.9375rem',
    fontWeight: 600,
    textDecoration: 'none',
    boxShadow: '0 4px 20px rgba(214, 0, 28, 0.4)',
    transition: 'background-color 200ms ease, transform 150ms ease',
  },
};
