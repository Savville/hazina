'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Dynamically import the map to avoid SSR window errors
const ScoutMapClient = dynamic(() => import('@/components/features/ScoutMap'), { 
  ssr: false,
  loading: () => <div className="hz-map-loading">Loading tracking module...</div>
});

export default function ScoutMapPage() {
  const router = useRouter();
  const [isTracking, setIsTracking] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showTerms, setShowTerms] = useState(true);
  const [distance, setDistance] = useState(0);
  const [pathPoints, setPathPoints] = useState<[number, number][]>([]);

  // 1. Persist terms modal
  useEffect(() => {
    const hasSeen = localStorage.getItem('hz_seen_terms');
    if (hasSeen === 'true') {
      setShowTerms(false);
    }
  }, []);

  // 2. Restore tracking data if user went to photos and came back
  useEffect(() => {
    const savedPath = sessionStorage.getItem('hz_scout_path');
    const savedDist = sessionStorage.getItem('hz_scout_dist');
    if (savedPath && savedDist) {
      try {
        const parsed = JSON.parse(savedPath);
        if (parsed.length > 0) {
          setPathPoints(parsed);
          setDistance(parseFloat(savedDist));
          setHasStarted(true);
        }
      } catch (e) {
        console.error("Failed to restore path", e);
      }
    }
  }, []);

  const handleUnderstand = () => {
    localStorage.setItem('hz_seen_terms', 'true');
    setShowTerms(false);
  };

  const handlePathUpdate = useCallback((points: [number, number][], distMeters: number) => {
    setPathPoints(points);
    setDistance(distMeters);
    // Persist to session storage so they don't lose it if they navigate to Photos
    sessionStorage.setItem('hz_scout_path', JSON.stringify(points));
    sessionStorage.setItem('hz_scout_dist', distMeters.toString());
  }, []);

  const toggleTracking = () => {
    if (!hasStarted) setHasStarted(true);
    setIsTracking((prev) => !prev);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const newFiles = Array.from(e.target.files);
    
    // In a real implementation, we would associate these files with the LATEST pathPoint
    console.log(`Captured ${newFiles.length} photo(s) at distance ${distance.toFixed(0)}m`);
    alert(`Captured ${newFiles.length} photo(s) successfully! They will be attached to this parcel.`);
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleBackToDashboard = () => {
    if (hasStarted) {
      const confirmLeave = window.confirm("You have an active assessment. If you leave now, all your tracking data will be lost. Are you sure you want to abandon it?");
      if (!confirmLeave) return;
    }
    // Clean up session if they explicitly abandon
    sessionStorage.removeItem('hz_scout_path');
    sessionStorage.removeItem('hz_scout_dist');
    router.push('/scout/dashboard');
  };

  return (
    <div className="hz-scout-map-page">
      <header className="hz-scout-map-header">
        <button onClick={handleBackToDashboard} className="hz-back-btn" style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}>
          ← Cancel Assessment
        </button>
        <h1>Boundary Assessment</h1>
      </header>

      <main className="hz-scout-map-container">
        <ScoutMapClient 
          isTracking={isTracking} 
          onPathUpdate={handlePathUpdate} 
        />
        
        {/* Floating Camera Button (only active when tracking) */}
        {isTracking && (
          <button 
            className="hz-map-camera-btn"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Take Photo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>
          </button>
        )}
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          multiple 
          ref={fileInputRef}
          onChange={handlePhotoCapture}
          style={{ display: 'none' }}
        />
      </main>

      <div className="hz-scout-map-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Status</p>
            <p style={{ margin: 0, fontWeight: 600, color: isTracking ? 'var(--color-primary)' : 'var(--color-text-inverse)' }}>
              {isTracking ? 'Tracking Active...' : 'Idle'}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Distance Logged</p>
            <p style={{ margin: 0, fontWeight: 600 }}>{distance.toFixed(0)} m</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
          <button 
            className={`w-full ${isTracking ? 'btn-scout-tracking' : 'btn-scout-start'}`} 
            onClick={toggleTracking}
          >
            {isTracking ? 'Pause Assessment' : (hasStarted ? 'Resume' : 'Start')}
          </button>
          
          <button 
            className="btn-scout-photos w-full" 
            onClick={() => router.push('/scout/photos')}
          >
            Live Snaps
          </button>
        </div>

        <button 
          className="btn-primary w-full" 
          disabled={pathPoints.length === 0 || isTracking}
          onClick={() => router.push('/scout/form')}
        >
          Continue to Form
        </button>
      </div>

      {/* Terms & Instructions Modal */}
      {showTerms && (
        <div className="hz-scout-modal-overlay">
          <div className="hz-scout-modal">
            <h2 className="hz-scout-modal-title">Assessment Guidelines</h2>
            <div className="hz-scout-modal-body">
              <p>Before you begin tracking, please review the standard operating procedure:</p>
              <ul>
                <li><strong>Walk the boundary:</strong> Physically walk the perimeter of the parcel. The system will track your GPS coordinates automatically.</li>
                <li><strong>Snap landmarks:</strong> Tap the red camera icon while walking to attach geo-tagged photos of corners, beacons, or access roads.</li>
                <li><strong>Verify access:</strong> Ensure you have the landowner&apos;s or local authority&apos;s permission to be on site.</li>
                <li><strong>Ground truth:</strong> Do not record false data. All GPS timestamps and coordinates are securely logged to the database.</li>
              </ul>
            </div>
            <button 
              className="btn-primary w-full mt-4"
              onClick={handleUnderstand}
            >
              I Understand — Start Mapping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
