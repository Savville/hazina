'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import Link from 'next/link';

export default function BrowsePropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchAllVerified = async () => {
      const { data, error } = await supabase
        .from('scout_assessments')
        .select('*')
        .eq('status', 'verified')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching properties:', error);
      } else if (data) {
        setProperties(data);
      }
      setIsLoading(false);
    };

    fetchAllVerified();
  }, []);

  return (
    <div className="hz-home" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── Navbar ── */}
      <header className="hz-nav" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="hz-nav__inner container">
          <Link href="/" className="hz-nav__wordmark">
            Hazina
          </Link>
          <nav className="hz-nav__links">
            <Link href="/properties" className="hz-nav__link">Browse Properties</Link>
            <Link href="/map" className="hz-nav__link">View Map</Link>
            <Link href="/scout/login" className="hz-nav__cta btn-primary">
              Scout Login
            </Link>
          </nav>
        </div>
      </header>

      <main className="hz-page-container" style={{ flexGrow: 1, width: '100%' }}>
        <h1 className="hz-page-title">Kenya Real Estate</h1>
        <p className="hz-page-subtitle">Browse ground-verified properties across all counties.</p>

        {isLoading ? (
          <p style={{ color: 'var(--color-text-muted)' }}>Loading verified listings...</p>
        ) : properties.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>No verified properties found at this time.</p>
        ) : (
          <div className="hz-property-grid">
            {properties.map((prop) => (
              <article key={prop.id} className="hz-property-card">
                <div className="hz-property-card-image">
                  {prop.photo_urls && prop.photo_urls.length > 0 ? (
                    <img 
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/scout_photos/${prop.photo_urls[0]}`} 
                      alt={prop.property_name} 
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '0.875rem' }}>
                      Awaiting Field Photos
                    </div>
                  )}
                  <span className="hz-property-card-badge">Verified</span>
                </div>
                
                <div className="hz-property-card-content">
                  <h3 className="hz-property-card-title">{prop.property_name}</h3>
                  <div className="hz-property-card-meta">
                    <span>{prop.category.replace('A_', '').replace('B_', '').replace('C_', '').replace('D_', '').replace('E_', '').replace('_', ' ')}</span>
                    <span>•</span>
                    <span>{parseFloat(prop.distance_meters || 0).toFixed(0)}m perimeter</span>
                  </div>
                  <p className="hz-property-card-price">Price Upon Request</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="hz-footer" style={{ marginTop: 'auto' }}>
        <div className="container hz-footer__inner">
          <span className="hz-footer__wordmark">Hazina</span>
          <p className="hz-footer__note">
            This platform is for informational purposes only and does not constitute a formal valuation.
          </p>
          <p className="hz-footer__copy">&copy; {new Date().getFullYear()} Hazina. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
