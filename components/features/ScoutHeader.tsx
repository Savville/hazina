'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface ScoutHeaderProps {
  userEmail: string;
}

/**
 * ScoutHeader — sticky top bar shared across all scout routes.
 * Receives the authenticated user email from the Server Component layout.
 */
export default function ScoutHeader({ userEmail }: ScoutHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const displayEmail =
    userEmail.length > 24 ? userEmail.slice(0, 22) + '...' : userEmail;

  const showBack = pathname !== '/scout/dashboard';

  return (
    <header style={styles.header}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {showBack && (
          <button onClick={() => router.back()} style={styles.backBtn} aria-label="Go back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span style={styles.backText}>Back</span>
          </button>
        )}
        {/* Wordmark */}
        <Link href="/scout/dashboard" style={styles.wordmark}>
          Hazina
        </Link>
      </div>

      {/* Right side — Profile & Settings */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/" style={styles.publicLink} title="Return to Public Site">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
          <span style={styles.publicText}>Public Site</span>
        </Link>

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
  publicLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    textDecoration: 'none',
    color: 'var(--color-text-muted)',
    padding: '0.4rem 0.6rem',
    borderRadius: 'var(--radius-sm)',
    transition: 'background-color 200ms ease, color 200ms ease',
  },
  publicText: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.8125rem',
    fontWeight: 500,
    display: 'none', // Hide on very small screens, show icon only
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
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    background: 'none',
    border: 'none',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
    padding: '0.25rem 0.5rem 0.25rem 0',
    transition: 'color 150ms ease',
  },
  backText: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.9375rem',
    fontWeight: 500,
  }
};

// Global style to handle media query for publicText
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @media (min-width: 600px) {
      span[style*="font-size: 0.8125rem"][style*="display: none"] {
        display: inline !important;
      }
    }
  `;
  document.head.appendChild(style);
}
