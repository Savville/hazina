'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import the map to avoid SSR window errors
const PublicMapClient = dynamic(() => import('@/components/features/PublicMap'), {
  ssr: false,
  loading: () => <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-dark-bg)', color: 'var(--color-text-muted)' }}>Loading Map Canvas...</div>
});

export default function MapSearchPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);
  const [activePoi, setActivePoi] = useState<any>(null);
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [waterFilter, setWaterFilter] = useState('');
  const [soilFilter, setSoilFilter] = useState('');
  const [envFilter, setEnvFilter] = useState('');

  // Global Area Intelligence State
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [searchedLocation, setSearchedLocation] = useState<{lat: number, lng: number, boundingbox?: string[], display_name?: string} | null>(null);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [areaIntelligence, setAreaIntelligence] = useState<any>(null);
  const [marketIntelligence, setMarketIntelligence] = useState<any>(null);
  const [isFetchingIntelligence, setIsFetchingIntelligence] = useState(false);

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/public/properties');
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      } else {
        console.error('Failed to fetch properties from API');
      }
    } catch (err) {
      console.error('Error fetching verified properties:', err);
    }
  };

  const handleGlobalSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearchQuery.trim()) return;

    setIsSearchingLocation(true);
    setSearchedLocation(null);

    try {
      // Nominatim Geocoding API
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(globalSearchQuery + ', Kenya')}&format=json&limit=1`);
      const data = await res.json();

      if (data && data.length > 0) {
        const bestResult = data[0];
        const lat = parseFloat(bestResult.lat);
        const lng = parseFloat(bestResult.lon);

        setSearchedLocation({
          lat,
          lng,
          boundingbox: bestResult.boundingbox,
          display_name: bestResult.display_name
        });
        
        // Fetch Macro Data (Area Intelligence)
        setIsFetchingIntelligence(true);
      
        try {
          const [areaRes, marketRes] = await Promise.all([
            fetch(`/api/intelligence/area?lat=${lat}&lng=${lng}`),
            fetch(`/api/intelligence/market?location=${encodeURIComponent(globalSearchQuery)}`)
          ]);

          if (areaRes.ok) {
            const areaData = await areaRes.json();
            setAreaIntelligence(areaData);
          } else {
            setAreaIntelligence(null);
          }

          if (marketRes.ok) {
            const marketData = await marketRes.json();
            setMarketIntelligence(marketData);
          } else {
            setMarketIntelligence(null);
          }

        } catch (err) {
          console.error("Failed to fetch intelligence:", err);
        } finally {
          setIsFetchingIntelligence(false);
        }

      } else {
        alert("Location not found in Kenya. Please try a different town or region.");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      alert("Failed to search location due to a network error.");
    } finally {
      setIsSearchingLocation(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    fetchProperties();
  }, []);

  const filteredProperties = properties.filter(p => {
    if (categoryFilter && p.category !== categoryFilter) return false;
    if (searchQuery && !p.property_name?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    // Advanced Scout Data Filters
    const form = p.form_data || {};
    
    if (waterFilter) {
      if (!form.waterAccess || form.waterAccess !== waterFilter) return false;
    }
    
    if (soilFilter) {
      const soil = (form.soilType || form.topography || '').toLowerCase();
      if (!soil.includes(soilFilter.toLowerCase())) return false;
    }
    
    if (envFilter) {
      const env = (form.environment || form.notes || '').toLowerCase();
      if (!env.includes(envFilter.toLowerCase())) return false;
    }

    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--color-dark-bg)' }}>
      {/* Mini Navbar (Stays on top) */}
      <header className="hz-nav" style={{ height: '60px', flexShrink: 0, position: 'relative', zIndex: 1000, backgroundColor: 'var(--color-dark-surface)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="hz-nav__inner container" style={{ width: '100%', padding: '0 1.5rem', maxWidth: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link href="/" className="hz-nav__wordmark" style={{ color: 'var(--color-text-inverse)' }}>
              Hazina
            </Link>
            
            {/* Global Geocoding Search Bar */}
            <form onSubmit={handleGlobalSearch} style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '99px', padding: '4px 4px 4px 16px', width: '350px' }}>
              <input 
                type="text" 
                placeholder="Search any town or region (e.g. Thika)..." 
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.875rem' }}
              />
              <button type="submit" disabled={isSearchingLocation} style={{ backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '99px', padding: '6px 16px', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600 }}>
                {isSearchingLocation ? '...' : 'Search'}
              </button>
            </form>
          </div>

          <nav className="hz-nav__links" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link href="/" className="hz-nav__link" style={{ color: 'var(--color-text-inverse)' }}>Home</Link>
          </nav>
        </div>
      </header>

      {/* Main App Wrapper */}
      <main style={{ flex: 1, position: 'relative' }}>
        
        {/* Floating Filter UI */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 1000,
          backgroundColor: 'rgba(23, 23, 23, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          width: '320px',
          maxHeight: 'calc(100vh - 100px)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <h3 style={{ margin: '0', fontSize: '1rem', fontFamily: 'var(--font-heading)', color: 'var(--color-text-inverse)' }}>
            Filter Verified Land
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input 
              type="text" 
              placeholder="Search by name or area..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.875rem' }}
            />
            
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.875rem' }}
              className="hz-map-select"
            >
              <option value="" style={{ color: 'black' }}>All Categories</option>
              <option value="A_AGRICULTURAL" style={{ color: 'black' }}>Agricultural</option>
              <option value="B_COMMERCIAL" style={{ color: 'black' }}>Commercial</option>
              <option value="C_INDUSTRIAL" style={{ color: 'black' }}>Industrial</option>
              <option value="D_RESIDENTIAL" style={{ color: 'black' }}>Residential</option>
              <option value="E_VACANT_LAND" style={{ color: 'black' }}>Vacant Land</option>
            </select>

            <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }}></div>
            <p style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>Scout Intelligence Filters</p>

            <select 
              value={waterFilter}
              onChange={(e) => setWaterFilter(e.target.value)}
              style={{ padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.875rem' }}
            >
              <option value="" style={{ color: 'black' }}>Any Water Access</option>
              <option value="Borehole" style={{ color: 'black' }}>On-site Borehole</option>
              <option value="River/Stream" style={{ color: 'black' }}>River / Stream</option>
              <option value="Piped" style={{ color: 'black' }}>Piped County Water</option>
              <option value="None" style={{ color: 'black' }}>Rain-fed / None</option>
            </select>

            <input 
              type="text" 
              placeholder="Soil type (e.g., black cotton)..." 
              value={soilFilter}
              onChange={(e) => setSoilFilter(e.target.value)}
              style={{ padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.875rem' }}
            />

            <input 
              type="text" 
              placeholder="Env. Risk (e.g., flood, drainage)..." 
              value={envFilter}
              onChange={(e) => setEnvFilter(e.target.value)}
              style={{ padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.875rem' }}
            />
          </div>

          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>Showing {filteredProperties.length} verified results</span>
            {(categoryFilter || searchQuery || waterFilter || soilFilter || envFilter) && (
              <button 
                onClick={() => {
                  setCategoryFilter(''); setSearchQuery(''); setWaterFilter(''); setSoilFilter(''); setEnvFilter('');
                }}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.8125rem' }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Background Canvas: Interactive Map */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          <PublicMapClient
            properties={filteredProperties}
            activePropertyId={activePropertyId}
            onPoiClick={setActivePoi}
            searchedLocation={searchedLocation}
          />
        </div>

        {/* Global Area Intelligence Side Panel (Right Side) */}
        {(isFetchingIntelligence || areaIntelligence) && (
          <div style={{
            position: 'absolute',
            top: '20px', 
            right: '20px',
            zIndex: 1000,
            backgroundColor: 'rgba(23, 23, 23, 0.9)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            padding: '1.5rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            width: '340px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            animation: 'slideInRight 0.3s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ margin: '0', fontSize: '1rem', fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
                Macro Intelligence
              </h3>
              <button 
                onClick={() => { setAreaIntelligence(null); setIsFetchingIntelligence(false); }}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {isFetchingIntelligence ? (
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                Outsourcing live API data...
              </div>
            ) : areaIntelligence ? (
              <>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-inverse)', fontWeight: 500 }}>
                  {searchedLocation?.display_name?.split(',')[0]} (5km Radius)
                </p>
                
                <div className="hz-macro-accordions" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                  
                  {/* Climate & Agriculture */}
                  <details open>
                    <summary>🌱 Climate & Agriculture</summary>
                    <div className="details-content">
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px' }}>
                          <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '2px' }}>Avg Temp</div>
                          <div style={{ fontSize: '1rem', fontWeight: 600 }}>{areaIntelligence.climate?.temp}</div>
                        </div>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px' }}>
                          <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '2px' }}>Rainfall</div>
                          <div style={{ fontSize: '1rem', fontWeight: 600 }}>{areaIntelligence.climate?.precip}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-inverse)' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Soil Type:</span> <em>Data via KALRO (Pending PostGIS)</em>
                      </div>
                    </div>
                  </details>

                  {/* Infrastructure */}
                  <details open>
                    <summary>🏗️ Infrastructure & Services</summary>
                    <div className="details-content">
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-inverse)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>🏥 Hospitals/Clinics</span>
                          <strong>{areaIntelligence.infrastructure?.hospitals}</strong>
                        </li>
                        <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>🏫 Schools/Colleges</span>
                          <strong>{areaIntelligence.infrastructure?.schools}</strong>
                        </li>
                        <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>🛣️ Major Highways</span>
                          <strong>{areaIntelligence.infrastructure?.highways}</strong>
                        </li>
                        <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>⚡ Power Grid (Substations)</span>
                          <strong>{areaIntelligence.infrastructure?.power}</strong>
                        </li>
                      </ul>
                    </div>
                  </details>

                  {/* Demographics */}
                  {marketIntelligence && (
                    <details open>
                      <summary>👥 Demographics & Economy</summary>
                      <div className="details-content">
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-inverse)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>👥 Population</span>
                            <strong>{marketIntelligence.population}</strong>
                          </li>
                          <li style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <span>📈 GDP / Economy</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textAlign: 'right', maxWidth: '140px' }}>
                              {marketIntelligence.gdp}
                            </span>
                          </li>
                        </ul>
                      </div>
                    </details>
                  )}

                  {/* Commercial & Economic */}
                  <details open>
                    <summary>🏪 Commercial & Agriculture</summary>
                    <div className="details-content">
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-inverse)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>🛍️ Commercial Nodes</span>
                          <strong>{areaIntelligence.infrastructure?.commercial}</strong>
                        </li>
                        <li style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                          <span>🌽 Maize (90kg bag)</span>
                          <strong style={{ color: 'var(--color-accent)' }}>{marketIntelligence?.maizePrice || 'Sourcing...'}</strong>
                        </li>
                        <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>🍅 Tomatoes (Crate)</span>
                          <strong style={{ color: 'var(--color-accent)' }}>{marketIntelligence?.tomatoPrice || 'Sourcing...'}</strong>
                        </li>
                      </ul>
                    </div>
                  </details>

                  {/* Industrial */}
                  <details>
                    <summary>🏭 Industrial Zones</summary>
                    <div className="details-content">
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-inverse)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>🏭 Major Industrial Zones</span>
                          <strong>{areaIntelligence.infrastructure?.industrial}</strong>
                        </li>
                        <li style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                          <span>🚚 Raw Material Access</span>
                          <em style={{ color: 'var(--color-text-muted)' }}>{marketIntelligence?.rawMaterial || 'Pending API'}</em>
                        </li>
                      </ul>
                    </div>
                  </details>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Commercial Viability:</span>
                    <span style={{ 
                      padding: '2px 8px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600,
                      backgroundColor: areaIntelligence.scores?.commercialViability === 'High' ? 'rgba(0,160,66,0.2)' : 'rgba(255,255,255,0.1)',
                      color: areaIntelligence.scores?.commercialViability === 'High' ? '#00A042' : 'white'
                    }}>
                      {areaIntelligence.scores?.commercialViability}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Infrastructure Rating:</span>
                    <span style={{ 
                      padding: '2px 8px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600,
                      backgroundColor: areaIntelligence.scores?.infrastructureQuality === 'High' ? 'rgba(0,160,66,0.2)' : 'rgba(255,255,255,0.1)',
                      color: areaIntelligence.scores?.infrastructureQuality === 'High' ? '#00A042' : 'white'
                    }}>
                      {areaIntelligence.scores?.infrastructureQuality}
                    </span>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* Floating POI Glassmorphism Side Panel */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: activePoi ? 0 : '-400px', // Slide in/out animation
          width: '400px',
          height: '100%',
          backgroundColor: 'rgba(23, 23, 23, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
          zIndex: 1001,
          transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto'
        }}>
          {activePoi && (
            <>
              {/* Header */}
              <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: 'rgba(23, 23, 23, 0.9)', zIndex: 10 }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-heading)', color: 'var(--color-text-inverse)' }}>
                  {activePoi.name}
                </h2>
                <button 
                  onClick={() => setActivePoi(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '0.5rem' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              {/* High-Res Photo */}
              <div style={{ width: '100%', minHeight: '250px', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {activePoi.photoUrl ? (
                  <img 
                    src={activePoi.photoUrl} 
                    alt={activePoi.name}
                    style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                  />
                ) : (
                  <span style={{ color: '#666', fontSize: '0.875rem' }}>No photo available</span>
                )}
              </div>

              {/* Field Notes / Description */}
              <div style={{ padding: '1.5rem', color: 'var(--color-text-muted)' }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)' }}>
                  Field Notes
                </h3>
                {activePoi.description ? (
                  <div style={{ 
                    fontSize: '0.9375rem', 
                    lineHeight: 1.6, 
                    whiteSpace: 'pre-wrap', // Preserves the line breaks from Locus Map
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    {activePoi.description}
                  </div>
                ) : (
                  <p style={{ margin: 0, fontStyle: 'italic', opacity: 0.7 }}>No field notes recorded for this location.</p>
                )}
                
                <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8125rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Coordinates:</span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--color-text-inverse)' }}>
                    {activePoi.lat.toFixed(5)}, {activePoi.lng.toFixed(5)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
        
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes slideInRight {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .hz-macro-accordions details {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 6px;
            overflow: hidden;
            transition: all 0.2s ease;
          }
          .hz-macro-accordions details[open] {
            background: rgba(255,255,255,0.06);
            border-color: rgba(255,255,255,0.2);
          }
          .hz-macro-accordions summary {
            padding: 0.75rem 1rem;
            font-size: 0.8125rem;
            font-weight: 600;
            color: var(--color-text-inverse);
            cursor: pointer;
            list-style: none;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .hz-macro-accordions summary::-webkit-details-marker {
            display: none;
          }
          .hz-macro-accordions summary::after {
            content: "▼";
            font-size: 0.6rem;
            color: var(--color-text-muted);
            transition: transform 0.2s ease;
          }
          .hz-macro-accordions details[open] summary::after {
            transform: rotate(-180deg);
          }
          .hz-macro-accordions .details-content {
            padding: 0 1rem 1rem 1rem;
            animation: fadeIn 0.3s ease;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}} />
      </main>
    </div>
  );
}
