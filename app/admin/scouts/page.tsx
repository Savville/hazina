'use client';

import { useState } from 'react';
import type { ScoutProfile } from '@/types';

// MOCK DATA — replace with Supabase query once scout_profiles table is live
const MOCK_PROFILES: ScoutProfile[] = [
  {
    id: 'usr-001',
    full_name: 'William Otieno',
    national_id: '34521098',
    phone: '0712 345 678',
    county: 'Kiambu',
    sub_county: 'Ruaka',
    motivation: 'I have lived in Ruaka for 12 years and know every plot boundary. I want to bring ground truth to property buyers.',
    status: 'active',
    submissions_count: 14,
    approved_count: 11,
    created_at: '2026-06-10T08:00:00Z',
    updated_at: '2026-06-10T08:00:00Z',
  },
  {
    id: 'usr-002',
    full_name: 'Sarah Muthoni',
    national_id: '29871234',
    phone: '0734 567 890',
    county: 'Machakos',
    sub_county: 'Athi River',
    motivation: 'I am a land surveyor by training and want to contribute accurate field data to help buyers avoid fraud.',
    status: 'active',
    submissions_count: 8,
    approved_count: 8,
    created_at: '2026-06-12T10:00:00Z',
    updated_at: '2026-06-12T10:00:00Z',
  },
  {
    id: 'usr-003',
    full_name: 'James Kariuki',
    national_id: '41234567',
    phone: '0798 765 432',
    county: 'Kajiado',
    sub_county: 'Kitengela',
    motivation: 'I have been selling land in Kitengela for 3 years and want to provide honest data to Hazina clients.',
    status: 'pending',
    submissions_count: 0,
    approved_count: 0,
    created_at: '2026-06-22T07:00:00Z',
    updated_at: '2026-06-22T07:00:00Z',
  },
  {
    id: 'usr-004',
    full_name: 'Amina Hassan',
    national_id: '38904512',
    phone: '0711 234 567',
    county: 'Mombasa',
    sub_county: 'Likoni',
    motivation: 'I want to help investors understand the real ground situation in coastal land before they buy.',
    status: 'pending',
    submissions_count: 0,
    approved_count: 0,
    created_at: '2026-06-22T09:30:00Z',
    updated_at: '2026-06-22T09:30:00Z',
  },
];

type Tab = 'applicants' | 'active';

