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

      {/* Right side — Profile & Settings */}
      <Link href="/scout/settings" style={styles.profileLink}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: 0.8 }}
        >
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span style={styles.email}>{displayEmail}</span>
      </Link>
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
  profileLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textDecoration: 'none',
    color: 'var(--color-text-muted)',
    padding: '0.4rem 0.6rem',
    borderRadius: 'var(--radius-sm)',
    transition: 'background-color 200ms ease, color 200ms ease',
  },
  email: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
};
