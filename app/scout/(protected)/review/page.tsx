'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ScoutReviewPage() {
  const router = useRouter();
  
  const [data, setData] = useState<{
    path: any[];
    dist: string | null;
    form: any;
    area: any;
  }>({
    path: [],
    dist: null,
    form: null,
    area: null
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // 1. Check network status
    setIsOffline(!navigator.onLine);
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 2. Collate data from session storage
    try {
      const pathRaw = sessionStorage.getItem('hz_scout_path');
      const distRaw = sessionStorage.getItem('hz_scout_dist');
      const formRaw = sessionStorage.getItem('hz_scout_form');
      const areaRaw = sessionStorage.getItem('hz_scout_area');

      setData({
        path: pathRaw ? JSON.parse(pathRaw) : [],
        dist: distRaw,
        form: formRaw ? JSON.parse(formRaw) : null,
        area: areaRaw ? JSON.parse(areaRaw) : null,
      });
    } catch (e) {
      console.error('Failed to parse session data', e);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real app, we would send this to Supabase:
    // await supabase.from('assessments').insert([{
    //   boundary_polygon: data.path,
    //   distance_meters: data.dist,
    //   property_details: data.form,
    //   area_intelligence: data.area,
    //   scout_id: user.id
    // }]);

    alert(isOffline 
      ? 'Saved to Local Outbox! Data will sync when you regain connection.' 
      : 'Assessment Submitted Successfully to Hazina HQ!'
    );

    // Clean up session
    sessionStorage.removeItem('hz_scout_path');
    sessionStorage.removeItem('hz_scout_dist');
    sessionStorage.removeItem('hz_scout_form');
    sessionStorage.removeItem('hz_scout_area');
    sessionStorage.removeItem('hz_seen_terms'); // Reset onboarding for the next parcel
    
    router.push('/scout/dashboard');
  };

  if (!data.form) {
    return (
      <div className="hz-scout-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <p>No active assessment found.</p>
        <button onClick={() => router.push('/scout/dashboard')} className="btn-primary mt-4">Go to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="hz-scout-page">
      <header className="hz-scout-header">
        <div className="hz-scout-header-inner">
          <Link href="/scout/area" className="hz-back-btn">
            ← Back to Area Data
          </Link>
          <div className="hz-scout-profile">
            <div className="hz-scout-avatar">S</div>
          </div>
        </div>
      </header>

      <main className="hz-scout-main" style={{ paddingBottom: '100px' }}>
        <h2 className="hz-form-title">Final Review</h2>
        <p className="hz-form-subtitle">
          Verify the collected intelligence before submitting to headquarters.
        </p>

        {/* ── SUMMARY CARD ── */}
        <div className="hz-review-card">
          <div className="hz-review-section">
            <h3>📍 Spatial Data</h3>
            <p><strong>Distance Logged:</strong> {data.dist ? parseFloat(data.dist).toFixed(0) : 0} meters</p>
            <p><strong>Boundary Points:</strong> {data.path.length} GPS Coordinates</p>
          </div>

          <div className="hz-review-section">
            <h3>📑 Property Profile</h3>
            <p><strong>Name:</strong> {data.form.name || 'N/A'}</p>
            <p><strong>Category:</strong> {data.form.category || 'N/A'}</p>
            <p><strong>LR Number:</strong> <span className={data.form.lr_number ? '' : 'hz-text-warning'}>{data.form.lr_number || 'Missing (High Risk)'}</span></p>
            {data.form.has_visual_dispute && (
              <p className="hz-text-danger">⚠️ <strong>Visual Dispute Logged</strong></p>
            )}
          </div>

          <div className="hz-review-section">
            <h3>🏘️ Neighborhood Economy</h3>
            <p><strong>Unga (2KG):</strong> KES {data.area?.priceUnga || 'N/A'}</p>
            <p><strong>Milk (500ml):</strong> KES {data.area?.priceMilk || 'N/A'}</p>
            <p><strong>Boda Fare to Main Road:</strong> KES {data.area?.bodaFare || 'N/A'}</p>
          </div>
        </div>

        {isOffline && (
          <div className="hz-offline-warning">
            ⚠️ You are currently offline. Your assessment will be saved to your Outbox.
          </div>
        )}
      </main>

      {/* ── FIXED BOTTOM ACTION ── */}
      <div className="hz-scout-footer-panel" style={{ position: 'absolute', bottom: 0, width: '100%', left: 0 }}>
        <button 
          className="btn-primary w-full" 
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={isOffline ? { backgroundColor: 'var(--color-text-muted)' } : {}}
        >
          {isSubmitting 
            ? 'Encrypting & Syncing...' 
            : (isOffline ? 'Save to Outbox (Offline)' : 'Submit to HQ')
          }
        </button>
      </div>
    </div>
  );
}
