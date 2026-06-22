import ScoutHeader from '@/components/features/ScoutHeader';

/**
 * Protected Scout Layout — wraps all authenticated scout routes.
 * Auth enforcement is handled by proxy.ts (Next.js 16 edge middleware).
 *
 * The ScoutHeader receives a static placeholder here.
 * Once the session API route is wired, we will pass the real user email.
 * Do NOT make this layout async or call Supabase here — it blocks rendering.
 */
export default function ProtectedScoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={styles.shell}>
      <ScoutHeader userEmail="Scout" />
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
