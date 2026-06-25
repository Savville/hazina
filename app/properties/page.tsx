'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import Link from 'next/link';
import PublicNavbar from '@/components/layout/PublicNavbar';
import PropertyGridCard from '@/components/ui/PropertyGridCard';

export default function BrowsePropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchAllVerified = async () => {
      try {
        const res = await fetch('/api/public/properties');
        if (res.ok) {
          const data = await res.json();
          setProperties(data);
        } else {
          console.error('Failed to fetch properties');
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllVerified();
  }, []);

  return (
    <div className="hz-home" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── Navbar ── */}
      <PublicNavbar />

      <main className="hz-page-container" style={{ flexGrow: 1, width: '100%' }}>
        <h1 className="hz-page-title">Kenya Real Estate</h1>
        <p className="hz-page-subtitle">Browse ground-verified properties across all counties.</p>

        {isLoading ? (
          <p style={{ color: 'var(--color-text-muted)' }}>Loading verified listings...</p>
        ) : properties.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>No verified properties found at this time.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 pb-16">
            {properties.map((prop) => (
              <PropertyGridCard key={prop.id} prop={prop} />
            ))}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="hz-footer" style={{ marginTop: 'auto' }}>
        <div className="container hz-footer__inner">
          <span className="hz-footer__wordmark">Hazina</span>
          <p className="hz-footer__note">
            This platform is for informational purposes only and does not constitute a formal valuation.
          </p>
          <p className="hz-footer__copy">&copy; {new Date().getFullYear()} Hazina. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
