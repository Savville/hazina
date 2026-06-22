'use client';

import { use } from 'react';
import Link from 'next/link';

export default function IntelligenceBriefPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  
  // MOCK DATA based on the ID. In a real app, fetch from Supabase by ID.
  const isRisky = resolvedParams.id === 'ASMT-002';
  
  const mockData = {
    id: resolvedParams.id,
    date: '2026-06-21',
    property_name: isRisky ? 'Kitengela Highway Commercial' : 'Ruaka Bypass Plot',
    lr_number: isRisky ? 'Kajiado/Kitengela/881' : 'Kiambu/Ruaka/5432',
    category: isRisky ? 'COMMERCIAL' : 'LAND',
    scout: 'William O.',
    distance_logged: isRisky ? '450' : '820',
    visual_dispute: isRisky,
    
    // Area Data
    priceUnga: '215',
    priceMilk: '65',
    bodaFare: '100',
    transportAccess: 'fair',
    waterSource: 'borehole',

    // Analyst context (Layer 3)
    analyst_notes: isRisky 
      ? 'High risk of litigation. Visual dispute flags present. Adjacent parcels have a history of double-allocation by the defunct county council.'
      : 'Prime development opportunity. Directly adjacent to the proposed bypass expansion. Ground truth verifies clean boundaries.'
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="hz-admin-page hz-brief-container">
      {/* Non-printable header controls */}
      <div className="hz-no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <Link href="/admin" className="hz-btn-outline-small" style={{ textDecoration: 'none', padding: '0.5rem 1rem' }}>
          ← Back to Dashboard
        </Link>
        <button className="btn-primary" onClick={handlePrint} style={{ padding: '0.5rem 1.5rem' }}>
          📄 Export as PDF
        </button>
      </div>

      {/* The Printable Brief Document */}
      <div className="hz-brief-document">
        
        {/* Header */}
        <div className="hz-brief-header">
          <div className="hz-brief-logo">Hazina <span>Intelligence</span></div>
          <div className="hz-brief-meta">
            <p><strong>REPORT ID:</strong> {mockData.id}</p>
            <p><strong>DATE:</strong> {mockData.date}</p>
            <p className="hz-brief-confidential">CONFIDENTIAL</p>
          </div>
        </div>

        <h1 className="hz-brief-title">Parcel Intelligence Brief</h1>

        {/* Section 1: Executive Summary & Risk */}
        <div className="hz-brief-section">
          <h2>1. Executive Summary & Risk Assessment</h2>
          <table className="hz-brief-table">
            <tbody>
              <tr>
                <td width="30%"><strong>Property Name</strong></td>
                <td>{mockData.property_name}</td>
              </tr>
              <tr>
                <td><strong>LR Number</strong></td>
                <td>{mockData.lr_number}</td>
              </tr>
              <tr>
                <td><strong>Risk Status</strong></td>
                <td>
                  {mockData.visual_dispute 
                    ? <span style={{ color: '#d6001c', fontWeight: 'bold' }}>HIGH RISK - ACTIVE DISPUTE FLAGGED</span> 
                    : <span style={{ color: '#10b981', fontWeight: 'bold' }}>CLEAN - NO VISUAL DISPUTES</span>}
                </td>
              </tr>
            </tbody>
          </table>
          
          <div className="hz-brief-analyst-box">
            <h4>Analyst Context (Layer 3)</h4>
            <p>{mockData.analyst_notes}</p>
          </div>
        </div>

        {/* Section 2: Physical Ground Truth */}
        <div className="hz-brief-section">
          <h2>2. Physical Ground Truth (Layer 1)</h2>
          <table className="hz-brief-table">
            <tbody>
              <tr>
                <td width="30%"><strong>Category</strong></td>
                <td>{mockData.category}</td>
              </tr>
              <tr>
                <td><strong>Perimeter Logged</strong></td>
                <td>{mockData.distance_logged} meters mapped by Scout GPS</td>
              </tr>
              <tr>
                <td><strong>Verified By</strong></td>
                <td>Scout {mockData.scout}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 3: Neighborhood Economics */}
        <div className="hz-brief-section">
          <h2>3. Neighborhood Economics (Cost of Living Index)</h2>
          <table className="hz-brief-table">
            <tbody>
              <tr>
                <td width="30%"><strong>Transport Access</strong></td>
                <td style={{ textTransform: 'capitalize' }}>{mockData.transportAccess}</td>
              </tr>
              <tr>
                <td><strong>Primary Water</strong></td>
                <td style={{ textTransform: 'capitalize' }}>{mockData.waterSource}</td>
              </tr>
              <tr>
                <td><strong>Boda-Boda Fare (from main road)</strong></td>
                <td>KES {mockData.bodaFare}</td>
              </tr>
              <tr>
                <td><strong>Maize Flour (2KG)</strong></td>
                <td>KES {mockData.priceUnga}</td>
              </tr>
              <tr>
                <td><strong>Fresh Milk (500ml)</strong></td>
                <td>KES {mockData.priceMilk}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Disclaimer */}
        <div className="hz-brief-footer">
          <p>
            <strong>LEGAL DISCLAIMER:</strong> This Intelligence Brief is generated for informational and risk-mitigation purposes only. 
            It is based on ground-truth observations and available public data. This document does <strong>not</strong> constitute a formal 
            valuation report under the Valuers Act (Cap 532) of the Laws of Kenya, nor does it guarantee the absolute legal title of the property. 
            Investors are advised to conduct formal legal due diligence before proceeding with financial transactions.
          </p>
        </div>
      </div>
    </div>
  );
}
