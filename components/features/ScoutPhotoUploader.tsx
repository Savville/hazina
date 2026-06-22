'use client';

import { useState, useRef, useEffect } from 'react';
import imageCompression from 'browser-image-compression';

interface ScoutPhotoUploaderProps {
  onPhotosChange: (files: File[]) => void;
  initialPhotos?: File[];
}

export default function ScoutPhotoUploader({ onPhotosChange, initialPhotos = [] }: ScoutPhotoUploaderProps) {
  const [previews, setPreviews] = useState<{ id: string; url: string; file: File }[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialPhotos.length > 0 && previews.length === 0) {
      const initialPreviews = initialPhotos.map(file => ({
        id: Math.random().toString(36).substring(7),
        url: URL.createObjectURL(file),
        file
      }));
      setPreviews(initialPreviews);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPhotos]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsCompressing(true);

    try {
      const newFiles = Array.from(e.target.files);
      const compressedFiles: File[] = [];

      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      };

      for (const file of newFiles) {
        if (file.type.startsWith('image/')) {
          const compressedBlob = await imageCompression(file, options);
          const compressedFile = new File([compressedBlob], file.name, {
            type: compressedBlob.type,
            lastModified: Date.now(),
          });
          compressedFiles.push(compressedFile);
        } else {
          compressedFiles.push(file);
        }
      }
      
      const newPreviews = compressedFiles.map(file => ({
        id: Math.random().toString(36).substring(7),
        url: URL.createObjectURL(file),
        file
      }));

      const updatedPreviews = [...previews, ...newPreviews];
      setPreviews(updatedPreviews);
      onPhotosChange(updatedPreviews.map(p => p.file));
    } catch (error) {
      console.error('Error compressing image:', error);
      alert('Failed to compress image. Please try again.');
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (idToRemove: string) => {
    const updatedPreviews = previews.filter(p => p.id !== idToRemove);
    
    // Cleanup the object URL to avoid memory leaks
    const removed = previews.find(p => p.id === idToRemove);
    if (removed) URL.revokeObjectURL(removed.url);

    setPreviews(updatedPreviews);
    onPhotosChange(updatedPreviews.map(p => p.file));
  };

  return (
    <div className="hz-photo-uploader">
      {/* Upload Button */}
      <button 
        type="button" 
        className="hz-photo-add-btn"
        onClick={() => fileInputRef.current?.click()}
        disabled={isCompressing}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
          <circle cx="12" cy="13" r="3"/>
        </svg>
        <span>{isCompressing ? 'Compressing Image...' : 'Take Live Photo'}</span>
      </button>

      {/* Hidden File Input */}
      <input 
        type="file" 
        accept="image/*" 
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Preview Grid */}
      {previews.length > 0 && (
        <div className="hz-photo-grid">
          {previews.map((preview, index) => (
            <div key={preview.id} className="hz-photo-preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview.url} alt={`Scout upload ${index}`} />
              <button 
                type="button" 
                className="hz-photo-remove"
                onClick={() => handleRemove(preview.id)}
                aria-label="Remove photo"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
