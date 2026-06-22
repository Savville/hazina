'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase';

// Dynamically import the map to avoid SSR window errors
const PublicMapClient = dynamic(() => import('@/components/features/PublicMap'), { 
  ssr: false,
  loading: () => <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)' }}>Loading Map...</div>
});

export default function MapSearchPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchVerifiedProperties = async () => {
      const { data, error } = await supabase
        .from('scout_assessments')
        .select('*')
        .eq('status', 'verified')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching verified properties:', error);
      } else if (data) {
        setProperties(data);
      }
      setIsLoading(false);
    };

    fetchVerifiedProperties();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Mini Navbar */}
      <header className="hz-nav" style={{ height: '60px', flexShrink: 0 }}>
        <div className="hz-nav__inner container" style={{ width: '100%', padding: '0 1.5rem', maxWidth: 'none' }}>
          <Link href="/" className="hz-nav__wordmark">
            Hazina
          </Link>
          <nav className="hz-nav__links">
            <Link href="/scout/login" className="hz-nav__cta btn-primary">Scout Login</Link>
          </nav>
        </div>
      </header>

      {/* Split Layout */}
      <main className="hz-split-layout">
        
        {/* Left Side: Property List */}
        <section className="hz-split-list-pane">
          <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>
            Verified Real Estate
          </h1>
          
          {isLoading ? (
            <p style={{ color: 'var(--color-text-muted)' }}>Loading verified listings...</p>
          ) : properties.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)' }}>No verified properties found in the area.</p>
          ) : (
            <div className="hz-property-list">
              {properties.map((prop) => (
                <article 
                  key={prop.id} 
                  className="hz-property-card"
                  onMouseEnter={() => setActivePropertyId(prop.id)}
                  onMouseLeave={() => setActivePropertyId(null)}
                >
                  <div className="hz-property-card-image">
                    {/* If photo_urls exists, use the first one. Otherwise placeholder */}
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
                    <h2 className="hz-property-card-title">{prop.property_name}</h2>
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
        </section>

        {/* Right Side: Interactive Map */}
        <section className="hz-split-map-pane">
          <PublicMapClient 
            properties={properties} 
            activePropertyId={activePropertyId} 
          />
        </section>

      </main>
    </div>
  );
}
