'use client';

import { useEffect } from 'react';
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
  const hasTrack = property?.path_points && property.path_points.length > 0;
  const track = hasTrack ? property.path_points : [[-1.2921, 36.8219]]; // default Nairobi

  return (
    <div style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
      <MapContainer 
        center={track[0] as [number, number]} 
        zoom={14} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles-dark"
        />
        
        {hasTrack && (
          <>
            <Polyline positions={track} color="#D6001C" weight={4} opacity={0.8} />
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
