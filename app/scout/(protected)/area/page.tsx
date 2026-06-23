'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ScoutAreaPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    distanceToTarmac: '',
    publicTransport: '',
    waterReliability: '',
    powerReliability: '',
    pricePlot: '',
    priceBuildSqm: '',
    priceUnga: '',
    priceMilk: '',
    bodaFare: '',
    priceCement: '',
    priceIronSheet: '',
    generalAreaSafety: 'medium',
  });

  useEffect(() => {
    const savedArea = sessionStorage.getItem('hz_scout_area');
    if (savedArea) {
      try {
        setFormData(JSON.parse(savedArea));
      } catch (e) {
        console.error("Failed to restore area data", e);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newState = { ...prev, [name]: value };
      sessionStorage.setItem('hz_scout_area', JSON.stringify(newState));
      return newState;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to session storage
    sessionStorage.setItem('hz_scout_area', JSON.stringify(formData));
    
    // Move to final review
    router.push('/scout/review'); // We will build this in Feature 08
  };

  return (
    <div className="hz-scout-page">
      <header className="hz-scout-header">
        <div className="hz-scout-header-inner">
          <Link href="/scout/form" className="hz-back-btn">
            ← Back to Property Form
          </Link>
          <div className="hz-scout-profile">
            <div className="hz-scout-avatar">S</div>
          </div>
        </div>
      </header>

      <main className="hz-scout-main">
        <p className="hz-scout-instruction">
          Log the neighborhood intelligence. This data is critical for calculating cost of living and rental yields.
        </p>

        <form className="hz-dynamic-form" onSubmit={handleSubmit}>
          
          {/* ── AMENITIES ── */}
          <div className="hz-form-section" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
            <h3>Area Amenities</h3>
            
            <div className="hz-form-group">
              <label>Distance to Nearest Tarmac Road</label>
              <select name="distanceToTarmac" required value={formData.distanceToTarmac} onChange={handleChange}>
                <option value="">Select distance...</option>
                <option value="under_100m">Under 100 meters</option>
                <option value="under_500m">Under 500 meters</option>
                <option value="under_1km">Under 1 kilometer</option>
                <option value="over_1km">Over 1 kilometer</option>
              </select>
            </div>

            <div className="hz-form-group">
              <label>Public Transport (Matatu Stage) Access</label>
              <select name="publicTransport" required value={formData.publicTransport} onChange={handleChange}>
                <option value="">Select access level...</option>
                <option value="excellent">Excellent (Walking distance)</option>
                <option value="fair">Fair (Requires short boda-boda ride)</option>
                <option value="poor">Poor (Hard to access)</option>
              </select>
            </div>

            <div className="hz-form-group">
              <label>Primary Water Source</label>
              <select name="waterReliability" required value={formData.waterReliability} onChange={handleChange}>
                <option value="">Select source...</option>
                <option value="council">County/City Council Water</option>
                <option value="borehole">Private / Community Borehole</option>
                <option value="vendor">Water Vendors (Mkokoteni)</option>
              </select>
            </div>

            <div className="hz-form-group">
              <label>Power Grid Reliability</label>
              <select name="powerReliability" required value={formData.powerReliability} onChange={handleChange}>
                <option value="">Select reliability...</option>
                <option value="stable">Highly Stable (Rare outages)</option>
                <option value="frequent_blackouts">Frequent Blackouts</option>
                <option value="off_grid">Off-Grid (Solar/Generator Needed)</option>
              </select>
            </div>
          </div>

          {/* ── REAL ESTATE VALUATION DATA ── */}
          <div className="hz-form-section">
            <h3>Local Real Estate Valuation</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              Ask local brokers or residents for the current going rates in this immediate vicinity.
            </p>

            <div className="hz-form-group">
              <label>Estimated Price of a 50x100 Plot in KES</label>
              <input 
                type="number" 
                name="pricePlot" 
                required 
                placeholder="e.g. 1500000"
                min="50000"
                value={formData.pricePlot} 
                onChange={handleChange}
              />
            </div>

            <div className="hz-form-group">
              <label>Estimated Local Construction Cost (Per Sqm) in KES</label>
              <input 
                type="number" 
                name="priceBuildSqm" 
                required 
                placeholder="e.g. 35000"
                min="10000" max="100000"
                value={formData.priceBuildSqm} 
                onChange={handleChange}
              />
            </div>
          </div>

          {/* ── COST OF LIVING BASKET ── */}
          <div className="hz-form-section">
            <h3>Cost of Living Basket (Local Kiosk Check)</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              Ask the nearest local shopkeeper for these prices. This provides hard economic data on the neighborhood.
            </p>

            <div className="hz-form-group">
              <label>Price of 2KG Maize Flour (Unga) in KES</label>
              <input 
                type="number" 
                name="priceUnga" 
                required 
                placeholder="e.g. 210"
                min="100" max="400"
                value={formData.priceUnga} 
                onChange={handleChange}
              />
            </div>

            <div className="hz-form-group">
              <label>Price of 500ml Fresh Milk in KES</label>
              <input 
                type="number" 
                name="priceMilk" 
                required 
                placeholder="e.g. 60"
                min="40" max="150"
                value={formData.priceMilk} 
                onChange={handleChange}
              />
            </div>

            <div className="hz-form-group">
              <label>Average Boda-Boda Fare from Main Road in KES</label>
              <input 
                type="number" 
                name="bodaFare" 
                required 
                placeholder="e.g. 50"
                min="0" max="500"
                value={formData.bodaFare} 
                onChange={handleChange}
              />
            </div>

            <div className="hz-form-group">
              <label>Price of 50kg Cement Bag (Local Hardware) in KES</label>
              <input 
                type="number" 
                name="priceCement" 
                required 
                placeholder="e.g. 850"
                min="500" max="2000"
                value={formData.priceCement} 
                onChange={handleChange}
              />
            </div>

            <div className="hz-form-group">
              <label>Price of G30 Iron Sheet (Mabati) in KES</label>
              <input 
                type="number" 
                name="priceIronSheet" 
                required 
                placeholder="e.g. 1200"
                min="500" max="5000"
                value={formData.priceIronSheet} 
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full mt-4">
            Save Neighborhood Data
          </button>
        </form>
      </main>
    </div>
  );
}
