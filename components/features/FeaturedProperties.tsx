'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PropertyGridCard from '@/components/ui/PropertyGridCard';

export default function FeaturedProperties() {
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch('/api/public/properties');
        if (res.ok) {
          const data = await res.json();
          // Take only the first 3 for the home page featured section
          setProperties(data.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching featured properties:', error);
      } finally {
        setIsLoading(false);
      }
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {properties.map((prop) => (
            <PropertyGridCard key={prop.id} prop={prop} />
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