export default function ManageScoutsPage() {
  const [tab, setTab] = useState<Tab>('applicants');
  const [profiles, setProfiles] = useState<ScoutProfile[]>(MOCK_PROFILES);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const pending = profiles.filter(p => p.status === 'pending');
  const active = profiles.filter(p => p.status === 'active');
  const suspended = profiles.filter(p => p.status === 'suspended');
  const selectedProfile = profiles.find(p => p.id === selectedId) ?? null;

  function handleApprove(id: string) {
    setProfiles(prev =>
      prev.map(p => p.id === id ? { ...p, status: 'active' } : p),
    );
    setSelectedId(null);
  }

  function handleReject(id: string) {
    if (!confirm('Reject and remove this applicant? This cannot be undone.')) return;
    setProfiles(prev => prev.filter(p => p.id !== id));
    setSelectedId(null);
  }

  function handleSuspend(id: string) {
    if (!confirm('Suspend this scout? They will lose access to the app immediately.')) return;
    setProfiles(prev =>
      prev.map(p => p.id === id ? { ...p, status: 'suspended' } : p),
    );
    setSelectedId(null);
  }

  function handleReinstate(id: string) {
    setProfiles(prev =>
      prev.map(p => p.id === id ? { ...p, status: 'active' } : p),
    );
  }

  const approvalRate = (s: ScoutProfile) =>
    s.submissions_count > 0
      ? Math.round((s.approved_count / s.submissions_count) * 100)
      : 0;

  return (
    <div className="hz-admin-page">
      <header className="hz-admin-header-main">
        <h1>Scout Roster</h1>
        <p>
          Applicants must be approved before they can submit field reports.
          Monitor active scouts and suspend if data quality falls below standard.
        </p>
      </header>

      {/* Tab bar */}
      <div style={styles.tabBar}>
        <button
          id="tab-applicants"
          style={{
            ...styles.tab,
            ...(tab === 'applicants' ? styles.tabActive : {}),
          }}
          onClick={() => setTab('applicants')}
        >
          Applicants
          {pending.length > 0 && (
            <span style={styles.badge}>{pending.length}</span>
          )}
        </button>
        <button
          id="tab-active"
          style={{
            ...styles.tab,
            ...(tab === 'active' ? styles.tabActive : {}),
          }}
          onClick={() => setTab('active')}
        >
          Active Scouts
          <span style={styles.badgeMuted}>{active.length}</span>
        </button>
        {suspended.length > 0 && (
          <button
            id="tab-suspended"
            style={{
              ...styles.tab,
              ...(tab === ('suspended' as Tab) ? styles.tabActive : {}),
            }}
            onClick={() => setTab('suspended' as Tab)}
          >
            Suspended
            <span style={{ ...styles.badge, backgroundColor: 'var(--color-primary)' }}>
              {suspended.length}
            </span>
          </button>
        )}
      </div>

      <div className="hz-admin-content">
        {/* TABLE */}
        <div className="hz-admin-table-container">
          {tab === 'applicants' && (
            <>
              {pending.length === 0 ? (
                <div style={styles.emptyState}>
                  <p style={styles.emptyText}>No pending applicants.</p>
                </div>
              ) : (
                <table className="hz-admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>County</th>
                      <th>Phone</th>
                      <th>Applied</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map(p => (
                      <tr
                        key={p.id}
                        className={selectedId === p.id ? 'active-row' : ''}
                      >
                        <td><strong>{p.full_name}</strong></td>
                        <td>{p.county} / {p.sub_county}</td>
                        <td>{p.phone}</td>
                        <td>{new Date(p.created_at).toLocaleDateString('en-KE')}</td>
                        <td>
                          <button
                            className="hz-btn-outline-small"
                            onClick={() => setSelectedId(p.id)}
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}

          {tab === 'active' && (
            <>
              {active.length === 0 ? (
                <div style={styles.emptyState}>
                  <p style={styles.emptyText}>No active scouts yet.</p>
                </div>
              ) : (
                <table className="hz-admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>County</th>
                      <th>Reports</th>
                      <th>Approval Rate</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {active.map(p => (
                      <tr
                        key={p.id}
                        className={selectedId === p.id ? 'active-row' : ''}
                      >
                        <td>
                          <strong>{p.full_name}</strong>
                          <span className="badge-safe" style={{ marginLeft: '0.5rem' }}>
                            Active
                          </span>
                        </td>
                        <td>{p.county}</td>
                        <td>{p.submissions_count}</td>
                        <td>
                          <span style={{
                            color: approvalRate(p) >= 70 ? '#22c55e' : 'var(--color-primary)',
                            fontWeight: 600,
                          }}>
                            {approvalRate(p)}%
                          </span>
                        </td>
                        <td style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="hz-btn-outline-small"
                            onClick={() => setSelectedId(p.id)}
                          >
                            View
                          </button>
                          <button
                            className="hz-btn-outline-small"
                            style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                            onClick={() => handleSuspend(p.id)}
                          >
                            Suspend
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>

        {/* SIDE PANEL */}
        {selectedProfile && (
          <div className="hz-admin-sidepanel">
            <div className="hz-panel-header">
              <h3>
                {selectedProfile.status === 'pending' ? 'Applicant Review' : 'Scout Profile'}
              </h3>
              <button onClick={() => setSelectedId(null)} className="hz-close-btn">
                x
              </button>
            </div>

            <div className="hz-panel-body" style={{ overflowY: 'auto', flexGrow: 1 }}>
              <div className="hz-panel-section">
                <h4>Identity</h4>
                <p>Name: <strong>{selectedProfile.full_name}</strong></p>
                <p>National ID: <strong>{selectedProfile.national_id}</strong></p>
                <p>Phone: <strong>{selectedProfile.phone}</strong></p>
              </div>

              <div className="hz-panel-section">
                <h4>Area of Operation</h4>
                <p>County: <strong>{selectedProfile.county}</strong></p>
                <p>Sub-county: <strong>{selectedProfile.sub_county}</strong></p>
              </div>

              <div className="hz-panel-section">
                <h4>Motivation Statement</h4>
                <p style={{ fontStyle: 'italic', lineHeight: 1.6, color: 'var(--color-text-muted)' }}>
                  &ldquo;{selectedProfile.motivation}&rdquo;
                </p>
              </div>

              {selectedProfile.status === 'active' && (
                <div className="hz-panel-section">
                  <h4>Performance</h4>
                  <p>Total submissions: <strong>{selectedProfile.submissions_count}</strong></p>
                  <p>Approved reports: <strong>{selectedProfile.approved_count}</strong></p>
                  <p>Approval rate: <strong>{approvalRate(selectedProfile)}%</strong></p>
                </div>
              )}

              {/* Actions */}
              {selectedProfile.status === 'pending' && (
                <div style={styles.actionGroup}>
                  <button
                    id="btn-approve-scout"
                    className="btn-primary w-full"
                    onClick={() => handleApprove(selectedProfile.id)}
                  >
                    Approve Scout
                  </button>
                  <button
                    id="btn-reject-scout"
                    className="hz-btn-outline-small w-full"
                    style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)', marginTop: '0.75rem', padding: '0.75rem' }}
                    onClick={() => handleReject(selectedProfile.id)}
                  >
                    Reject Applicant
                  </button>
                </div>
              )}

              {selectedProfile.status === 'active' && (
                <div style={styles.actionGroup}>
                  <button
                    id="btn-suspend-scout"
                    className="hz-btn-outline-small w-full"
                    style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)', padding: '0.75rem' }}
                    onClick={() => handleSuspend(selectedProfile.id)}
                  >
                    Suspend Scout
                  </button>
                </div>
              )}

              {selectedProfile.status === 'suspended' && (
                <div style={styles.actionGroup}>
                  <button
                    id="btn-reinstate-scout"
                    className="btn-primary w-full"
                    onClick={() => handleReinstate(selectedProfile.id)}
                  >
                    Reinstate Scout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  tabBar: {
    display: 'flex',
    gap: '0.25rem',
    borderBottom: '1px solid var(--color-border)',
    marginBottom: '1.5rem',
    padding: '0 1.5rem',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    fontFamily: 'var(--font-body)',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--color-text-muted)',
    border: 'none',
    borderBottom: '2px solid transparent',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'color 150ms ease, border-color 150ms ease',
  },
  tabActive: {
    color: 'var(--color-text)',
    borderBottomColor: 'var(--color-primary)',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '20px',
    height: '20px',
    padding: '0 6px',
    backgroundColor: '#22c55e',
    color: '#fff',
    borderRadius: '9999px',
    fontSize: '0.7rem',
    fontWeight: 700,
  },
  badgeMuted: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '20px',
    height: '20px',
    padding: '0 6px',
    backgroundColor: 'var(--color-border)',
    color: 'var(--color-text-muted)',
    borderRadius: '9999px',
    fontSize: '0.7rem',
    fontWeight: 700,
  },
  emptyState: {
    padding: '3rem 2rem',
    textAlign: 'center' as const,
  },
  emptyText: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.9rem',
    color: 'var(--color-text-muted)',
  },
  actionGroup: {
    marginTop: '1.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
  },
};
