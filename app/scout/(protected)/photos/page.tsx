'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ScoutPhotoUploader from '@/components/features/ScoutPhotoUploader';
import { savePhotosToIndexedDB, getPhotosFromIndexedDB } from '@/lib/offlineStorage';

export default function ScoutPhotosPage() {
  const router = useRouter();
  const [photos, setPhotos] = useState<File[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Vision Tags State
  const [showTagForm, setShowTagForm] = useState(false);
  const [selectedTag, setSelectedTag] = useState('Caveat Emptor Graffiti');
  const [tagNotes, setTagNotes] = useState('');
  const [visionTags, setVisionTags] = useState<{ id: string; tag: string; notes: string; timestamp: number }[]>([]);
  
  const tagFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadStoredData = async () => {
      // Load Vision Tags
      const savedTags = sessionStorage.getItem('hz_vision_tags');
      if (savedTags) {
        try {
          setVisionTags(JSON.parse(savedTags));
        } catch (e) {
          console.error("Failed to restore vision tags", e);
        }
      }

      // Load Photos from IndexedDB
      const savedPhotos = await getPhotosFromIndexedDB();
      if (savedPhotos.length > 0) {
        setPhotos(savedPhotos);
      }
      setIsLoaded(true);
    };

    loadStoredData();
  }, []);

  const handlePhotosChange = async (files: File[]) => {
    setPhotos(files);
    await savePhotosToIndexedDB(files);
  };

  const handleSaveTag = () => {
    if (!tagNotes.trim()) {
      alert('Please add some details before saving.');
      return;
    }
    const newTag = {
      id: Math.random().toString(36).substring(7),
      tag: selectedTag,
      notes: tagNotes,
      timestamp: Date.now()
    };
    const updatedTags = [...visionTags, newTag];
    setVisionTags(updatedTags);
    sessionStorage.setItem('hz_vision_tags', JSON.stringify(updatedTags));
    
    setTagNotes('');
    setShowTagForm(false);
  };

  const removeTag = (id: string) => {
    const updatedTags = visionTags.filter(t => t.id !== id);
    setVisionTags(updatedTags);
    sessionStorage.setItem('hz_vision_tags', JSON.stringify(updatedTags));
  };

  const handleToggleForm = () => {
    const willShow = !showTagForm;
    setShowTagForm(willShow);
    if (willShow) {
      setTimeout(() => {
        tagFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  };

  const handleContinue = () => {
    // In a real flow, we save photos to state/storage and proceed to forms
    router.push('/scout/form');
  };

  return (
    <div className="hz-scout-page">
      <main className="hz-scout-main" style={{ paddingBottom: '140px' }}>
        <h1 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-text-inverse)' }}>Attach Photos & Context</h1>
        <p className="hz-scout-instruction">
          Review the live ground-truth photos. Below the photos, you can add contextual "Vision Tags" to explain what is visible in the images (e.g., graffiti, squatters).
        </p>

        {isLoaded ? (
          <ScoutPhotoUploader onPhotosChange={handlePhotosChange} initialPhotos={photos} />
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Restoring saved photos...
          </div>
        )}

        <div className="hz-vision-tags-section" style={{ marginTop: '2rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Vision Context Tags</h2>
          
          {visionTags.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {visionTags.map((tag) => (
                <div key={tag.id} style={{ padding: '0.75rem', backgroundColor: 'var(--color-dark-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', position: 'relative' }}>
                  <p style={{ margin: '0 0 0.25rem 0', fontWeight: 600, color: 'var(--color-primary)' }}>{tag.tag}</p>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-inverse)' }}>{tag.notes}</p>
                  <button 
                    onClick={() => removeTag(tag.id)}
                    style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '0.25rem' }}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}

          {!showTagForm ? (
            <button 
              onClick={handleToggleForm}
              style={{ width: '100%', padding: '0.75rem', backgroundColor: 'transparent', border: '1px dashed var(--color-primary)', color: 'var(--color-primary)', borderRadius: '8px', fontWeight: 500, cursor: 'pointer' }}
            >
              + Add Vision Tag
            </button>
          ) : (
            <div ref={tagFormRef} style={{ padding: '1rem', backgroundColor: 'var(--color-dark-surface)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>New Tag</h3>
                <button onClick={() => setShowTagForm(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}>&times;</button>
              </div>

              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Select Tag Type</label>
              <select 
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-dark-bg)', color: 'var(--color-text-inverse)', marginBottom: '1rem' }}
              >
                <option value="Caveat Emptor Graffiti">🛑 "Caveat Emptor" Graffiti</option>
                <option value="Squatter Encampment">🚨 Squatter Encampment</option>
                <option value="Destroyed Beacons">⚠️ Destroyed Beacons</option>
                <option value="Physical Roadblock">🚧 Physical Roadblock</option>
                <option value="Active Construction">🚜 Active Construction</option>
                <option value="Other Observation">👁️ Other Observation</option>
              </select>

              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Description of what you see</label>
              <textarea 
                placeholder="e.g. 'Graffiti painted on the iron sheet gate saying DO NOT BUY...'"
                value={tagNotes}
                onChange={(e) => setTagNotes(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-dark-bg)', color: 'var(--color-text-inverse)', minHeight: '100px', marginBottom: '1rem', resize: 'vertical' }}
              />

              <button 
                className="btn-primary w-full"
                onClick={handleSaveTag}
              >
                Save Tag
              </button>
            </div>
          )}
        </div>
      </main>

      <div className="hz-scout-footer-panel" style={{ zIndex: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Context Saved</p>
          <p style={{ margin: 0, fontWeight: 600 }}>{photos.length} photo(s), {visionTags.length} tag(s)</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            className="w-full" 
            style={{ backgroundColor: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-inverse)', borderRadius: 'var(--radius-pill)', padding: '0.75rem 1rem', fontFamily: 'var(--font-body)', fontSize: '0.9375rem', fontWeight: 700, cursor: 'pointer' }}
            onClick={() => router.push('/scout/map')}
          >
            Back to Map
          </button>
          <button 
            className="btn-primary w-full" 
            disabled={photos.length === 0 && visionTags.length === 0}
            onClick={handleContinue}
          >
            Continue to Form
          </button>
        </div>
      </div>
    </div>
  );
}
