'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { useRouter } from 'next/navigation';

// Dynamically import react-leaflet components to avoid SSR 'window' errors
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Polygon = dynamic(() => import('react-leaflet').then(mod => mod.Polygon), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const ZoomControl = dynamic(() => import('react-leaflet').then(mod => mod.ZoomControl), { ssr: false });

// Mock Published Data
const PUBLISHED_PARCELS = [
  {
    id: 'ASMT-001',
    name: 'Ruaka Bypass Plot',
    lr_number: 'Kiambu/Ruaka/5432',
    category: 'LAND',
    price: 'KES 15,000,000',
    status: 'FOR_SALE', // Green
    coordinates: [
      [-1.2001, 36.7820],
      [-1.2005, 36.7820],
      [-1.2005, 36.7825],
      [-1.2001, 36.7825]
    ] as [number, number][]
  },
  {
    id: 'ASMT-002',
    name: 'Kitengela Highway Commercial',
    lr_number: 'Kajiado/Kitengela/881',
    category: 'COMMERCIAL',
    price: 'KES 45,000,000',
    status: 'DISPUTED', // Red
    coordinates: [
      [-1.4800, 36.9550],
      [-1.4810, 36.9550],
      [-1.4810, 36.9560],
      [-1.4800, 36.9560]
    ] as [number, number][]
  },
  {
    id: 'ASMT-004',
    name: 'Juja Prime Estate Phase 1',
    lr_number: 'Kiambu/Juja/1090',
    category: 'RESIDENTIAL',
    price: 'KES 3,500,000 (Per 50x100)',
    status: 'FOR_SALE', // Green
    coordinates: [
      [-1.1100, 37.0100],
      [-1.1120, 37.0100],
      [-1.1120, 37.0120],
      [-1.1100, 37.0120]
    ] as [number, number][]
  },
  {
    id: 'ASMT-005',
    name: 'Private Farm - Kitisuru',
    lr_number: 'Nairobi/Block12/334',
    category: 'LAND',
    price: 'Est. KES 85,000,000',
    status: 'NOT_FOR_SALE', // Blue/Grey
    coordinates: [
      [-1.2400, 36.7600],
      [-1.2420, 36.7600],
      [-1.2420, 36.7620],
      [-1.2400, 36.7620]
    ] as [number, number][]
  }
];

export default function PublicSatelliteMap({ onSelectParcel, selectedParcel }: { onSelectParcel: (parcel: any) => void, selectedParcel?: any }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mapType, setMapType] = useState<'osm' | 'satellite'>('osm');

  // Helper component to control the map view
  const MapController = ({ parcel }: { parcel: any }) => {
    const map = (require('react-leaflet')).useMap();
    useEffect(() => {
      if (parcel && parcel.coordinates && parcel.coordinates.length > 0) {
        // Calculate a rough center from the polygon coordinates
        const lats = parcel.coordinates.map((c: any) => c[0]);
        const lngs = parcel.coordinates.map((c: any) => c[1]);
        const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
        const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
        
        map.flyTo([centerLat, centerLng], 17, {
          duration: 1.5
        });
      }
    }, [parcel, map]);
    return null;
  };

  useEffect(() => {
    (async () => {
      if (typeof window !== 'undefined') {
        const L = (await import('leaflet')).default;
        // Fix default leaflet icons in Next.js
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
        setMounted(true);
      }
    })();
  }, []);

  if (!mounted) {
    return <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a1a1a', color: '#fff' }}>Loading Intelligence Map...</div>;
  }

  // Center on Nairobi
  const centerPosition: [number, number] = [-1.2921, 36.8219];

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      
      {/* Map Layer Toggle Button */}
      <div style={{
        position: 'absolute',
        top: '2rem',
        right: '2rem',
        zIndex: 1000,
        backgroundColor: 'var(--color-dark-surface)',
        padding: '0.5rem',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
        display: 'flex',
        gap: '0.5rem',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <button 
          onClick={() => setMapType('osm')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: mapType === 'osm' ? 'var(--color-primary)' : 'transparent',
            color: mapType === 'osm' ? 'white' : 'var(--color-text-muted)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.875rem'
          }}
        >
          Street Map (OSM)
        </button>
        <button 
          onClick={() => setMapType('satellite')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: mapType === 'satellite' ? 'var(--color-primary)' : 'transparent',
            color: mapType === 'satellite' ? 'white' : 'var(--color-text-muted)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.875rem'
          }}
        >
          Satellite
        </button>
      </div>

      <MapContainer 
        center={centerPosition} 
        zoom={11} 
        style={{ height: '100%', width: '100%', zIndex: 1 }}
        zoomControl={false}
      >
        <MapController parcel={selectedParcel} />
        
        {mapType === 'satellite' ? (
          <>
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
            <TileLayer
              url="https://stamen-tiles-{s}.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}{r}.png"
              attribution='Map labels &copy; <a href="http://stamen.com">Stamen Design</a>'
            />
          </>
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        )}

        <ZoomControl position="bottomright" />

        {PUBLISHED_PARCELS.map((parcel) => {
          let polygonColor = '#10b981'; // Default Green (FOR_SALE)
          if (parcel.status === 'DISPUTED') polygonColor = '#d6001c'; // Red
          if (parcel.status === 'NOT_FOR_SALE') polygonColor = '#3b82f6'; // Blue
          
          return (
            <Polygon 
              key={parcel.id}
              positions={parcel.coordinates}
              eventHandlers={{
                click: () => {
                  onSelectParcel(parcel);
                }
              }}
              pathOptions={{ 
                color: polygonColor,
                fillColor: polygonColor,
                fillOpacity: 0.5,
                weight: 3
              }}
            >
              <Popup>
                <div>
                  <strong>{parcel.name}</strong>
                  <br />
                  LR: {parcel.lr_number}
                  <br />
                  Price: {parcel.price}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      alert('PREMIUM FEATURE:\n\nTo view the full 3-Layer Intelligence Brief (including legal analysis and high-res ground photos), please Sign In or purchase the report for KES 1,000.\n\n(This protects Hazina data from competitors)');
                    }}
                    style={{
                      width: '100%',
                      marginTop: '10px',
                      padding: '0.5rem',
                      backgroundColor: 'var(--color-primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    🔒 Unlock Intelligence Brief
                  </button>
                </div>
              </Popup>
            </Polygon>
          );
        })}
      </MapContainer>
    </div>
  );
}
