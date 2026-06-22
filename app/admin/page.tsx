'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase';

export default function AdminDashboardPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchAssessments = async () => {
      const { data, error } = await supabase
        .from('scout_assessments')
        .select(`
          *,
          scout_profiles (full_name)
        `)
        .eq('status', 'pending_review')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching assessments:', error);
      } else if (data) {
        setSubmissions(data);
      }
      setIsLoading(false);
    };

    fetchAssessments();
  }, []);

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from('scout_assessments')
      .update({ status: 'verified' })
      .eq('id', id);

    if (!error) {
      setSubmissions(prev => prev.filter(s => s.id !== id));
      alert(`Assessment approved and moved to Verified queue.`);
      setSelectedId(null);
    } else {
      alert('Failed to approve assessment.');
    }
  };

  const selectedItem = submissions.find(s => s.id === selectedId);

  return (
    <div className="hz-admin-page">
      <header className="hz-admin-header-main">
        <h1>Pending Approvals</h1>
        <p>Review field intelligence submitted by scouts before publishing to the main Hazina platform.</p>
      </header>

      <div className="hz-admin-content">
        {/* DATA TABLE */}
        <div className="hz-admin-table-container">
          <table className="hz-admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Scout</th>
                <th>Property</th>
                <th>LR Number</th>
                <th>Risk Flag</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>Loading live assessments...</td>
                </tr>
              )}
              {!isLoading && submissions.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>No pending submissions.</td>
                </tr>
              )}
              {!isLoading && submissions.map((sub) => (
                <tr key={sub.id} className={selectedId === sub.id ? 'active-row' : ''}>
                  <td><span style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>{sub.id.substring(0, 8)}...</span></td>
                  <td>{new Date(sub.created_at).toLocaleDateString('en-KE')}</td>
                  <td>{sub.scout_profiles?.full_name || 'Unknown Scout'}</td>
                  <td>
                    <strong>{sub.property_name}</strong>
                    <span className="badge-category">{sub.category}</span>
                  </td>
                  <td>{sub.lr_number || <span className="hz-text-warning">Missing</span>}</td>
                  <td>
                    {sub.form_data?.has_visual_dispute ? <span className="badge-danger">Visual Dispute</span> : <span className="badge-safe">Clear</span>}
                  </td>
                  <td>
                    <button 
                      className="hz-btn-outline-small"
                      onClick={() => setSelectedId(sub.id)}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* REVIEW DRAWER / SIDE PANEL */}
        {selectedItem && (
          <div className="hz-admin-sidepanel">
            <div className="hz-panel-header">
              <h3>Assessment Details</h3>
              <button onClick={() => setSelectedId(null)} className="hz-close-btn">×</button>
            </div>
            
            <div className="hz-panel-body" style={{ overflowY: 'auto', flexGrow: 1 }}>
              <div className="hz-panel-section">
                <h4>Scout Identity</h4>
                <p>Submitted by: <strong>{selectedItem.scout_profiles?.full_name || 'Unknown Scout'}</strong></p>
                <p>Date: {new Date(selectedItem.created_at).toLocaleString('en-KE')}</p>
              </div>

              <div className="hz-panel-section">
                <h4>Physical Data (Layer 1)</h4>
                <p>Category: <strong>{selectedItem.category}</strong></p>
                <p>GPS Perimeter Logged: <strong>{parseFloat(selectedItem.distance_meters).toFixed(0)} meters</strong></p>
                <p style={{ marginTop: '0.5rem', color: 'var(--color-text-muted)' }}>
                  📸 <em>[View {selectedItem.photo_urls?.length || 0} Geo-tagged Photos]</em>
                </p>
              </div>

              <div className="hz-panel-section">
                <h4>Neighborhood Economics</h4>
                <p>Unga (2KG): <strong>KES {selectedItem.area_data?.priceUnga || 'N/A'}</strong></p>
                <p>Milk (500ml): <strong>KES {selectedItem.area_data?.priceMilk || 'N/A'}</strong></p>
                <p>Boda Fare: <strong>KES {selectedItem.area_data?.bodaFare || 'N/A'}</strong></p>
                <p>Transport Access: <strong>{selectedItem.area_data?.publicTransport || 'N/A'}</strong></p>
              </div>

              <div className="hz-panel-section">
                <h4>Legal Verification Data</h4>
                <p>LR Number: <strong>{selectedItem.lr_number || 'NOT PROVIDED'}</strong></p>
                {selectedItem.form_data?.has_visual_dispute && (
                  <div className="hz-alert hz-alert-danger">
                    <strong>High Risk:</strong> Scout logged visual signs of dispute on the ground. DO NOT PUBLISH without legal cross-check.
                  </div>
                )}
                {!selectedItem.lr_number && (
                  <div className="hz-alert hz-alert-warning">
                    <strong>Warning:</strong> Cannot verify ELC cases without LR Number.
                  </div>
                )}
              </div>

              <button 
                className="btn-primary w-full mt-4" 
                onClick={() => handleApprove(selectedItem.id)}
                disabled={selectedItem.visual_dispute}
              >
                Approve & Publish to Map
              </button>

              <a 
                href={`/admin/brief/${selectedItem.id}`}
                target="_blank"
                className="hz-btn-outline-small w-full"
                style={{ display: 'block', textAlign: 'center', marginTop: '1rem', padding: '0.75rem', fontSize: '0.875rem' }}
              >
                📄 Generate Intelligence Brief (PDF)
              </a>
              
              {selectedItem.visual_dispute && (
                <p className="hz-helper-text mt-2 text-center" style={{color: 'var(--color-primary)'}}>
                  Publishing disabled due to Active Dispute flag.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
