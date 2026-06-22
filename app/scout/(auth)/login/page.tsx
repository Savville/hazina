'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase';

export default function ScoutLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createBrowserClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push('/scout/dashboard');
  }

  return (
    <div style={styles.page}>
      {/* Wordmark */}
      <h1 style={styles.wordmark}>Hazina</h1>
      <p style={styles.tagline}>Scout Field Application</p>

      {/* Login card */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Sign In</h2>
        <p style={styles.cardSubtitle}>
          Enter your scout credentials to continue.
        </p>

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <div style={styles.fieldGroup}>
            <label htmlFor="scout-email" style={styles.label}>
              Email address
            </label>
            <input
              id="scout-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="you@hazina.co.ke"
            />
          </div>

          <div style={styles.fieldGroup}>
            <label htmlFor="scout-password" style={styles.label}>
              Password
            </label>
            <input
              id="scout-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p id="scout-login-error" style={styles.errorMessage}>
              {error}
            </p>
          )}

          <button
            id="scout-login-btn"
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitButton,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p style={styles.registerPrompt}>
            Don&apos;t have an account?{' '}
            <Link href="/scout/register" style={styles.registerLink}>
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Styles — all values reference CSS custom property tokens
// ============================================================

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--color-dark-bg)',
    padding: '1.5rem',
    gap: '0.5rem',
  },
  wordmark: {
    fontFamily: 'var(--font-heading)',
    fontSize: '2.5rem',
    fontWeight: 700,
    color: 'var(--color-text-inverse)',
    letterSpacing: '-0.02em',
    margin: 0,
  },
  tagline: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.875rem',
    color: 'var(--color-text-muted)',
    margin: '0 0 2rem',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: 'var(--color-dark-surface)',
    borderRadius: 'var(--radius-lg)',
    padding: '2rem',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  },
  cardTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--color-text-inverse)',
    margin: '0 0 0.375rem',
  },
  cardSubtitle: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.9rem',
    color: 'var(--color-text-muted)',
    margin: '0 0 1.75rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  label: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--color-text-muted)',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    backgroundColor: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-text-inverse)',
    fontFamily: 'var(--font-body)',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 200ms ease',
  },
  errorMessage: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.875rem',
    color: 'var(--color-primary)',
    margin: 0,
    padding: '0.5rem 0.75rem',
    backgroundColor: 'rgba(214, 0, 28, 0.12)',
    borderRadius: 'var(--radius-sm)',
    borderLeft: '3px solid var(--color-primary)',
  },
  submitButton: {
    width: '100%',
    padding: '0.875rem',
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-text-inverse)',
    border: 'none',
    borderRadius: 'var(--radius-pill)',
    fontFamily: 'var(--font-body)',
    fontSize: '1rem',
    fontWeight: 600,
    transition: 'background-color 200ms ease, transform 150ms ease',
    marginTop: '0.25rem',
  },
  registerPrompt: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.875rem',
    color: 'var(--color-text-muted)',
    textAlign: 'center' as const,
    margin: 0,
  },
  registerLink: {
    color: 'var(--color-primary)',
    textDecoration: 'none',
    fontWeight: 500,
  },
};
