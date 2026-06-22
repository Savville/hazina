'use client';

import { useState } from 'react';

// MOCK DATA: In a real app this comes from Supabase 'assessments' table
const MOCK_SUBMISSIONS = [
  {
    id: 'ASMT-001',
    date: '2026-06-21',
    scout: 'William O.',
    property_name: 'Ruaka Bypass Plot',
    category: 'LAND',
    lr_number: 'Kiambu/Ruaka/5432',
    visual_dispute: false,
    status: 'pending'
  },
  {
    id: 'ASMT-002',
    date: '2026-06-21',
    scout: 'William O.',
    property_name: 'Kitengela Highway Commercial',
    category: 'COMMERCIAL',
    lr_number: 'Kajiado/Kitengela/881',
    visual_dispute: true,
    status: 'pending'
  },
  {
    id: 'ASMT-003',
    date: '2026-06-20',
    scout: 'Sarah M.',
    property_name: 'Juja Farm 5 Acres',
    category: 'LAND',
    lr_number: '',
    visual_dispute: false,
    status: 'pending'
  }
];

export default function AdminDashboardPage() {
  const [submissions, setSubmissions] = useState(MOCK_SUBMISSIONS);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleApprove = (id: string) => {
    setSubmissions(prev => prev.filter(s => s.id !== id));
    alert(`Assessment ${id} approved and published to public site.`);
    setSelectedId(null);
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
              {submissions.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>No pending submissions.</td>
                </tr>
              )}
              {submissions.map((sub) => (
                <tr key={sub.id} className={selectedId === sub.id ? 'active-row' : ''}>
                  <td>{sub.id}</td>
                  <td>{sub.date}</td>
                  <td>{sub.scout}</td>
                  <td>
                    <strong>{sub.property_name}</strong>
                    <span className="badge-category">{sub.category}</span>
                  </td>
                  <td>{sub.lr_number || <span className="hz-text-warning">Missing</span>}</td>
                  <td>
                    {sub.visual_dispute ? <span className="badge-danger">Visual Dispute</span> : <span className="badge-safe">Clear</span>}
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
                <p>Submitted by: <strong>{selectedItem.scout}</strong></p>
                <p>Date: {selectedItem.date}</p>
              </div>

              <div className="hz-panel-section">
                <h4>Physical Data (Layer 1)</h4>
                <p>Category: <strong>{selectedItem.category}</strong></p>
                <p>GPS Perimeter: <strong>{selectedItem.category === 'LAND' ? '820 meters' : '450 meters'}</strong></p>
                <p style={{ marginTop: '0.5rem', color: 'var(--color-text-muted)' }}>
                  📸 <em>[View 4 Geo-tagged Photos]</em>
                </p>
              </div>

              <div className="hz-panel-section">
                <h4>Neighborhood Economics</h4>
                <p>Unga (2KG): <strong>KES 210</strong></p>
                <p>Milk (500ml): <strong>KES 60</strong></p>
                <p>Boda Fare: <strong>KES 50</strong></p>
                <p>Transport Access: <strong>Fair</strong></p>
              </div>

              <div className="hz-panel-section">
                <h4>Legal Verification Data</h4>
                <p>LR Number: <strong>{selectedItem.lr_number || 'NOT PROVIDED'}</strong></p>
                {selectedItem.visual_dispute && (
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
