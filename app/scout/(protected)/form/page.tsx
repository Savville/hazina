'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import ScoutDynamicForm from '@/components/features/ScoutDynamicForm';
import JSZip from 'jszip';
import { kml } from '@tmcw/togeojson';

export default function ScoutFormPage() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (data: any, kmzFile: File | null) => {
    if (!kmzFile) {
      alert("KMZ file is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Extract KMZ on the client (browser has DOMParser for KML)
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(kmzFile);

      const kmlFileName = Object.keys(zipContent.files).find(name => name.toLowerCase().endsWith('.kml'));
      if (!kmlFileName) throw new Error('No KML file found inside the KMZ archive.');

      const kmlText = await zipContent.file(kmlFileName)!.async('string');
      const parser = new DOMParser();
      const kmlDom = parser.parseFromString(kmlText, 'text/xml');
      const geojson = kml(kmlDom);

      const trackPoints: [number, number][] = [];
      const pois: any[] = [];
      const imageFilesToExtract: Set<string> = new Set();

      geojson.features.forEach((feature: any) => {
        if (feature.geometry?.type === 'LineString') {
          feature.geometry.coordinates.forEach((coord: number[]) => {
            trackPoints.push([coord[1], coord[0]]); // Leaflet uses [lat, lng]
          });
        } else if (feature.geometry?.type === 'Point') {
          const rawDescription = feature.properties?.description;
          const description = typeof rawDescription === 'string' ? rawDescription : (rawDescription ? JSON.stringify(rawDescription) : '');
          
          let photoFile = null;
          const imgMatch = description.match(/<img[^>]+src="([^">]+)"/i);
          if (imgMatch && imgMatch[1]) {
            photoFile = imgMatch[1];
            imageFilesToExtract.add(photoFile);
          }

          pois.push({
            lat: feature.geometry.coordinates[1],
            lng: feature.geometry.coordinates[0],
            name: feature.properties?.name || 'Unnamed Point',
            photoFile,
            description: description.replace(/<[^>]*>?/gm, '').trim()
          });
        }
      });

      // 2. Build FormData
      const fd = new FormData();
      fd.append('payload', JSON.stringify({
        name: data.name,
        category: data.category,
        formData: data,
        track: trackPoints,
        pois: pois
      }));
      
      // Extract and append images
      for (const photoPath of Array.from(imageFilesToExtract)) {
        const fileInZip = zipContent.file(photoPath);
        if (fileInZip) {
          const blob = await fileInZip.async('blob');
          fd.append('photos', blob, photoPath);
        }
      }

      const res = await fetch('/api/scout/submit', {
        method: 'POST',
        body: fd
      });

      if (res.ok) {
        alert("Assessment submitted successfully!");
        sessionStorage.removeItem('hz_scout_form'); // Clear form cache
        router.push('/scout/dashboard');
      } else {
        const errorData = await res.json();
        alert("Submission failed: " + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert("A network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="hz-scout-page">
      <main className="hz-scout-main">
        <p className="hz-scout-instruction">
          Please categorize this property to load the appropriate assessment form. 
          Ensure all visible fields are filled accurately based on your ground observation.
        </p>

        {isSubmitting && (
          <div style={{ textAlign: 'center', margin: '2rem 0', color: 'var(--color-primary)' }}>
            <p>Processing submission and uploading KMZ securely...</p>
          </div>
        )}
        <ScoutDynamicForm onSubmit={handleFormSubmit} />
      </main>
    </div>
  );
}
