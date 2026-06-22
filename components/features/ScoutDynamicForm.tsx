'use client';

import { useState, useEffect } from 'react';

type CategoryType = 'A_AGRICULTURAL' | 'B_COMMERCIAL' | 'C_INDUSTRIAL' | 'D_RESIDENTIAL' | null;

interface ScoutDynamicFormProps {
  onSubmit: (data: any) => void;
}

export default function ScoutDynamicForm({ onSubmit }: ScoutDynamicFormProps) {
  const [category, setCategory] = useState<CategoryType>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Restore state from sessionStorage on mount
  useEffect(() => {
    const savedData = sessionStorage.getItem('hz_scout_form');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.category) {
          setCategory(parsed.category as CategoryType);
        }
        setFormData(parsed);
      } catch (e) {
        console.error("Failed to parse saved form data", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to sessionStorage whenever form data changes
  useEffect(() => {
    if (isLoaded && category) {
      const dataToSave = { category, ...formData };
      sessionStorage.setItem('hz_scout_form', JSON.stringify(dataToSave));
    }
  }, [category, formData, isLoaded]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategorySelect = (cat: CategoryType) => {
    setCategory(cat);
    // Reset specific fields when category changes to keep data clean
    setFormData(prev => ({
      name: prev.name || '',
      lr_number: prev.lr_number || '',
      has_visual_dispute: prev.has_visual_dispute || false,
      notes: prev.notes || ''
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;
    const finalData = { category, ...formData };
    sessionStorage.setItem('hz_scout_form', JSON.stringify(finalData));
    onSubmit(finalData);
  };

  if (!isLoaded) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading form...</div>;

  if (!category) {
    return (
      <div className="hz-form-category-selector">
        <h2 className="hz-form-title">Select Property Type</h2>
        <p className="hz-form-subtitle">Choose the category that best describes this parcel to load the correct assessment form.</p>
        
        <div className="hz-category-grid">
          <button className="hz-category-card" onClick={() => handleCategorySelect('A_AGRICULTURAL')} type="button">
            <div className="hz-category-icon">🌾</div>
            <h3>Form A: Agricultural</h3>
            <p>Farms, ranches, vacant rural land.</p>
          </button>
          <button className="hz-category-card" onClick={() => handleCategorySelect('B_COMMERCIAL')} type="button">
            <div className="hz-category-icon">🏪</div>
            <h3>Form B: Commercial</h3>
            <p>Retail, offices, mixed-use plots.</p>
          </button>
          <button className="hz-category-card" onClick={() => handleCategorySelect('C_INDUSTRIAL')} type="button">
            <div className="hz-category-icon">🏭</div>
            <h3>Form C: Industrial</h3>
            <p>Warehouses, godowns, logistics.</p>
          </button>
          <button className="hz-category-card" onClick={() => handleCategorySelect('D_RESIDENTIAL')} type="button">
            <div className="hz-category-icon">🏘️</div>
            <h3>Form D: Residential</h3>
            <p>Villas, apartments, gated estates.</p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="hz-dynamic-form" onSubmit={handleSubmit}>
      <div className="hz-form-header-flex">
        <h2 className="hz-form-title">
          {category === 'A_AGRICULTURAL' && 'Form A: Agricultural'}
          {category === 'B_COMMERCIAL' && 'Form B: Commercial'}
          {category === 'C_INDUSTRIAL' && 'Form C: Industrial'}
          {category === 'D_RESIDENTIAL' && 'Form D: Residential'}
        </h2>
        <button type="button" className="hz-btn-text" onClick={() => handleCategorySelect(null)}>
          Change Category
        </button>
      </div>

      <div className="hz-form-group">
        <label>Property Name / Identifier</label>
        <input 
          type="text" 
          required 
          placeholder="e.g. Ruaka Corner Plot"
          value={formData.name || ''}
          onChange={(e) => handleInputChange('name', e.target.value)}
        />
      </div>

      <div className="hz-form-group">
        <label>LR Number / Block Number (If Known)</label>
        <input 
          type="text" 
          placeholder="e.g. Kajiado/Kaputiei/1234"
          value={formData.lr_number || ''}
          onChange={(e) => handleInputChange('lr_number', e.target.value)}
        />
      </div>

      <div className="hz-form-group hz-checkbox-group" style={{ marginBottom: '1.5rem', backgroundColor: 'rgba(214, 0, 28, 0.05)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-primary)' }}>
        <input 
          type="checkbox" 
          id="visual_dispute" 
          checked={formData.has_visual_dispute || false}
          onChange={(e) => handleInputChange('has_visual_dispute', e.target.checked)}
        />
        <label htmlFor="visual_dispute" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
          Are there visual signs of dispute? (e.g. "Not for sale" graffiti, squatters)
        </label>
      </div>

      {/* ── CONDITIONAL RENDER: A_AGRICULTURAL ── */}
      {category === 'A_AGRICULTURAL' && (
        <div className="hz-form-section">
          <h3>Agricultural Details</h3>
          
          <div className="hz-form-group">
            <label>Current Land Use / Crops</label>
            <input 
              type="text" 
              placeholder="e.g. Maize, grazing, idle..." 
              value={formData.currentCrops || ''}
              onChange={(e) => handleInputChange('currentCrops', e.target.value)}
            />
          </div>

          <div className="hz-form-group">
            <label>Water Access / Irrigation</label>
            <select value={formData.waterAccess || ''} onChange={(e) => handleInputChange('waterAccess', e.target.value)}>
              <option value="">Select option...</option>
              <option value="Borehole">On-site Borehole</option>
              <option value="River/Stream">Adjacent River/Stream</option>
              <option value="Piped">Piped County Water</option>
              <option value="None">None / Rain-fed only</option>
            </select>
          </div>

          <div className="hz-form-group">
            <label>Topography & Soil (Visual)</label>
            <input 
              type="text" 
              placeholder="e.g. Flat, black cotton soil..." 
              value={formData.soilType || ''}
              onChange={(e) => handleInputChange('soilType', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* ── CONDITIONAL RENDER: B_COMMERCIAL ── */}
      {category === 'B_COMMERCIAL' && (
        <div className="hz-form-section">
          <h3>Commercial Details</h3>
          
          <div className="hz-form-group">
            <label>Road Frontage & Condition</label>
            <input 
              type="text" 
              placeholder="e.g. ~50m frontage, Tarmac highway..." 
              value={formData.roadFrontage || ''}
              onChange={(e) => handleInputChange('roadFrontage', e.target.value)}
            />
          </div>

          <div className="hz-form-group">
            <label>Footfall / Traffic Density</label>
            <select value={formData.trafficDensity || ''} onChange={(e) => handleInputChange('trafficDensity', e.target.value)}>
              <option value="">Select Level...</option>
              <option value="High">High (Main highway/CBD)</option>
              <option value="Medium">Medium (Secondary road)</option>
              <option value="Low">Low (Off-road / upcoming)</option>
            </select>
          </div>
          
          <div className="hz-form-group">
            <label>Neighbouring Anchor Businesses</label>
            <input 
              type="text" 
              placeholder="e.g. Total Petrol Station, Naivas..." 
              value={formData.anchorBusinesses || ''}
              onChange={(e) => handleInputChange('anchorBusinesses', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* ── CONDITIONAL RENDER: C_INDUSTRIAL ── */}
      {category === 'C_INDUSTRIAL' && (
        <div className="hz-form-section">
          <h3>Industrial Details</h3>
          
          <div className="hz-form-group">
            <label>Heavy Truck Accessibility</label>
            <select value={formData.truckAccess || ''} onChange={(e) => handleInputChange('truckAccess', e.target.value)}>
              <option value="">Select Accessibility...</option>
              <option value="Excellent">Excellent (Trailer turning space)</option>
              <option value="Fair">Fair (Canters only)</option>
              <option value="Poor">Poor (Narrow/rough access)</option>
            </select>
          </div>

          <div className="hz-form-group">
            <label>Power & Infrastructure</label>
            <input 
              type="text" 
              placeholder="e.g. 3-Phase power visible, sewer line..." 
              value={formData.infrastructure || ''}
              onChange={(e) => handleInputChange('infrastructure', e.target.value)}
            />
          </div>
          
          <div className="hz-form-group">
            <label>Environmental Factors (Drainage)</label>
            <input 
              type="text" 
              placeholder="e.g. Prone to flooding, well drained..." 
              value={formData.environment || ''}
              onChange={(e) => handleInputChange('environment', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* ── CONDITIONAL RENDER: D_RESIDENTIAL ── */}
      {category === 'D_RESIDENTIAL' && (
        <div className="hz-form-section">
          <h3>Residential Details</h3>
          
          <div className="hz-form-group">
            <label>Neighbourhood Density</label>
            <select value={formData.density || ''} onChange={(e) => handleInputChange('density', e.target.value)}>
              <option value="">Select Density...</option>
              <option value="High">High (Apartments/Flats)</option>
              <option value="Medium">Medium (Maisonettes/Townhouses)</option>
              <option value="Low">Low (Bungalows/1-Acre plots)</option>
              <option value="Empty">Undeveloped/Empty</option>
            </select>
          </div>

          <div className="hz-form-group">
            <label>Basic Amenities</label>
            <input 
              type="text" 
              placeholder="e.g. Electricity on site, septic required..." 
              value={formData.amenities || ''}
              onChange={(e) => handleInputChange('amenities', e.target.value)}
            />
          </div>
          
          <div className="hz-form-group">
            <label>Security & Boundary Status</label>
            <input 
              type="text" 
              placeholder="e.g. Chainlink fence, open..." 
              value={formData.boundary || ''}
              onChange={(e) => handleInputChange('boundary', e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="hz-form-group mt-4">
        <label>General Scout Notes</label>
        <textarea 
          rows={4} 
          placeholder="Any other observations not covered above..."
          value={formData.notes || ''}
          onChange={(e) => handleInputChange('notes', e.target.value)}
        ></textarea>
      </div>

      <button type="submit" className="btn-primary w-full mt-6">
        Save & Continue to Area Data
      </button>
    </form>
  );
}
