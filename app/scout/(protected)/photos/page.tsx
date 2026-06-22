'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ScoutPhotoUploader from '@/components/features/ScoutPhotoUploader';

export default function ScoutPhotosPage() {
  const router = useRouter();
  const [photos, setPhotos] = useState<File[]>([]);

  const handlePhotosChange = (files: File[]) => {
    setPhotos(files);
  };

  const handleContinue = () => {
    // In a real flow, we save photos to state/storage and proceed to forms
    router.push('/scout/form');
  };

  return (
    <div className="hz-scout-page">
      <header className="hz-scout-header-bar">
        <Link href="/scout/map" className="hz-back-btn">
          ← Back
        </Link>
        <h1>Attach Photos</h1>
      </header>

      <main className="hz-scout-main">
        <p className="hz-scout-instruction">
          Review the live ground-truth photos captured during tracking. You may also upload supplementary photos from your device gallery if needed (e.g. previously saved documents).
        </p>

        <ScoutPhotoUploader onPhotosChange={handlePhotosChange} />
      </main>

      <div className="hz-scout-footer-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Selected</p>
          <p style={{ margin: 0, fontWeight: 600 }}>{photos.length} photo{photos.length !== 1 ? 's' : ''}</p>
        </div>
        <button 
          className="btn-primary w-full" 
          disabled={photos.length === 0}
          onClick={handleContinue}
        >
          Continue to Assessment
        </button>
      </div>
    </div>
  );
}
