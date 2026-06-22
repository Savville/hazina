'use client';

import { useState, useRef } from 'react';

interface ScoutPhotoUploaderProps {
  onPhotosChange: (files: File[]) => void;
}

export default function ScoutPhotoUploader({ onPhotosChange }: ScoutPhotoUploaderProps) {
  const [previews, setPreviews] = useState<{ id: string; url: string; file: File }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const newFiles = Array.from(e.target.files);
    
    // Create preview URLs
    const newPreviews = newFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      url: URL.createObjectURL(file),
      file
    }));

    const updatedPreviews = [...previews, ...newPreviews];
    setPreviews(updatedPreviews);
    onPhotosChange(updatedPreviews.map(p => p.file));
    
    // Reset input so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
          <circle cx="12" cy="13" r="3"/>
        </svg>
        <span>Take Live Photo</span>
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
