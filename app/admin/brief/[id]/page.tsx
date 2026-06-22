'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase';

export default function IntelligenceBriefPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBrief = async () => {
      const supabase = createBrowserClient();
      const { data: dbData, error } = await supabase
        .from('scout_assessments')
        .select(`
          *,
          scout_profiles (full_name)
        `)
        .eq('id', resolvedParams.id)
        .single();
        
      if (error) {
        console.error('Error fetching brief data:', error);
      } else {
        setData(dbData);
      }
      setIsLoading(false);
    };
    fetchBrief();
  }, [resolvedParams.id]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <div style={{ padding: '4rem', textAlign: 'center', fontFamily: 'var(--font-body)' }}>Loading Intelligence Brief...</div>;
  }

  if (!data) {
    return <div style={{ padding: '4rem', textAlign: 'center', fontFamily: 'var(--font-body)' }}>Assessment not found or failed to load.</div>;
  }

  const isRisky = data.form_data?.has_visual_dispute || false;
  const analystNotes = isRisky 
      ? 'High risk of litigation. Visual dispute flags present. DO NOT PROCEED WITH ACQUISITION WITHOUT EXTENSIVE ELC VERIFICATION.'
      : 'Ground truth verifies physical existence. Awaiting manual title cross-check by legal team.';

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
            <p><strong>REPORT ID:</strong> {data.id}</p>
            <p><strong>DATE:</strong> {new Date(data.created_at).toLocaleDateString('en-KE')}</p>
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
                <td>{data.property_name}</td>
              </tr>
              <tr>
                <td><strong>LR Number</strong></td>
                <td>{data.lr_number || 'N/A (Unverified)'}</td>
              </tr>
              <tr>
                <td><strong>Risk Status</strong></td>
                <td>
                  {isRisky 
                    ? <span style={{ color: '#d6001c', fontWeight: 'bold' }}>HIGH RISK - ACTIVE DISPUTE FLAGGED</span> 
                    : <span style={{ color: '#10b981', fontWeight: 'bold' }}>CLEAN - NO VISUAL DISPUTES</span>}
                </td>
              </tr>
            </tbody>
          </table>
          
          <div className="hz-brief-analyst-box">
            <h4>Analyst Context (Layer 3)</h4>
            <p>{analystNotes}</p>
          </div>
        </div>

        {/* Section 2: Physical Ground Truth */}
        <div className="hz-brief-section">
          <h2>2. Physical Ground Truth (Layer 1)</h2>
          <table className="hz-brief-table">
            <tbody>
              <tr>
                <td width="30%"><strong>Category</strong></td>
                <td>{data.category}</td>
              </tr>
              <tr>
                <td><strong>Perimeter Logged</strong></td>
                <td>{parseFloat(data.distance_meters).toFixed(0)} meters mapped by Scout GPS</td>
              </tr>
              <tr>
                <td><strong>Verified By</strong></td>
                <td>Scout {data.scout_profiles?.full_name || 'Unknown'}</td>
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
                <td style={{ textTransform: 'capitalize' }}>{data.area_data?.publicTransport || 'N/A'}</td>
              </tr>
              <tr>
                <td><strong>Primary Water</strong></td>
                <td style={{ textTransform: 'capitalize' }}>{data.area_data?.waterSource || 'N/A'}</td>
              </tr>
              <tr>
                <td><strong>Boda-Boda Fare (from main road)</strong></td>
                <td>KES {data.area_data?.bodaFare || 'N/A'}</td>
              </tr>
              <tr>
                <td><strong>Maize Flour (2KG)</strong></td>
                <td>KES {data.area_data?.priceUnga || 'N/A'}</td>
              </tr>
              <tr>
                <td><strong>Fresh Milk (500ml)</strong></td>
                <td>KES {data.area_data?.priceMilk || 'N/A'}</td>
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
