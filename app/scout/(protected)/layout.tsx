import { createServerClient } from '@/lib/supabase-server';
import ScoutHeader from '@/components/features/ScoutHeader';

/**
 * Protected Scout Layout — wraps all authenticated scout routes.
 * Auth enforcement is handled by middleware.ts.
 * This layout fetches the real session user and passes their email
 * to the shared header.
 */
export default async function ProtectedScoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayEmail =
    user?.user_metadata?.full_name ?? user?.email ?? 'Scout';

  return (
    <div style={styles.shell}>
      <ScoutHeader userEmail={displayEmail} />
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
