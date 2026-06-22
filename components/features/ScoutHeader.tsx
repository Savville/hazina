'use client';

import Link from 'next/link';

interface ScoutHeaderProps {
  userEmail: string;
}

/**
 * ScoutHeader — sticky top bar shared across all scout routes.
 * Receives the authenticated user email from the Server Component layout.
 */
export default function ScoutHeader({ userEmail }: ScoutHeaderProps) {
  const displayEmail =
    userEmail.length > 24 ? userEmail.slice(0, 22) + '...' : userEmail;

  return (
    <header style={styles.header}>
      {/* Wordmark */}
      <Link href="/scout/dashboard" style={styles.wordmark}>
        Hazina
      </Link>

      {/* Right side */}
      <div style={styles.right}>
        <span style={styles.email}>{displayEmail}</span>
        <form action="/api/scout/sign-out" method="POST">
          <button type="submit" style={styles.signOutBtn}>
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    height: '56px',
    backgroundColor: 'var(--color-dark-surface)',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingInline: '1.25rem',
  },
  wordmark: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.375rem',
    fontWeight: 700,
    color: 'var(--color-text-inverse)',
    letterSpacing: '-0.01em',
    textDecoration: 'none',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.875rem',
  },
  email: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.8125rem',
    color: 'var(--color-text-muted)',
  },
  signOutBtn: {
    background: 'none',
    border: 'none',
    fontFamily: 'var(--font-body)',
    fontSize: '0.8125rem',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
    padding: '0.25rem 0.5rem',
    borderRadius: 'var(--radius-sm)',
    transition: 'color 200ms ease',
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
  },
};
