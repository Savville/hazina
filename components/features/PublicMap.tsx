'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
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
  onPoiClick?: (poi: any) => void;
  searchedLocation?: { lat: number, lng: number, boundingbox?: string[] } | null;
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

export default function PublicMap({ properties, activePropertyId, onPoiClick, searchedLocation }: PublicMapProps) {
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

          // Special rendering for KMZ Tracks
          if (prop.category === 'E_KMZ_TRACK') {
            return (
              <div key={prop.id}>
                {/* Draw the track line */}
                <Polyline 
                  positions={prop.path_points} 
                  pathOptions={{ color: '#D6001C', weight: 4, opacity: 0.8 }} 
                />
                
                {/* Draw the Points of Interest (POIs) */}
                {prop.vision_tags && prop.vision_tags.map((poi: any, idx: number) => (
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
              </div>
            );
          }

          // Standard rendering for single point properties
          const point = prop.path_points[0];
          if (!Array.isArray(point) || point.length < 2) return null;
          
          const [lat, lng] = point;
          if (typeof lat !== 'number' || typeof lng !== 'number') return null;
          
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

        <MapRecenter properties={properties} activeId={activePropertyId} searchedLocation={searchedLocation} />
      </MapContainer>
    </div>
  );
}
