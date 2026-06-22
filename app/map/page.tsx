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
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter State
  const [filters, setFilters] = useState({
    category: '',
    road: '',
    water: '',
    power: '',
    maxBodaFare: '',
    maxUngaPrice: '',
  });

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
        setAllProperties(data);
        setFilteredProperties(data);
      }
      setIsLoading(false);
    };

    fetchVerifiedProperties();
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = [...allProperties];
    
    if (filters.category) {
      result = result.filter(p => p.category === filters.category);
    }
    if (filters.road) {
      result = result.filter(p => p.form_data?.roadFrontage?.toLowerCase().includes(filters.road.toLowerCase()));
    }
    if (filters.water) {
      result = result.filter(p => p.area_data?.waterReliability === filters.water);
    }
    if (filters.power) {
      result = result.filter(p => p.form_data?.infrastructure?.toLowerCase().includes(filters.power.toLowerCase()));
    }
    if (filters.maxBodaFare) {
      result = result.filter(p => p.area_data?.bodaFare && Number(p.area_data.bodaFare) <= Number(filters.maxBodaFare));
    }
    if (filters.maxUngaPrice) {
      result = result.filter(p => p.area_data?.priceUnga && Number(p.area_data.priceUnga) <= Number(filters.maxUngaPrice));
    }

    setFilteredProperties(result);
  }, [filters, allProperties]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Mini Navbar */}
      <header className="hz-nav" style={{ height: '60px', flexShrink: 0 }}>
        <div className="hz-nav__inner container" style={{ width: '100%', padding: '0 1.5rem', maxWidth: 'none' }}>
          <Link href="/" className="hz-nav__wordmark">
            Hazina
          </Link>
          <nav className="hz-nav__links">
            <Link href="/" className="hz-nav__link">Home</Link>
            <Link href="/properties" className="hz-nav__link">Browse Properties</Link>
            <Link href="/scout/login" className="hz-nav__cta btn-primary">Scout Login</Link>
          </nav>
        </div>
      </header>

      {/* Split Layout */}
      <main className="hz-split-layout">
        
        {/* Floating Side Panel: Property List & Filters */}
        <section className="hz-split-list-pane">
          <div style={{ padding: '1.5rem 1.25rem' }}>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
            Verified Real Estate
          </h1>
          
          {/* ── INTELLIGENCE FILTERS ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <h3 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Intelligence Filters</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <select className="hz-input" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8125rem' }} value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})}>
                <option value="">Any Category</option>
                <option value="A_AGRICULTURAL">Agricultural</option>
                <option value="B_COMMERCIAL">Commercial</option>
                <option value="C_INDUSTRIAL">Industrial</option>
                <option value="D_RESIDENTIAL">Residential</option>
                <option value="E_VACANT_LAND">Vacant Land</option>
              </select>
              <select className="hz-input" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8125rem' }} value={filters.road} onChange={e => setFilters({...filters, road: e.target.value})}>
                <option value="">Any Road Access</option>
                <option value="Tarmac">Tarmac</option>
                <option value="Murram">Murram</option>
              </select>
              <select className="hz-input" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8125rem' }} value={filters.water} onChange={e => setFilters({...filters, water: e.target.value})}>
                <option value="">Any Water Source</option>
                <option value="borehole">Borehole</option>
                <option value="council">Council Water</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <select className="hz-input" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8125rem' }} value={filters.power} onChange={e => setFilters({...filters, power: e.target.value})}>
                <option value="">Any Power</option>
                <option value="3-Phase">3-Phase</option>
                <option value="Single">Single Phase</option>
              </select>
              <input type="number" placeholder="Max Boda Fare (KES)" className="hz-input" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8125rem', width: '160px' }} value={filters.maxBodaFare} onChange={e => setFilters({...filters, maxBodaFare: e.target.value})} />
              <input type="number" placeholder="Max Unga (KES)" className="hz-input" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8125rem', width: '140px' }} value={filters.maxUngaPrice} onChange={e => setFilters({...filters, maxUngaPrice: e.target.value})} />
            </div>
          </div>
          
          {isLoading ? (
            <p style={{ color: 'var(--color-text-muted)' }}>Loading verified listings...</p>
          ) : filteredProperties.length === 0 ? (
            <div style={{ padding: '1.5rem', backgroundColor: 'rgba(214, 0, 28, 0.05)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-primary)', textAlign: 'center' }}>
              <h3 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>No Matches Found</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                We don't currently have any verified land matching those exact specifications in our database.
              </p>
              
              {/* ── SCOUT SOURCING BOUNTY FORM ── */}
              <div style={{ backgroundColor: 'var(--color-dark-bg)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', textAlign: 'left', border: '1px solid var(--color-border)' }}>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: 'var(--color-text-inverse)' }}>Request Sourcing (Bounty)</h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                  Can't find it? Dispatch a Hazina Scout to actively hunt for this exact land profile for you. 
                </p>
                <form onSubmit={(e) => { e.preventDefault(); alert('Scout Dispatched! Your sourcing request is in the HQ queue.'); }}>
                  <textarea placeholder="Any additional requirements? (e.g. Budget, exact location)" className="hz-input w-full" rows={3} style={{ marginBottom: '0.75rem', padding: '0.75rem', fontSize: '0.875rem' }}></textarea>
                  <button type="submit" className="btn-primary w-full">Dispatch a Scout</button>
                </form>
              </div>
            </div>
          ) : (
            <div className="hz-property-list">
              {filteredProperties.map((prop) => (
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
          </div>
        </section>

        {/* Right Side: Interactive Map */}
        <section className="hz-split-map-pane">
          <PublicMapClient 
            properties={filteredProperties} 
            activePropertyId={activePropertyId} 
          />
        </section>

      </main>
    </div>
  );
}
