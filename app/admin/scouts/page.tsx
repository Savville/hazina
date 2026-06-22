'use client';

import { useState, useEffect } from 'react';
import type { ScoutProfile } from '@/types';

import { createBrowserClient } from '@/lib/supabase';

type Tab = 'applicants' | 'active';

export default function ManageScoutsPage() {
  const [tab, setTab] = useState<Tab>('applicants');
  const [profiles, setProfiles] = useState<ScoutProfile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Supabase Client
  const supabase = createBrowserClient();

  // Fetch data on mount
  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from('scout_profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching scout profiles:', error);
      } else if (data) {
        setProfiles(data as ScoutProfile[]);
      }
      setIsLoading(false);
    };
    fetchProfiles();
  });

  const pending = profiles.filter(p => p.status === 'pending');
  const active = profiles.filter(p => p.status === 'active');
  const suspended = profiles.filter(p => p.status === 'suspended');
  const selectedProfile = profiles.find(p => p.id === selectedId) ?? null;

  async function handleApprove(id: string) {
    const { error } = await supabase.from('scout_profiles').update({ status: 'active' }).eq('id', id);
    if (!error) {
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, status: 'active' } : p));
      setSelectedId(null);
    } else {
      alert('Failed to approve scout.');
    }
  }

  async function handleReject(id: string) {
    if (!confirm('Reject and remove this applicant? This cannot be undone.')) return;
    const { error } = await supabase.from('scout_profiles').delete().eq('id', id);
    if (!error) {
      setProfiles(prev => prev.filter(p => p.id !== id));
      setSelectedId(null);
    }
  }

  async function handleSuspend(id: string) {
    if (!confirm('Suspend this scout? They will lose access to the app immediately.')) return;
    const { error } = await supabase.from('scout_profiles').update({ status: 'suspended' }).eq('id', id);
    if (!error) {
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, status: 'suspended' } : p));
      setSelectedId(null);
    }
  }

  async function handleReinstate(id: string) {
    const { error } = await supabase.from('scout_profiles').update({ status: 'active' }).eq('id', id);
    if (!error) {
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, status: 'active' } : p));
    }
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
          {isLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Loading scouts from database...
            </div>
          ) : tab === 'applicants' && (
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
