'use client';

import { useState } from 'react';
import JSZip from 'jszip';
import { kml } from '@tmcw/togeojson';

export default function KmzImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setMessage(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress('Reading KMZ file...');
    setMessage(null);

    try {
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);

      // Find KML file
      const kmlFileName = Object.keys(zipContent.files).find(name => name.toLowerCase().endsWith('.kml'));
      if (!kmlFileName) {
        throw new Error('No KML file found inside the KMZ archive.');
      }

      setProgress('Parsing KML data...');
      const kmlText = await zipContent.file(kmlFileName)!.async('string');
      
      // Parse KML to GeoJSON
      const parser = new DOMParser();
      const kmlDom = parser.parseFromString(kmlText, 'text/xml');
      const geojson = kml(kmlDom);

      const trackPoints: [number, number][] = [];
      const pois: any[] = [];
      const imageFilesToExtract: Set<string> = new Set();

      // Analyze GeoJSON features
      geojson.features.forEach((feature: any) => {
        if (feature.geometry?.type === 'LineString') {
          // GeoJSON is [lng, lat], Leaflet wants [lat, lng]
          feature.geometry.coordinates.forEach((coord: number[]) => {
            trackPoints.push([coord[1], coord[0]]);
          });
        } else if (feature.geometry?.type === 'Point') {
          const name = feature.properties?.name || 'Unnamed Point';
          
          // Ensure description is a string safely
          const rawDescription = feature.properties?.description;
          const description = typeof rawDescription === 'string' ? rawDescription : (rawDescription ? JSON.stringify(rawDescription) : '');
          
          let photoFile = null;
          // Look for image source in description (Locus Map style)
          // <img src="files/t_20260624_101300_point_1.jpg" ...
          const imgMatch = description.match(/<img[^>]+src="([^">]+)"/i);
          if (imgMatch && imgMatch[1]) {
            photoFile = imgMatch[1]; // e.g. "files/image.jpg"
            imageFilesToExtract.add(photoFile);
          }

          pois.push({
            lat: feature.geometry.coordinates[1],
            lng: feature.geometry.coordinates[0],
            name,
            photoFile,
            description: description.replace(/<[^>]*>?/gm, '').trim() // Strip HTML for clean text
          });
        }
      });

      if (trackPoints.length === 0 && pois.length === 0) {
        throw new Error('No tracks or points found in the KMZ file.');
      }

      setProgress(`Extracting ${imageFilesToExtract.size} photos...`);
      const formData = new FormData();
      
      const payload = {
        name: file.name.replace('.kmz', ''),
        originalFileName: file.name,
        track: trackPoints,
        pois: pois
      };

      formData.append('payload', JSON.stringify(payload));

      // Extract images from ZIP
      for (const photoPath of Array.from(imageFilesToExtract)) {
        const fileInZip = zipContent.file(photoPath);
        if (fileInZip) {
          const blob = await fileInZip.async('blob');
          // Important: Send the path as the file name so the API can map it
          formData.append('photos', blob, photoPath);
        } else {
          console.warn(`Referenced photo ${photoPath} not found in KMZ.`);
        }
      }

      setProgress('Uploading to Hazina Server (this may take a moment)...');

      const response = await fetch('/api/admin/kmz-import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Server error during import');
      }

      setMessage({ type: 'success', text: `Successfully imported ${trackPoints.length} track points and ${pois.length} POIs.` });
      setFile(null); // Reset
      
    } catch (error: any) {
      console.error(error);
      setMessage({ type: 'error', text: error.message || 'An unexpected error occurred.' });
    } finally {
      setIsProcessing(false);
      setProgress('');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
        Import Locus Map Data (KMZ)
      </h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
        Upload a `.kmz` file exported from Locus Map. This tool will extract your GPS track, waypoints, and any embedded field photos, and permanently save them to the Hazina map as a verified track.
      </p>

      <div style={{ 
        border: '2px dashed var(--color-border)', 
        padding: '3rem 2rem', 
        borderRadius: 'var(--radius-lg)',
        textAlign: 'center',
        backgroundColor: 'var(--color-surface)',
        marginBottom: '2rem'
      }}>
        <input 
          type="file" 
          accept=".kmz" 
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="kmz-upload"
          disabled={isProcessing}
        />
        <label 
          htmlFor="kmz-upload" 
          style={{ 
            display: 'inline-block',
            padding: '0.75rem 1.5rem', 
            backgroundColor: 'var(--color-primary)', 
            color: 'white', 
            borderRadius: '9999px',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            fontWeight: 500,
            opacity: isProcessing ? 0.7 : 1
          }}
        >
          Select .kmz File
        </label>
        
        {file && (
          <div style={{ marginTop: '1rem', fontWeight: 500 }}>
            Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </div>
        )}
      </div>

      {progress && (
        <div style={{ marginBottom: '1.5rem', color: 'var(--color-primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '16px', height: '16px', border: '2px solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          {progress}
        </div>
      )}

      {message && (
        <div style={{ 
          padding: '1rem', 
          borderRadius: 'var(--radius-sm)', 
          marginBottom: '1.5rem',
          backgroundColor: message.type === 'success' ? 'rgba(0, 200, 83, 0.1)' : 'rgba(214, 0, 28, 0.1)',
          color: message.type === 'success' ? '#00A042' : 'var(--color-primary)',
          border: `1px solid ${message.type === 'success' ? '#00A042' : 'var(--color-primary)'}`
        }}>
          {message.text}
        </div>
      )}

      <button 
        className="btn-primary" 
        onClick={handleImport}
        disabled={!file || isProcessing}
        style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
      >
        {isProcessing ? 'Processing...' : 'Upload & Save to Hazina'}
      </button>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
