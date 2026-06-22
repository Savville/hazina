'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import Link from 'next/link';

export default function FeaturedProperties() {
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data, error } = await supabase
        .from('scout_assessments')
        .select('*')
        .eq('status', 'verified')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Error fetching featured properties:', error);
      } else if (data) {
        setProperties(data);
      }
      setIsLoading(false);
    };

    fetchFeatured();
  }, []);

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>Loading featured properties...</div>;
  }

  if (properties.length === 0) {
    return null; // Don't show the section if there are no verified properties
  }

  return (
    <section className="hz-section-featured">
      <div className="container">
        <div className="hz-section-header">
          <h2 className="hz-section-title">Verified Land for Sale</h2>
          <p className="hz-section-subtitle">Physically inspected by Hazina Scouts. Real photos, real data.</p>
        </div>
        
        <div className="hz-property-grid">
          {properties.map((prop) => (
            <Link href={`/property/${prop.id}`} key={prop.id} className="hz-property-card">
              <div className="hz-property-card-image">
                {prop.photo_urls && prop.photo_urls.length > 0 ? (
                  <img 
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/scout_photos/${prop.photo_urls[0]}`} 
                    alt={prop.property_name} 
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '0.875rem' }}>
                    Awaiting Field Photos
                  </div>
                )}
                <span className="hz-property-card-badge">Verified</span>
              </div>
              
              <div className="hz-property-card-content">
                <h3 className="hz-property-card-title">{prop.property_name}</h3>
                <div className="hz-property-card-meta">
                  <span>{prop.category.replace('A_', '').replace('B_', '').replace('C_', '').replace('D_', '').replace('E_', '').replace('_', ' ')}</span>
                  <span>•</span>
                  <span>{parseFloat(prop.distance_meters || 0).toFixed(0)}m perimeter</span>
                </div>
                <p className="hz-property-card-price">Price Upon Request</p>
              </div>
            </Link>
          ))}
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <Link href="/properties" className="btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
            Browse All Properties
          </Link>
        </div>
      </div>
    </section>
  );
}
