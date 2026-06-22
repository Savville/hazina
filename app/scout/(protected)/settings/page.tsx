import { createServerClient } from '@/lib/supabase-server';
import Link from 'next/link';

export default async function ScoutSettingsPage() {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('scout_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  const approvalRate = profile && profile.submissions_count > 0
    ? Math.round((profile.approved_count / profile.submissions_count) * 100)
    : 0;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Profile & Settings</h1>
        <p style={styles.subtitle}>Manage your scout account details.</p>
      </div>

      <div style={styles.card}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Identity Details</h2>
          {profile?.status === 'active' && (
            <span style={styles.badgeSafe}>Active Scout</span>
          )}
          {profile?.status === 'pending' && (
            <span style={styles.badgeWarning}>Pending Approval</span>
          )}
          {profile?.status === 'suspended' && (
            <span style={styles.badgeDanger}>Suspended</span>
          )}
        </div>
        
        <div style={styles.detailRow}>
          <span style={styles.label}>Full Name</span>
          <span style={styles.value}>{profile?.full_name || user?.user_metadata?.full_name || 'N/A'}</span>
        </div>
        
        <div style={styles.detailRow}>
          <span style={styles.label}>Email Address</span>
          <span style={styles.value}>{user?.email}</span>
        </div>

        <div style={styles.detailRow}>
          <span style={styles.label}>Phone Number</span>
          <span style={styles.value}>{profile?.phone || 'N/A'}</span>
        </div>

        <div style={styles.detailRow}>
          <span style={styles.label}>National ID</span>
          <span style={styles.value}>{profile?.national_id || 'N/A'}</span>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Area of Operation</h2>
        </div>
        
        <div style={styles.detailRow}>
          <span style={styles.label}>County</span>
          <span style={styles.value}>{profile?.county || 'N/A'}</span>
        </div>
        
        <div style={styles.detailRow}>
          <span style={styles.label}>Sub-county / Town</span>
          <span style={styles.value}>{profile?.sub_county || 'N/A'}</span>
        </div>
      </div>

      {profile?.status === 'active' && (
        <div style={styles.card}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Performance Stats</h2>
          </div>
          
          <div style={styles.detailRow}>
            <span style={styles.label}>Total Reports Submitted</span>
            <span style={styles.value}>{profile.submissions_count}</span>
          </div>
          
          <div style={styles.detailRow}>
            <span style={styles.label}>Approved Reports</span>
            <span style={styles.value}>{profile.approved_count}</span>
          </div>

          <div style={styles.detailRow}>
            <span style={styles.label}>Data Quality Rating</span>
            <span style={{ ...styles.value, color: approvalRate >= 70 ? '#22c55e' : 'var(--color-primary)' }}>
              {approvalRate}%
            </span>
          </div>
        </div>
      )}

      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <form action="/api/scout/sign-out" method="POST" style={{ width: '100%' }}>
          <button type="submit" style={styles.signOutButton}>
            Sign Out of Hazina
          </button>
        </form>

        <Link href="/scout/dashboard" style={styles.backButton}>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: '1.5rem 1.25rem 6rem',
    maxWidth: '600px',
    marginInline: 'auto',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  title: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--color-text-inverse)',
    margin: 0,
  },
  subtitle: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.9rem',
    color: 'var(--color-text-muted)',
    margin: 0,
  },
  card: {
    backgroundColor: 'var(--color-dark-surface)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 'var(--radius-lg)',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  },
  sectionTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.125rem',
    fontWeight: 600,
    color: 'var(--color-text-inverse)',
    margin: 0,
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: 'var(--font-body)',
    fontSize: '0.9375rem',
  },
  label: {
    color: 'var(--color-text-muted)',
  },
  value: {
    color: 'var(--color-text-inverse)',
    fontWeight: 500,
    textAlign: 'right',
  },
  badgeSafe: {
    fontSize: '0.75rem',
    fontWeight: 600,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    color: '#22c55e',
    padding: '0.25rem 0.5rem',
    borderRadius: '9999px',
    border: '1px solid rgba(34, 197, 94, 0.2)',
  },
  badgeWarning: {
    fontSize: '0.75rem',
    fontWeight: 600,
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    color: '#eab308',
    padding: '0.25rem 0.5rem',
    borderRadius: '9999px',
    border: '1px solid rgba(234, 179, 8, 0.2)',
  },
  badgeDanger: {
    fontSize: '0.75rem',
    fontWeight: 600,
    backgroundColor: 'rgba(214, 0, 28, 0.1)',
    color: 'var(--color-primary)',
    padding: '0.25rem 0.5rem',
    borderRadius: '9999px',
    border: '1px solid rgba(214, 0, 28, 0.2)',
  },
  signOutButton: {
    width: '100%',
    padding: '0.875rem',
    backgroundColor: 'transparent',
    color: 'var(--color-primary)',
    border: '1px solid var(--color-primary)',
    borderRadius: 'var(--radius-pill)',
    fontFamily: 'var(--font-body)',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 200ms ease',
  },
  backButton: {
    width: '100%',
    padding: '0.875rem',
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: 'var(--color-text-inverse)',
    border: 'none',
    borderRadius: 'var(--radius-pill)',
    fontFamily: 'var(--font-body)',
    fontSize: '1rem',
    fontWeight: 600,
    textAlign: 'center',
    textDecoration: 'none',
    cursor: 'pointer',
  },
};
