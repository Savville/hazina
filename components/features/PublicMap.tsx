'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, useMapEvents, Tooltip } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon path issues in Next.js
// Gold icon for Hazina Verified scout pins
const customIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Minimal red icon for zoomed-out Estate view
const estateIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Red icon for unverified scraped properties (guessed locations)
const unverifiedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface PublicMapProps {
  properties: any[];
  activePropertyId?: string | null;
  onPoiClick?: (poi: any) => void;
  searchedLocation?: { lat: number, lng: number, boundingbox?: string[] } | null;
  activePoiLayer?: string | null;
  poiData?: any[];
  onBoundsChange?: (bounds: { n: number, s: number, e: number, w: number }) => void;
  onPropertyClick?: (id: string) => void;
}

// Helper to recenter map and fit bounds when properties change, card is hovered, or searched
function MapRecenter({ properties, activeId, searchedLocation }: { properties: any[], activeId?: string | null, searchedLocation?: { lat: number, lng: number, boundingbox?: string[] } | null }) {
  const map = useMap();
  
  // 1. Zoom to specific property on hover
  useEffect(() => {
    if (activeId) {
      const activeProp = properties.find(p => p.id === activeId);
      if (activeProp && activeProp.path_points && activeProp.path_points.length > 0) {
        const [lat, lng] = activeProp.path_points[0];
        map.flyTo([lat, lng], 16, { duration: 1.5 });
      }
    }
  }, [activeId, properties, map]);

  // 1.5 Zoom to geocoded search location
  useEffect(() => {
    if (searchedLocation && !activeId) {
      if (searchedLocation.boundingbox) {
        // Nominatim boundingbox is [latMin, latMax, lonMin, lonMax] (string array)
        const [latMin, latMax, lonMin, lonMax] = searchedLocation.boundingbox.map(Number);
        const bounds = L.latLngBounds([latMin, lonMin], [latMax, lonMax]);
        map.flyToBounds(bounds, { padding: [20, 20], duration: 2 });
      } else {
        map.flyTo([searchedLocation.lat, searchedLocation.lng], 14, { duration: 2 });
      }
    }
  }, [searchedLocation, activeId, map]);

  // 2. Zoom to fit all filtered properties when the list changes
  useEffect(() => {
    if (!activeId && !searchedLocation && properties.length > 0) {
      let minLat = Infinity, maxLat = -Infinity;
      let minLng = Infinity, maxLng = -Infinity;
      let validCount = 0;

      properties.forEach(p => {
        if (p.path_points && Array.isArray(p.path_points)) {
          const pointsToCheck = p.category === 'E_KMZ_TRACK' ? p.path_points : [p.path_points[0]];
          
          pointsToCheck.forEach((pt: any) => {
            if (Array.isArray(pt) && pt.length >= 2) {
              const lat = Number(pt[0]);
              const lng = Number(pt[1]);
              if (!isNaN(lat) && !isNaN(lng)) {
                minLat = Math.min(minLat, lat);
                maxLat = Math.max(maxLat, lat);
                minLng = Math.min(minLng, lng);
                maxLng = Math.max(maxLng, lng);
                validCount++;
              }
            }
          });
        }
      });
        
      if (validCount > 1 && minLat !== Infinity) {
        const bounds = L.latLngBounds([minLat, minLng], [maxLat, maxLng]);
        // Add padding and limit maxZoom so it doesn't zoom in too close
        map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5, maxZoom: 16 });
      } else if (validCount === 1 && minLat !== Infinity) {
        // If there's exactly 1 point, just center on it at zoom 16
        map.flyTo([minLat, minLng], 16, { duration: 1.5 });
      }
    }
  }, [properties, activeId, searchedLocation, map]);

  return null;
}

