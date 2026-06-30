'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import 'leaflet/dist/leaflet.css';
import { createBrowserClient } from '@/lib/supabase';
import PublicNavbar from '@/components/layout/PublicNavbar';

// Dynamically import the map to avoid SSR window errors
const PublicMapClient = dynamic(() => import('@/components/features/PublicMap'), {
  ssr: false,
  loading: () => <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-dark-bg)', color: 'var(--color-text-muted)' }}>Loading Map Canvas...</div>
});

export default function MapSearchPage() {
  const supabase = createBrowserClient();
  const [properties, setProperties] = useState<any[]>([]);
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);
  const [activePoi, setActivePoi] = useState<any>(null);
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [waterFilter, setWaterFilter] = useState('');
  const [soilFilter, setSoilFilter] = useState('');
  const [envFilter, setEnvFilter] = useState('');
  
  // Scraped Market Data State
  const [scrapedProperties, setScrapedProperties] = useState<any[]>([]);
  const [showScrapedData, setShowScrapedData] = useState(false);

  // Global Area Intelligence State
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [searchedLocation, setSearchedLocation] = useState<{lat: number, lng: number, boundingbox?: string[], display_name?: string} | null>(null);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [areaIntelligence, setAreaIntelligence] = useState<any>(null);
  const [marketIntelligence, setMarketIntelligence] = useState<any>(null);
  const [isFetchingIntelligence, setIsFetchingIntelligence] = useState(false);
  const [activePoiLayer, setActivePoiLayer] = useState<string | null>(null);

  const fetchProperties = async (bounds?: { n: number, s: number, e: number, w: number }) => {
    try {
      let url = '/api/public/properties';
      if (bounds) {
        url += `?n=${bounds.n}&s=${bounds.s}&e=${bounds.e}&w=${bounds.w}`;
      }
      
      const [verifiedRes, scrapedRes] = await Promise.all([
        fetch(url),
        fetch('/geocoded_map_data.json')
      ]);

      if (verifiedRes.ok) {
        const data = await verifiedRes.json();
        setProperties(data);
      }
      
      if (scrapedRes.ok) {
        const scrapedData = await scrapedRes.json();
        // Tag them as scraped so the map knows how to render them
        const taggedScraped = scrapedData.map((p: any) => ({ ...p, isScraped: true, id: p.url || Math.random().toString() }));
        setScrapedProperties(taggedScraped);
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
    }
  };

  const handleGlobalSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearchQuery.trim()) return;

    setIsSearchingLocation(true);
    setSearchedLocation(null);

    try {
      // Nominatim Geocoding API (via secure backend proxy to prevent CORS/User-Agent blocks)
      const res = await fetch(`/api/public/geocode?q=${encodeURIComponent(globalSearchQuery + ', Kenya')}`);
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
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100">
      <PublicNavbar />

      {/* Main App Wrapper */}
      <main style={{ flex: 1, position: 'relative' }}>
        
        {/* Floating Filter UI */}
        <div className="absolute top-4 left-4 z-[1000] bg-black/85 backdrop-blur-md p-5 rounded-xl border border-white/10 w-[90%] max-w-[340px] max-h-[calc(100vh-100px)] overflow-y-auto flex flex-col gap-4">
          
          {/* Global Geocoding Search Bar Moved Here */}
          <form onSubmit={handleGlobalSearch} className="flex items-center bg-white/10 rounded-full p-1 pl-4 w-full">
            <input 
              type="text" 
              placeholder="Search any town (e.g. Thika)..." 
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none text-white outline-none text-sm placeholder-gray-400"
            />
            <button type="submit" disabled={isSearchingLocation} className="bg-red-600 text-white border-none rounded-full px-4 py-1.5 cursor-pointer text-xs font-bold hover:bg-red-700 transition-colors">
              {isSearchingLocation ? '...' : 'Go'}
            </button>
          </form>

          <div className="h-px bg-white/10 my-2"></div>

          <h3 className="m-0 text-base font-bold text-white tracking-wide">
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
            
            {/* Scraped Market Data Toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'white', cursor: 'pointer', padding: '0.5rem', backgroundColor: 'rgba(255,0,0,0.1)', borderRadius: '4px', border: '1px solid rgba(255,0,0,0.3)' }}>
              <input 
                type="checkbox" 
                checked={showScrapedData} 
                onChange={(e) => setShowScrapedData(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              Show Market Comparables ({scrapedProperties.length})
            </label>

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
            properties={showScrapedData ? [...filteredProperties, ...scrapedProperties] : filteredProperties}
            activePropertyId={activePropertyId}
            onPropertyClick={setActivePropertyId}
            onPoiClick={setActivePoi}
            searchedLocation={searchedLocation}
            onBoundsChange={fetchProperties}
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
                        <li 
                          onClick={() => setActivePoiLayer(activePoiLayer === 'hospitals' ? null : 'hospitals')}
                          style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', padding: '4px', borderRadius: '4px', backgroundColor: activePoiLayer === 'hospitals' ? 'rgba(255,255,255,0.1)' : 'transparent' }}
                        >
                          <span>🏥 Hospitals/Clinics</span>
                          <strong>{areaIntelligence.infrastructure?.hospitals?.count || 0}</strong>
                        </li>
                        <li 
                          onClick={() => setActivePoiLayer(activePoiLayer === 'schools' ? null : 'schools')}
                          style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', padding: '4px', borderRadius: '4px', backgroundColor: activePoiLayer === 'schools' ? 'rgba(255,255,255,0.1)' : 'transparent' }}
                        >
                          <span>🏫 Schools/Colleges</span>
                          <strong>{areaIntelligence.infrastructure?.schools?.count || 0}</strong>
                        </li>
                        <li style={{ display: 'flex', justifyContent: 'space-between', padding: '4px' }}>
                          <span>🛣️ Major Highways</span>
                          <strong>{areaIntelligence.infrastructure?.highways?.count || 0}</strong>
                        </li>
                        <li style={{ display: 'flex', justifyContent: 'space-between', padding: '4px' }}>
                          <span>⚡ Power Grid (Substations)</span>
                          <strong>{areaIntelligence.infrastructure?.power?.count || 0}</strong>
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
                        <li 
                          onClick={() => setActivePoiLayer(activePoiLayer === 'commercial' ? null : 'commercial')}
                          style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', padding: '4px', borderRadius: '4px', backgroundColor: activePoiLayer === 'commercial' ? 'rgba(255,255,255,0.1)' : 'transparent' }}
                        >
                          <span>🛍️ Commercial Nodes</span>
                          <strong>{areaIntelligence.infrastructure?.commercial?.count || 0}</strong>
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
                          <strong>{areaIntelligence.infrastructure?.industrial?.count || 0}</strong>
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

        {/* Bottom-Sliding POI Glassmorphism Panel (Google Maps Style) */}
        <div style={{
          position: 'absolute',
          bottom: activePoi ? '20px' : '-100%', // Slide up/down animation
          left: '20px',
          width: '380px',
          maxHeight: '75vh',
          backgroundColor: 'rgba(23, 23, 23, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          zIndex: 1001,
          transition: 'bottom 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
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
                    src={activePoi.photoUrl.startsWith('http') ? activePoi.photoUrl : supabase.storage.from('scout_photos').getPublicUrl(activePoi.photoUrl).data.publicUrl} 
                    alt={activePoi.name}
                    style={{ width: '100%', height: 'auto', maxHeight: '300px', objectFit: 'contain' }}
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
                    {(() => {
                      // Attempt to parse raw JSON from KMZ files (e.g. {"@type":"html","value":"..."})
                      try {
                        const parsed = JSON.parse(activePoi.description);
                        if (parsed && parsed.value) {
                          // Clean up extra backslashes and newlines if they are literal \n strings
                          return parsed.value.replace(/\\n/g, '\n').trim();
                        }
                      } catch (e) {
                        // Not JSON, just render the text
                      }
                      return activePoi.description.replace(/\\n/g, '\n').trim();
                    })()}
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
        
        {/* Bottom-Sliding Property Card Overlay (Zillow/Redfin Style) */}
        {activePropertyId && !activePoi && (
          <div className="absolute bottom-5 right-5 z-[1001] w-[90%] max-w-[400px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:right-5 md:left-auto left-1/2 -translate-x-1/2 md:translate-x-0 transition-all duration-300">
            {(() => {
              const allProps = [...properties, ...scrapedProperties];
              const prop = allProps.find(p => p.id === activePropertyId);
              if (!prop) return null;
              
              if (prop.isScraped) {
                // Render card for scraped market data
                return (
                  <>
                    <button 
                      onClick={() => setActivePropertyId(null)}
                      className="absolute top-3 right-3 bg-black/50 hover:bg-black/80 text-white rounded-full p-1.5 z-10 transition-colors"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
  
                    <div className="w-full h-48 bg-gray-200 relative">
                      {prop.images && prop.images[0] ? (
                        <img src={prop.images[0]} alt={prop.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">No Image</div>
                      )}
                      <div className="absolute bottom-3 left-3 bg-red-600/90 backdrop-blur text-white px-2 py-1 rounded text-xs font-bold uppercase shadow-sm">
                        Market Comparable
                      </div>
                    </div>
  
                    <div className="p-5 flex flex-col gap-3">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 m-0 leading-tight">{prop.title}</h2>
                        <p className="text-gray-500 text-sm m-0 mt-1 flex items-center gap-1">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                          {prop.location?.raw_text_location || 'Kenya'}
                        </p>
                      </div>
  
                      <div className="flex justify-between items-center bg-red-50 p-2 rounded-lg border border-red-100">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-red-800">Source: {prop.provider}</span>
                        </div>
                        <span className="text-sm font-bold text-red-700">
                          {prop.price?.currency} {prop.price?.amount?.toLocaleString()}
                        </span>
                      </div>
  
                      <p className="text-gray-600 text-sm line-clamp-3 m-0 leading-snug">
                        {prop.description}
                      </p>
  
                      <a 
                        href={prop.url} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 w-full bg-red-600 text-white text-center py-3 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-md shadow-red-600/20 block"
                      >
                        View Original Listing
                      </a>
                    </div>
                  </>
                );
              }
              
              // Get image from vision_tags if available, otherwise fallback to photo_urls
              const imageUrl = prop.vision_tags?.[0]?.photoUrl 
                ? (prop.vision_tags[0].photoUrl.startsWith('http') ? prop.vision_tags[0].photoUrl : supabase.storage.from('scout_photos').getPublicUrl(prop.vision_tags[0].photoUrl).data.publicUrl)
                : (prop.photo_urls?.[0] ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/scout_photos/${prop.photo_urls[0]}` : null);
  
              return (
                <>
                  <button 
                    onClick={() => setActivePropertyId(null)}
                    className="absolute top-3 right-3 bg-black/50 hover:bg-black/80 text-white rounded-full p-1.5 z-10 transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
  
                  {/* Half Image */}
                  <div className="w-full h-48 bg-gray-200 relative">
                    {imageUrl ? (
                      <img src={imageUrl} alt={prop.property_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">No Image Available</div>
                    )}
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur text-black px-2 py-1 rounded text-xs font-bold uppercase shadow-sm">
                      For Sale
                    </div>
                  </div>
  
                  {/* Half Text Description */}
                  <div className="p-5 flex flex-col gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 m-0 leading-tight">{prop.property_name}</h2>
                      <p className="text-gray-500 text-sm m-0 mt-1 flex items-center gap-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        {prop.location || prop.region || 'Kenya'}
                      </p>
                    </div>
  
                    <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-xs">
                          {prop.agent?.charAt(0) || 'A'}
                        </div>
                        <span className="text-sm font-semibold text-gray-800">{prop.agent || 'Listed Agent'}</span>
                      </div>
                      <span className="text-xs text-gray-500 font-medium">{prop.category?.replace(/^[A-Z]_/, '').replace('_', ' ')}</span>
                    </div>
  
                    <p className="text-gray-600 text-sm line-clamp-2 m-0 leading-snug">
                      {prop.description || 'Verified property ready for viewing.'}
                    </p>
  
                    {prop.intelligence && (
                      <div className="bg-red-50 border-l-4 border-red-600 p-3 mt-1 rounded-r-lg">
                        <h4 className="text-red-800 text-xs font-bold uppercase tracking-wider m-0 mb-1">Hazina Intelligence</h4>
                        <p className="text-red-900 text-xs m-0 leading-relaxed">{prop.intelligence}</p>
                      </div>
                    )}
  
                    <Link 
                      href={`/property/${prop.id}`} 
                      className="mt-2 w-full bg-red-600 text-white text-center py-3 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-md shadow-red-600/20"
                    >
                      View Full Details
                    </Link>
                  </div>
                </>
              );
            })()}
          </div>
        )}

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
