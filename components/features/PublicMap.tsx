'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon path issues in Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface PublicMapProps {
  properties: any[];
  activePropertyId?: string | null;
}

// Helper to recenter map and fit bounds when properties change or card is hovered
function MapRecenter({ properties, activeId }: { properties: any[], activeId?: string | null }) {
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

  // 2. Zoom to fit all filtered properties when the list changes
  useEffect(() => {
    if (!activeId && properties.length > 0) {
      const validPoints = properties
        .filter(p => p.path_points && p.path_points.length > 0)
        .map(p => p.path_points[0] as [number, number]);
        
      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(validPoints);
        // Add a bit of padding so pins aren't cut off at the edge
        map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
      }
    }
  }, [properties, activeId, map]);

  return null;
}

export default function PublicMap({ properties, activePropertyId }: PublicMapProps) {
  // Default center: Nairobi
  let center: [number, number] = [-1.2921, 36.8219]; 
  
  if (properties.length > 0) {
    const firstValid = properties.find(p => p.path_points && p.path_points.length > 0);
    if (firstValid) {
      center = firstValid.path_points[0] as [number, number];
    }
  }

  return (
    <div style={{ height: '100%', width: '100%', zIndex: 1 }}>
      <MapContainer 
        center={center} 
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {properties.map(prop => {
          if (!prop.path_points || prop.path_points.length === 0) return null;
          const [lat, lng] = prop.path_points[0];
          
          return (
            <Marker 
              key={prop.id} 
              position={[lat, lng]} 
              icon={customIcon}
              zIndexOffset={activePropertyId === prop.id ? 1000 : 0}
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

        <MapRecenter properties={properties} activeId={activePropertyId} />
      </MapContainer>
    </div>
  );
}
