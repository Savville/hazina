'use client';

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default Leaflet marker icon in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to handle auto-centering when new points arrive
function MapTracker({ latestPoint }: { latestPoint: L.LatLngExpression | null }) {
  const map = useMap();
  useEffect(() => {
    if (latestPoint) {
      map.setView(latestPoint, map.getZoom(), { animate: true });
    }
  }, [latestPoint, map]);
  return null;
}

function calculateDistance(points: L.LatLng[]): number {
  if (points.length < 2) return 0;
  let dist = 0;
  for (let i = 1; i < points.length; i++) {
    dist += points[i - 1].distanceTo(points[i]);
  }
  return dist; // in meters
}

export default function ScoutMap({ 
  isTracking,
  onPathUpdate 
}: { 
  isTracking: boolean;
  onPathUpdate: (points: [number, number][], distanceMeters: number) => void;
}) {
  const [path, setPath] = useState<L.LatLng[]>([]);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (path.length > 0) {
      const dist = calculateDistance(path);
      onPathUpdate(
        path.map(p => [p.lat, p.lng]), 
        dist
      );
    }
  }, [path, onPathUpdate]);

  useEffect(() => {
    if (!isTracking) {
      // Stop tracking
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    // Start tracking
    if ('geolocation' in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const newPoint = L.latLng(position.coords.latitude, position.coords.longitude);
          
          setPath((prevPath) => {
            // Optional: Filter out points that are too close (e.g. GPS noise < 2 meters)
            if (prevPath.length > 0) {
              const lastPoint = prevPath[prevPath.length - 1];
              if (lastPoint.distanceTo(newPoint) < 2) {
                return prevPath;
              }
            }
            
            return [...prevPath, newPoint];
          });
        },
        (error) => {
          console.error('Error watching position:', error);
          if (error.code === error.PERMISSION_DENIED) {
            alert('Location access is required for tracking. Please enable it in your browser settings.');
          }
        },
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 10000,
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isTracking, onPathUpdate]);

  // Default to Nairobi center roughly
  const defaultCenter: L.LatLngExpression = [-1.2921, 36.8219];
  const latestPoint = path.length > 0 ? path[path.length - 1] : null;

  return (
    <div className="hz-map-wrapper">
      <MapContainer 
        center={defaultCenter} 
        zoom={16} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Draw the walked path */}
        {path.length > 1 && (
          <Polyline positions={path} color="var(--color-primary)" weight={4} opacity={0.8} />
        )}

        {/* Draw the current position */}
        {latestPoint && (
          <Marker position={latestPoint} />
        )}

        {/* Keep the map centered on the latest point while tracking */}
        <MapTracker latestPoint={latestPoint} />
      </MapContainer>
    </div>
  );
}
