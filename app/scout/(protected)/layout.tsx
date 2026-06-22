import ScoutHeader from '@/components/features/ScoutHeader';

/**
 * Protected Scout Layout — wraps all authenticated scout routes.
 * Auth enforcement is handled by proxy.ts.
 * This layout only provides the shared UI shell (header).
 */
export default function ProtectedScoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={styles.shell}>
      <ScoutHeader userEmail="scout@hazina.co.ke" />
      <main style={styles.main}>{children}</main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    minHeight: '100vh',
    backgroundColor: 'var(--color-dark-bg)',
    display: 'flex',
    flexDirection: 'column',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
};