// Handler to track zoom level and map bounds in state
function MapEventsHandler({ 
  setZoomLevel, 
  onBoundsChange 
}: { 
  setZoomLevel: (z: number) => void,
  onBoundsChange?: (bounds: { n: number, s: number, e: number, w: number }) => void
}) {
  const map = useMapEvents({
    zoomend: () => {
      setZoomLevel(map.getZoom());
      triggerBoundsChange();
    },
    moveend: () => {
      triggerBoundsChange();
    }
  });

  const triggerBoundsChange = () => {
    if (onBoundsChange) {
      const bounds = map.getBounds();
      onBoundsChange({
        n: bounds.getNorth(),
        s: bounds.getSouth(),
        e: bounds.getEast(),
        w: bounds.getWest()
      });
    }
  };

  // Trigger once on mount to get initial bounds
  useEffect(() => {
    triggerBoundsChange();
  }, []);

  return null;
}

export default function PublicMap({ properties, activePropertyId, onPoiClick, searchedLocation, activePoiLayer, poiData, onBoundsChange, onPropertyClick }: PublicMapProps) {
  const [mounted, setMounted] = useState(false);
  const [mapType, setMapType] = useState<'satellite' | 'osm'>('satellite');
  const [zoomLevel, setZoomLevel] = useState(6); // Default starting zoom
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Default center: Nairobi
  let center: [number, number] = [-1.2921, 36.8219]; 
  
  if (properties.length > 0) {
    const firstValid = properties.find(p => p.path_points && p.path_points.length > 0);
    if (firstValid) {
      center = firstValid.path_points[0] as [number, number];
    }
  }

  return (
    <div style={{ height: '100%', width: '100%', zIndex: 1, position: 'relative' }}>
      
      {/* Map Type Toggle Control */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        zIndex: 1000,
        backgroundColor: 'rgba(23, 23, 23, 0.9)',
        backdropFilter: 'blur(10px)',
        padding: '0.25rem',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        gap: '4px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
      }}>
        <button
          onClick={() => setMapType('satellite')}
          style={{
            padding: '0.5rem 0.75rem',
            backgroundColor: mapType === 'satellite' ? 'var(--color-primary)' : 'transparent',
            color: mapType === 'satellite' ? '#fff' : 'var(--color-text-muted)',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: 600,
            transition: 'all 0.2s ease'
          }}
        >
          🛰️ Satellite
        </button>
        <button
          onClick={() => setMapType('osm')}
          style={{
            padding: '0.5rem 0.75rem',
            backgroundColor: mapType === 'osm' ? '#333' : 'transparent',
            color: mapType === 'osm' ? '#fff' : 'var(--color-text-muted)',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: 600,
            transition: 'all 0.2s ease'
          }}
        >
          🗺️ Street
        </button>
      </div>

      <MapContainer 
        center={center} 
        zoom={14} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <MapEventsHandler setZoomLevel={setZoomLevel} onBoundsChange={onBoundsChange} />
        {mapType === 'satellite' ? (
          <TileLayer
            attribution='&copy; <a href="https://www.google.com/intl/en_us/help/terms_maps.html">Google Maps</a>'
            url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            maxZoom={20}
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        )}
        
        {/* Interactive POI Layer Render */}
        {activePoiLayer && poiData && poiData.length > 0 && (
          <MarkerClusterGroup chunkedLoading>
            {poiData.map((poi: any, idx: number) => {
              let emoji = '📍';
              if (activePoiLayer === 'hospitals') emoji = '🏥';
              if (activePoiLayer === 'schools') emoji = '🏫';
              if (activePoiLayer === 'commercial') emoji = '🛍️';

              const poiIcon = L.divIcon({
                html: `<div style="font-size: 24px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">${emoji}</div>`,
                className: 'custom-poi-icon',
                iconSize: [30, 30],
                iconAnchor: [15, 30]
              });

              return (
                <Marker key={`poi-${idx}`} position={[poi.lat, poi.lng]} icon={poiIcon}>
                  <Popup>
                    <strong style={{ fontSize: '14px', color: '#1a1a1a' }}>{poi.name}</strong><br/>
                    <span style={{ fontSize: '11px', color: '#666' }}>Type: {activePoiLayer.toUpperCase()}</span>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        )}

        {properties.map(prop => {
          // Special rendering for KMZ Tracks
          if (prop.category === 'E_KMZ_TRACK') {
            if (!prop.path_points || prop.path_points.length === 0) return null;
            return (
              <div key={prop.id}>
                {zoomLevel >= 13 ? (
                  <>
                    {/* Draw the track line - Google Maps Style (Outer Glow) */}
                    <Polyline 
                      positions={prop.path_points} 
                      pathOptions={{ 
                        color: '#0055ff', 
                        weight: hoveredPropertyId === prop.id ? 12 : 8, 
                        opacity: hoveredPropertyId === prop.id ? 0.5 : 0.3, 
                        lineCap: 'round', 
                        lineJoin: 'round' 
                      }} 
                      eventHandlers={{
                        mouseover: (e) => {
                          setHoveredPropertyId(prop.id);
                          e.target.bringToFront();
                        },
                        mouseout: () => setHoveredPropertyId(null)
                      }}
                    >
                      <Tooltip sticky direction="top" offset={[0, -5]}>
                        <strong>{prop.property_name}</strong>
                      </Tooltip>
                    </Polyline>
                    {/* Draw the track line - Google Maps Style (Inner Core) */}
                    <Polyline 
                      positions={prop.path_points} 
                      pathOptions={{ 
                        color: '#2176ff', 
                        weight: hoveredPropertyId === prop.id ? 5 : 4, 
                        opacity: 1, 
                        lineCap: 'round', 
                        lineJoin: 'round' 
                      }} 
                      // Inner core doesn't need events/tooltip since outer covers it, but good for consistent z-indexing
                      eventHandlers={{
                        mouseover: (e) => {
                          setHoveredPropertyId(prop.id);
                          e.target.bringToFront();
                        },
                        mouseout: () => setHoveredPropertyId(null)
                      }}
                    />
                    
                    {/* Draw the Points of Interest (POIs) */}
                    {prop.vision_tags && prop.vision_tags.length > 0 && (
                      <MarkerClusterGroup chunkedLoading>
                        {prop.vision_tags.map((poi: any, idx: number) => (
                          <Marker 
                            key={`poi-${prop.id}-${idx}`} 
                            position={[poi.lat, poi.lng]}
                            icon={customIcon}
                            eventHandlers={{
                              click: () => {
                                if (onPoiClick) onPoiClick(poi);
                              }
                            }}
                          />
                        ))}
                      </MarkerClusterGroup>
                    )}
                  </>
                ) : (
                  // Zoomed out view: Just show a single Estate Pin
                  <Marker 
                    position={prop.path_points[0] as [number, number]} 
                    icon={estateIcon}
                    eventHandlers={{ click: () => onPropertyClick?.(prop.id) }}
                  >
                    <Popup>
                      <strong>{prop.property_name}</strong>
                      <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                        Zoom in to view tracks and photos
                      </div>
                    </Popup>
                  </Marker>
                )}
              </div>
            );
          }

          // Standard rendering for single point properties or mock properties
          let lat, lng;
          if (prop.path_points && Array.isArray(prop.path_points[0])) {
            lat = prop.path_points[0][0];
            lng = prop.path_points[0][1];
          } else if (prop.center_lat && prop.center_lng) {
            lat = prop.center_lat;
            lng = prop.center_lng;
          } else {
            return null;
          }
          
          if (typeof lat !== 'number' || typeof lng !== 'number') return null;
          
          let iconToUse = customIcon;
          if (prop.category === 'MARKET_AGGREGATED') {
            iconToUse = unverifiedIcon;
          }
          
          return (
            <Marker 
              key={prop.id} 
              position={[lat, lng]} 
              icon={iconToUse}
              zIndexOffset={activePropertyId === prop.id ? 1000 : 0}
              eventHandlers={{ click: () => onPropertyClick?.(prop.id) }}
            >
              <Popup>
                <div style={{ fontFamily: 'var(--font-body)', color: '#000' }}>
                  <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700 }}>{prop.property_name}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{prop.category.replace('_', ' ')}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <MapRecenter properties={properties} activeId={activePropertyId} searchedLocation={searchedLocation} />
      </MapContainer>
    </div>
  );
}
