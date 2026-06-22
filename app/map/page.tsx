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

  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  // Filter State
  const [filters, setFilters] = useState({
    category: '',
    tarmacDistance: '',
    water: '',
    powerReliability: '',
    commodityType: '',
    maxCommodityPrice: '',
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
    if (filters.tarmacDistance) {
      result = result.filter(p => p.area_data?.distanceToTarmac === filters.tarmacDistance);
    }
    if (filters.water) {
      result = result.filter(p => p.area_data?.waterReliability === filters.water);
    }
    if (filters.powerReliability) {
      result = result.filter(p => p.area_data?.powerReliability === filters.powerReliability);
    }
    if (filters.commodityType && filters.maxCommodityPrice) {
      result = result.filter(p => {
        const val = p.area_data?.[filters.commodityType];
        return val && Number(val) <= Number(filters.maxCommodityPrice);
      });
    }

    setFilteredProperties(result);
  }, [filters, allProperties]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Mini Navbar (Stays on top) */}
      <header className="hz-nav" style={{ height: '60px', flexShrink: 0, position: 'relative', zIndex: 100, borderBottom: '1px solid var(--color-border)' }}>
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

      {/* Main App Wrapper */}
      <main className="hz-map-wrapper">
        
        {/* Background Canvas: Interactive Map */}
        <section className="hz-map-canvas">
          <PublicMapClient
            properties={filteredProperties}
            activePropertyId={activePropertyId}
          />
        </section>

        {/* Floating Toggle Button (Visible when drawer is closed) */}
        {!isDrawerOpen && (
          <button className="hz-drawer-reopen-btn" onClick={() => setIsDrawerOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            Search Properties
          </button>
        )}

        {/* Floating Side Panel: Property List & Filters */}
        <section className={`hz-drawer-container ${!isDrawerOpen ? 'is-closed' : ''}`}>
          <div className="hz-drawer-header">
            <h1 style={{ fontSize: '1.25rem', margin: 0, fontFamily: 'var(--font-heading)' }}>
              Verified Real Estate
            </h1>
            <button className="hz-drawer-toggle-btn" onClick={() => setIsDrawerOpen(false)}>
              Hide Map
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
          </div>
          
          <div className="hz-drawer-content">
            {/* ── INTELLIGENCE FILTERS ── */}
            <div className="hz-filter-grid">
              <div style={{ gridColumn: '1 / -1' }}>
                <h3 style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Intelligence Filters</h3>
              </div>
              <select className="hz-input" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8125rem' }} value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
                <option value="">Any Category</option>
                <option value="A_AGRICULTURAL">Agricultural</option>
                <option value="B_COMMERCIAL">Commercial</option>
                <option value="C_INDUSTRIAL">Industrial</option>
                <option value="D_RESIDENTIAL">Residential</option>
                <option value="E_VACANT_LAND">Vacant Land</option>
              </select>
              <select className="hz-input" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8125rem' }} value={filters.tarmacDistance} onChange={e => setFilters({ ...filters, tarmacDistance: e.target.value })}>
                <option value="">Any Tarmac Distance</option>
                <option value="under_100m">&lt; 100m to Tarmac</option>
                <option value="under_500m">&lt; 500m to Tarmac</option>
                <option value="under_1km">&lt; 1km to Tarmac</option>
                <option value="over_1km">&gt; 1km to Tarmac</option>
              </select>
              <select className="hz-input" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8125rem' }} value={filters.water} onChange={e => setFilters({ ...filters, water: e.target.value })}>
                <option value="">Any Water Source</option>
                <option value="borehole">Borehole</option>
                <option value="council">Council Water</option>
              </select>
              <select className="hz-input" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8125rem', gridColumn: '1 / -1' }} value={filters.powerReliability} onChange={e => setFilters({ ...filters, powerReliability: e.target.value })}>
                <option value="">Any Power Reliability</option>
                <option value="stable">Highly Stable</option>
                <option value="frequent_blackouts">Frequent Blackouts</option>
                <option value="off_grid">Off-Grid (Solar/Generator)</option>
              </select>
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <select className="hz-input" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8125rem', flex: 1 }} value={filters.commodityType} onChange={e => setFilters({ ...filters, commodityType: e.target.value })}>
                  <option value="">Commodity Price Check...</option>
                  <option value="priceCement">Cement (50kg Bag)</option>
                  <option value="priceIronSheet">Iron Sheet (G30)</option>
                  <option value="priceUnga">Maize Flour (2kg)</option>
                  <option value="bodaFare">Boda-Boda Fare</option>
                </select>
                <input type="number" placeholder="Max (KES)" className="hz-input" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8125rem', width: '100px' }} value={filters.maxCommodityPrice} onChange={e => setFilters({ ...filters, maxCommodityPrice: e.target.value })} disabled={!filters.commodityType} />
              </div>
            </div>

            {isLoading ? (
              <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem 0' }}>Loading verified listings...</p>
            ) : filteredProperties.length === 0 ? (
              <div style={{ padding: '1.5rem', backgroundColor: 'rgba(214, 0, 28, 0.05)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-primary)', textAlign: 'center' }}>
                <h3 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>No Matches Found</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                  We don't currently have any verified land matching those exact specifications.
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
                  <Link
                    href={`/property/${prop.id}`}
                    key={prop.id}
                    className="hz-property-card"
                    onMouseEnter={() => setActivePropertyId(prop.id)}
                    onMouseLeave={() => setActivePropertyId(null)}
                  >
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
                      <h2 className="hz-property-card-title">{prop.property_name}</h2>
                      <div className="hz-property-card-meta">
                        <span>{prop.category.replace('A_', '').replace('B_', '').replace('C_', '').replace('D_', '').replace('E_', '').replace('_', ' ')}</span>
                        <span>•</span>
                        <span>{parseFloat(prop.distance_meters || 0).toFixed(0)}m perimeter</span>
                      </div>
                      <p className="hz-property-card-price">Price Upon Request</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
