'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapRecenter({ trackPoints }: { trackPoints: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (trackPoints && trackPoints.length > 0) {
      let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
      trackPoints.forEach(([lat, lng]) => {
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
      });
      const bounds = L.latLngBounds([minLat, minLng], [maxLat, maxLng]);
      map.fitBounds(bounds, { padding: [20, 20], maxZoom: 18 });
    }
  }, [trackPoints, map]);
  return null;
}

export default function AdminMapPreview({ property }: { property: any }) {
  const [mapType, setMapType] = useState<'satellite' | 'osm'>('satellite');
  const hasTrack = property?.path_points && property.path_points.length > 0;
  const track = hasTrack ? property.path_points : [[-1.2921, 36.8219]]; // default Nairobi

  return (
    <div style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)', marginBottom: '1.5rem', position: 'relative' }}>
      
      {/* Map Type Toggle Control */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
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
        center={track[0] as [number, number]} 
        zoom={14} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        {mapType === 'satellite' ? (
          <TileLayer
            attribution='&copy; <a href="https://www.google.com/intl/en_us/help/terms_maps.html">Google Maps</a>'
            url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            maxZoom={20}
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="map-tiles-dark"
          />
        )}
        
        {hasTrack && (
          <>
            {/* Draw the track line - Google Maps Style (Outer Glow) */}
            <Polyline positions={track} pathOptions={{ color: '#0055ff', weight: 8, opacity: 0.3, lineCap: 'round', lineJoin: 'round' }} />
            {/* Draw the track line - Google Maps Style (Inner Core) */}
            <Polyline positions={track} pathOptions={{ color: '#2176ff', weight: 4, opacity: 1, lineCap: 'round', lineJoin: 'round' }} />
            <MapRecenter trackPoints={track} />
          </>
        )}

        {property?.vision_tags?.map((poi: any, idx: number) => (
          <Marker key={idx} position={[poi.lat, poi.lng]}>
            <Popup>
              <strong>{poi.name}</strong><br/>
              <p style={{ margin: '4px 0', fontSize: '12px' }}>{poi.description}</p>
              {poi.photoUrl && (
                <div style={{ marginTop: '5px', fontSize: '11px', color: '#D6001C' }}>[Contains Photo]</div>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
