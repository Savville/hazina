'use client';

import { useState } from 'react';
import Link from 'next/link';
import PublicSatelliteMap from '@/components/features/PublicSatelliteMap';

export default function PublicMapPage() {
  const [selectedParcel, setSelectedParcel] = useState<any>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--color-dark-bg)', color: 'white' }}>
      
      {/* Map Header / Navigation */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '1rem 2rem', 
        backgroundColor: 'rgba(10, 10, 10, 0.9)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: 1000
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>
            Hazina <span style={{ color: 'var(--color-primary)' }}>Map</span>
          </div>
        </Link>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '1rem', marginRight: '2rem', fontSize: '0.875rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '12px', height: '12px', backgroundColor: '#10b981', display: 'inline-block', borderRadius: '2px' }}></span>
              For Sale (Verified)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '12px', height: '12px', backgroundColor: '#3b82f6', display: 'inline-block', borderRadius: '2px' }}></span>
              Not For Sale
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '12px', height: '12px', backgroundColor: '#d6001c', display: 'inline-block', borderRadius: '2px' }}></span>
              Active Dispute
            </span>
          </div>
          
          <Link href="/scout/login" className="hz-btn-outline-small" style={{ textDecoration: 'none' }}>
            Scout Login
          </Link>
        </div>
      </header>

      {/* Map Container */}
      <main style={{ flexGrow: 1, position: 'relative', display: 'flex' }}>
        
        {/* The Leaflet Map */}
        <div style={{ flexGrow: 1, position: 'relative' }}>
          <PublicSatelliteMap onSelectParcel={(parcel) => setSelectedParcel(parcel)} />
          
          {/* Floating Search Overlay (Hidden when side panel is open to save space) */}
          {!selectedParcel && (
            <div style={{
              position: 'absolute',
              top: '2rem',
              left: '2rem',
              zIndex: 1000,
              backgroundColor: 'var(--color-dark-surface)',
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              width: '350px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>
                Cadastral Intelligence
              </h2>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                Search Kenya's first digitized, ground-truth verified land registry.
              </p>
              
              <input 
                type="text" 
                placeholder="Search LR Number or County..." 
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '4px',
                  color: 'white',
                  marginBottom: '1rem'
                }}
              />
              
              <button className="btn-primary" style={{ width: '100%', marginBottom: '1.5rem' }}>Search Area</button>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Featured Intelligence</h3>
                
                <div 
                  onClick={() => setSelectedParcel({
                    id: 'ASMT-001', name: 'Ruaka Bypass Plot', lr_number: 'Kiambu/Ruaka/5432', category: 'LAND', price: 'KES 15,000,000', status: 'FOR_SALE',
                    coordinates: [[-1.2001, 36.7820], [-1.2005, 36.7820], [-1.2005, 36.7825], [-1.2001, 36.7825]]
                  })}
                  style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', cursor: 'pointer', marginBottom: '0.5rem', borderLeft: '3px solid #10b981' }}
                >
                  <strong style={{ display: 'block', fontSize: '0.9375rem' }}>Ruaka Bypass Plot</strong>
                  <span style={{ fontSize: '0.75rem', color: '#10b981' }}>For Sale (Verified)</span>
                </div>

                <div 
                  onClick={() => setSelectedParcel({
                    id: 'ASMT-002', name: 'Kitengela Highway Commercial', lr_number: 'Kajiado/Kitengela/881', category: 'COMMERCIAL', price: 'KES 45,000,000', status: 'DISPUTED',
                    coordinates: [[-1.4800, 36.9550], [-1.4810, 36.9550], [-1.4810, 36.9560], [-1.4800, 36.9560]]
                  })}
                  style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', cursor: 'pointer', marginBottom: '0.5rem', borderLeft: '3px solid #d6001c' }}
                >
                  <strong style={{ display: 'block', fontSize: '0.9375rem' }}>Kitengela Highway</strong>
                  <span style={{ fontSize: '0.75rem', color: '#ff6b6b' }}>High Risk (Dispute)</span>
                </div>

                <div 
                  onClick={() => setSelectedParcel({
                    id: 'ASMT-005', name: 'Private Farm - Kitisuru', lr_number: 'Nairobi/Block12/334', category: 'LAND', price: 'Est. KES 85,000,000', status: 'NOT_FOR_SALE',
                    coordinates: [[-1.2400, 36.7600], [-1.2420, 36.7600], [-1.2420, 36.7620], [-1.2400, 36.7620]]
                  })}
                  style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', cursor: 'pointer', borderLeft: '3px solid #3b82f6' }}
                >
                  <strong style={{ display: 'block', fontSize: '0.9375rem' }}>Private Farm - Kitisuru</strong>
                  <span style={{ fontSize: '0.75rem', color: '#3b82f6' }}>Not For Sale</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scout View Side Panel */}
        {selectedParcel && (
          <div style={{
            width: '400px',
            backgroundColor: 'var(--color-dark-surface)',
            borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            boxShadow: '-5px 0 15px rgba(0,0,0,0.3)'
          }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{selectedParcel.name}</h3>
              <button 
                onClick={() => setSelectedParcel(null)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto', flexGrow: 1 }}>
              
              {/* Risk Status */}
              <div style={{ marginBottom: '1.5rem' }}>
                {selectedParcel.status === 'FOR_SALE' && (
                  <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#10b981', padding: '1rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>✅</span>
                    <div>
                      <strong>For Sale - Verified Clean</strong>
                      <p style={{ margin: 0, fontSize: '0.75rem', marginTop: '0.25rem' }}>No visible disputes logged by scout.</p>
                    </div>
                  </div>
                )}
                {selectedParcel.status === 'NOT_FOR_SALE' && (
                  <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6', color: '#3b82f6', padding: '1rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>ℹ️</span>
                    <div>
                      <strong>Not For Sale - Off Market</strong>
                      <p style={{ margin: 0, fontSize: '0.75rem', marginTop: '0.25rem' }}>This property is mapped for intelligence but not currently listed.</p>
                    </div>
                  </div>
                )}
                {selectedParcel.status === 'DISPUTED' && (
                  <div style={{ backgroundColor: 'rgba(214, 0, 28, 0.1)', border: '1px solid #d6001c', color: '#ff6b6b', padding: '1rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                    <div>
                      <strong>High Risk (Dispute)</strong>
                      <p style={{ margin: 0, fontSize: '0.75rem', marginTop: '0.25rem' }}>Active dispute flags on the ground.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Legal Info */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Legal Identification</h4>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9375rem' }}>LR Number: <strong>{selectedParcel.lr_number}</strong></p>
                <p style={{ margin: '0', fontSize: '0.9375rem' }}>Category: <strong>{selectedParcel.category}</strong></p>
              </div>

              {/* Scout Disclaimer */}
              <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Scout's Field View</h4>
                <p style={{ fontSize: '0.8125rem', lineHeight: '1.5', margin: 0, color: 'var(--color-text-muted)' }}>
                  This data was gathered physically by a Hazina Field Scout. 
                  <strong style={{ color: 'var(--color-text-inverse)', display: 'block', marginTop: '0.5rem' }}>
                    NOTE: This is a risk-mitigation brief, not a formal valuation under the Valuers Act Cap 532.
                  </strong>
                </p>
              </div>

              {/* Financials */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Financial Insight</h4>
                <p style={{ margin: '0', fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{selectedParcel.price}</p>
              </div>

              {/* CTA - Protected/Monetized */}
              <button 
                onClick={() => alert('PREMIUM FEATURE:\n\nTo view the full 3-Layer Intelligence Brief (including legal analysis and high-res ground photos), please Sign In or purchase the report for KES 1,000.\n\n(This protects Hazina data from competitors)')}
                className="btn-primary w-full"
                style={{ display: 'block', textAlign: 'center', padding: '0.75rem', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-heading)' }}
              >
                🔒 Unlock Full Intelligence Brief
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
