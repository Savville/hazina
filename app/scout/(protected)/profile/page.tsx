'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';

// Kenya counties list (abbreviated — extend as needed)
const KENYA_COUNTIES = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet',
  'Embu', 'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado',
  'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga',
  'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia',
  'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit',
  'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi',
  'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua',
  'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River',
  'Tharaka-Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu',
  'Vihiga', 'Wajir', 'West Pokot',
];

interface FormState {
  full_name: string;
  national_id: string;
  phone: string;
  county: string;
  sub_county: string;
  motivation: string;
}

const EMPTY_FORM: FormState = {
  full_name: '',
  national_id: '',
  phone: '',
  county: '',
  sub_county: '',
  motivation: '',
};

export default function ScoutProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  // If profile is already submitted, redirect to dashboard
  useEffect(() => {
    async function checkExistingProfile() {
      const supabase = createBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/scout/login'); return; }

      const { data: profile } = await supabase
        .from('scout_profiles')
        .select('id, status')
        .eq('id', user.id)
        .single();

      if (profile) {
        // Profile already exists — send to dashboard
        router.replace('/scout/dashboard');
        return;
      }

      // Pre-fill name from auth metadata if available
      const name = user.user_metadata?.full_name ?? '';
      setForm(prev => ({ ...prev, full_name: name }));
      setCheckingProfile(false);
    }
    checkExistingProfile();
  }, [router]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!form.full_name.trim()) { setError('Full name is required.'); return; }
    if (!/^\d{8}$/.test(form.national_id)) { setError('National ID must be exactly 8 digits.'); return; }
    if (!/^(\+254|0)[7][0-9]{8}$/.test(form.phone.replace(/\s/g, ''))) {
      setError('Enter a valid Kenyan phone number (e.g. 0712345678).'); return;
    }
    if (!form.county) { setError('Select your primary county of operation.'); return; }
    if (!form.sub_county.trim()) { setError('Sub-county is required.'); return; }
    if (form.motivation.trim().length < 30) {
      setError('Please write at least 30 characters explaining why you want to scout.'); return;
    }

    setLoading(true);

    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('Session expired. Please sign in again.');
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from('scout_profiles')
      .insert({
        id: user.id,
        full_name: form.full_name.trim(),
        national_id: form.national_id.trim(),
        phone: form.phone.trim(),
        county: form.county,
        sub_county: form.sub_county.trim(),
        motivation: form.motivation.trim(),
        status: 'pending',
        submissions_count: 0,
        approved_count: 0,
      });

    setLoading(false);

    if (insertError) {
      setError('Failed to save your profile. Please try again.');
      return;
    }

    router.replace('/scout/dashboard');
  }

  if (checkingProfile) {
    return (
      <div style={styles.loadingPage}>
        <p style={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Complete Your Profile</h1>
        <p style={styles.subtitle}>
          Before you can submit field reports, we need to verify your
          identity. This takes 2 minutes and is a one-time step.
        </p>
      </div>

      {/* Progress indicator */}
      <div style={styles.stepsRow}>
        <div style={{ ...styles.step, ...styles.stepDone }}>1. Registered</div>
        <div style={styles.stepConnector} />
        <div style={{ ...styles.step, ...styles.stepActive }}>2. Profile</div>
        <div style={styles.stepConnector} />
        <div style={styles.step}>3. Field Ready</div>
      </div>

      <form onSubmit={handleSubmit} style={styles.form} noValidate>
        {/* Full Name */}
        <div style={styles.fieldGroup}>
          <label htmlFor="full_name" style={styles.label}>Full legal name</label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            maxLength={80}
            value={form.full_name}
            onChange={handleChange}
            style={styles.input}
            placeholder="As on your National ID"
          />
        </div>

        {/* National ID */}
        <div style={styles.fieldGroup}>
          <label htmlFor="national_id" style={styles.label}>National ID number</label>
          <input
            id="national_id"
            name="national_id"
            type="text"
            required
            maxLength={8}
            inputMode="numeric"
            value={form.national_id}
            onChange={handleChange}
            style={styles.input}
            placeholder="8-digit number"
          />
        </div>

        {/* Phone */}
        <div style={styles.fieldGroup}>
          <label htmlFor="phone" style={styles.label}>Phone number (M-Pesa / WhatsApp)</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            maxLength={13}
            value={form.phone}
            onChange={handleChange}
            style={styles.input}
            placeholder="0712 345 678"
          />
        </div>

        {/* County */}
        <div style={styles.fieldGroup}>
          <label htmlFor="county" style={styles.label}>Primary county of operation</label>
          <select
            id="county"
            name="county"
            required
            value={form.county}
            onChange={handleChange}
            style={styles.select}
          >
            <option value="">Select county...</option>
            {KENYA_COUNTIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Sub-county */}
        <div style={styles.fieldGroup}>
          <label htmlFor="sub_county" style={styles.label}>Sub-county / Town</label>
          <input
            id="sub_county"
            name="sub_county"
            type="text"
            required
            maxLength={60}
            value={form.sub_county}
            onChange={handleChange}
            style={styles.input}
            placeholder="e.g. Ruaka, Kitengela, Juja"
          />
        </div>

        {/* Motivation */}
        <div style={styles.fieldGroup}>
          <label htmlFor="motivation" style={styles.label}>
            Why do you want to become a Hazina scout?
            <span style={styles.charCount}>{form.motivation.length} / 300</span>
          </label>
          <textarea
            id="motivation"
            name="motivation"
            required
            maxLength={300}
            rows={4}
            value={form.motivation}
            onChange={handleChange}
            style={styles.textarea}
            placeholder="Describe your knowledge of your area, experience with land, and why you want to join the Hazina network."
          />
        </div>

        {error && (
          <p id="profile-error" style={styles.errorMessage}>{error}</p>
        )}

        <button
          id="profile-submit-btn"
          type="submit"
          disabled={loading}
          style={{
            ...styles.submitButton,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Saving profile...' : 'Submit Profile'}
        </button>

        <p style={styles.disclaimer}>
          Your National ID is stored securely and used only for identity
          verification. It is never shared publicly.
        </p>
      </form>
    </div>
  );
}

// ============================================================
// Styles
// ============================================================

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: 'var(--color-dark-bg)',
    padding: '2rem 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    maxWidth: '480px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box',
  },
  loadingPage: {
    minHeight: '60vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: 'var(--font-body)',
    color: 'var(--color-text-muted)',
    fontSize: '0.9rem',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
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
    lineHeight: 1.6,
  },
  stepsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  step: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.75rem',
    color: 'var(--color-text-muted)',
    whiteSpace: 'nowrap' as const,
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
  },
  stepDone: {
    color: '#22c55e',
  },
  stepActive: {
    color: 'var(--color-text-inverse)',
    backgroundColor: 'var(--color-primary)',
    fontWeight: 600,
  },
  stepConnector: {
    flex: 1,
    height: '1px',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    backgroundColor: 'var(--color-dark-surface)',
    borderRadius: 'var(--radius-lg)',
    padding: '1.5rem',
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCount: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.3)',
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
    boxSizing: 'border-box' as const,
  },
  select: {
    width: '100%',
    padding: '0.75rem 1rem',
    backgroundColor: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-text-inverse)',
    fontFamily: 'var(--font-body)',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box' as const,
    appearance: 'none' as const,
  },
  textarea: {
    width: '100%',
    padding: '0.75rem 1rem',
    backgroundColor: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-text-inverse)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.9rem',
    outline: 'none',
    resize: 'vertical' as const,
    lineHeight: 1.6,
    boxSizing: 'border-box' as const,
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
    transition: 'background-color 200ms ease',
  },
  disclaimer: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center' as const,
    margin: 0,
    lineHeight: 1.5,
  },
};
