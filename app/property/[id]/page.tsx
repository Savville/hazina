'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const PublicMapClient = dynamic(() => import('@/components/features/PublicMap'), { ssr: false });

export default function PropertyDetailsPage({ params }: { params: { id: string } }) {
  const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchProperty = async () => {
      const { data, error } = await supabase
        .from('scout_assessments')
        .select('*')
        .eq('id', params.id)
        .eq('status', 'verified')
        .single();

      if (error) {
        console.error('Error fetching property:', error);
      } else {
        setProperty(data);
      }
      setIsLoading(false);
    };

    fetchProperty();
  }, [params.id]);

  if (isLoading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>Loading intelligence data...</div>;
  }

  if (!property) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
        <h1>Property Not Found</h1>
        <p>This property may not exist or is pending verification by HQ.</p>
        <Link href="/properties" className="btn-primary" style={{ marginTop: '1rem' }}>Browse Verified Listings</Link>
      </div>
    );
  }

  const catName = property.category.replace('A_', '').replace('B_', '').replace('C_', '').replace('D_', '').replace('E_', '').replace('_', ' ');

  // Extract photos (Base64 snaps or storage URLs)
  let photos: string[] = [];
  if (property.photo_urls && property.photo_urls.length > 0) {
    photos = property.photo_urls.map((p: string) => `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/scout_photos/${p}`);
  } else if (property.form_data?.terrainSnap) {
    photos = [property.form_data.terrainSnap];
  } else if (property.form_data?.roadSnap) {
    photos = [property.form_data.roadSnap];
  }

  return (
    <div className="hz-home">
      {/* ── Navbar ── */}
      <header className="hz-nav" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="hz-nav__inner container">
          <Link href="/" className="hz-nav__wordmark">Hazina</Link>
          <nav className="hz-nav__links">
            <Link href="/" className="hz-nav__link">Home</Link>
            <Link href="/properties" className="hz-nav__link">Browse Properties</Link>
            <Link href="/map" className="hz-nav__link">View Map</Link>
            <Link href="/scout/login" className="hz-nav__cta btn-primary">Scout Login</Link>
          </nav>
        </div>
      </header>

      {/* ── Hero Image Slider ── */}
      <div className="hz-details-hero">
        {photos.length > 0 ? (
          photos.map((photoSrc: string, idx: number) => (
            <img key={idx} src={photoSrc} className="hz-details-hero__img" alt={`Property view ${idx+1}`} />
          ))
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', backgroundColor: 'var(--color-surface)' }}>
            Awaiting Field Photos
          </div>
        )}
      </div>

      <main className="hz-details-container">
        
        {/* ── Left Column: Intelligence Data ── */}
        <div className="hz-details-main">
          <header className="hz-details-header">
            <div className="hz-details-badge" style={{ marginBottom: '1rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Scout Verified
            </div>
            <h1 className="hz-details-title">{property.property_name}</h1>
            <div className="hz-details-meta">
              <span>{catName}</span>
              <span>•</span>
              <span>{parseFloat(property.distance_meters || 0).toFixed(0)}m perimeter</span>
            </div>
          </header>

          <section className="hz-details-section">
            <h2 className="hz-details-section-title">Ground Intelligence</h2>
            <div className="hz-data-grid">
              <div className="hz-data-item">
                <span className="hz-data-item__label">Road Access</span>
                <span className="hz-data-item__value">{property.form_data?.roadFrontage || 'Unknown'}</span>
              </div>
              <div className="hz-data-item">
                <span className="hz-data-item__label">Infrastructure</span>
                <span className="hz-data-item__value">{property.form_data?.infrastructure || 'None'}</span>
              </div>
              <div className="hz-data-item">
                <span className="hz-data-item__label">Terrain / Soil</span>
                <span className="hz-data-item__value">{property.form_data?.soilType || property.form_data?.terrain || 'Not logged'}</span>
              </div>
              <div className="hz-data-item">
                <span className="hz-data-item__label">Current Use</span>
                <span className="hz-data-item__value">{property.form_data?.currentUse || 'Vacant'}</span>
              </div>
            </div>
          </section>

          <section className="hz-details-section">
            <h2 className="hz-details-section-title">Area Economics</h2>
            <div className="hz-data-grid">
              <div className="hz-data-item">
                <span className="hz-data-item__label">Water Reliability</span>
                <span className="hz-data-item__value" style={{ textTransform: 'capitalize' }}>{property.area_data?.waterReliability || 'Unknown'}</span>
              </div>
              <div className="hz-data-item">
                <span className="hz-data-item__label">Public Transport</span>
                <span className="hz-data-item__value" style={{ textTransform: 'capitalize' }}>{property.area_data?.publicTransport || 'Unknown'}</span>
              </div>
              <div className="hz-data-item">
                <span className="hz-data-item__label">1Kg Unga Price</span>
                <span className="hz-data-item__value">{property.area_data?.priceUnga ? `KES ${property.area_data.priceUnga}` : 'N/A'}</span>
              </div>
              <div className="hz-data-item">
                <span className="hz-data-item__label">Transport Fare</span>
                <span className="hz-data-item__value">{property.area_data?.bodaFare ? `KES ${property.area_data.bodaFare}` : 'N/A'}</span>
              </div>
            </div>
          </section>

          <section className="hz-details-section">
            <h2 className="hz-details-section-title">GPS Boundary</h2>
            <div style={{ height: '350px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
              <PublicMapClient properties={[property]} />
            </div>
          </section>
        </div>

        {/* ── Right Column: Sticky CTA ── */}
        <aside className="hz-details-sidebar">
          <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
            <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)', margin: '0 0 0.5rem' }}>Price Upon Request</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Verified listings are protected to prevent market speculation.</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); alert('Lead Sent! A Hazina representative will contact you shortly.'); }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Request a Viewing</h3>
            
            <label className="hz-label">Full Name</label>
            <input type="text" className="hz-input" placeholder="Jane Doe" required style={{ width: '100%', marginBottom: '1rem' }} />

            <label className="hz-label">Phone Number</label>
            <input type="tel" className="hz-input" placeholder="+254 700 000000" required style={{ width: '100%', marginBottom: '1rem' }} />

            <label className="hz-label">Email Address</label>
            <input type="email" className="hz-input" placeholder="jane@example.com" required style={{ width: '100%', marginBottom: '1.5rem' }} />

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.125rem' }}>
              Connect with Hazina
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '1rem' }}>
              By submitting this request, you agree to our Terms of Service.
            </p>
          </form>
        </aside>

      </main>
      
      {/* ── Footer ── */}
      <footer className="hz-footer" style={{ marginTop: 'auto' }}>
        <div className="container hz-footer__inner">
          <span className="hz-footer__wordmark">Hazina</span>
          <p className="hz-footer__copy">&copy; {new Date().getFullYear()} Hazina. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
