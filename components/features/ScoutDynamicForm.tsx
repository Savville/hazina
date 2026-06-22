'use client';

import { useState } from 'react';

type CategoryType = 'LAND' | 'RESIDENTIAL' | 'COMMERCIAL' | null;

interface ScoutDynamicFormProps {
  onSubmit: (data: any) => void;
}

export default function ScoutDynamicForm({ onSubmit }: ScoutDynamicFormProps) {
  const [category, setCategory] = useState<CategoryType>(null);
  
  // Generic state for all forms to simplify this example
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;
    onSubmit({ category, ...formData });
  };

  if (!category) {
    return (
      <div className="hz-form-category-selector">
        <h2 className="hz-form-title">Select Property Type</h2>
        <p className="hz-form-subtitle">Choose the category that best describes this parcel to load the correct assessment form.</p>
        
        <div className="hz-category-grid">
          <button 
            className="hz-category-card"
            onClick={() => setCategory('LAND')}
            type="button"
          >
            <div className="hz-category-icon">🌱</div>
            <h3>Vacant Land / Agricultural</h3>
            <p>Farms, empty plots, undeveloped land.</p>
          </button>

          <button 
            className="hz-category-card"
            onClick={() => setCategory('RESIDENTIAL')}
            type="button"
          >
            <div className="hz-category-icon">🏠</div>
            <h3>Residential</h3>
            <p>Villas, single dwellings, gated estates.</p>
          </button>

          <button 
            className="hz-category-card"
            onClick={() => setCategory('COMMERCIAL')}
            type="button"
          >
            <div className="hz-category-icon">🏢</div>
            <h3>Commercial / Warehousing</h3>
            <p>Retail spaces, godowns, office parks.</p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="hz-dynamic-form" onSubmit={handleSubmit}>
      <div className="hz-form-header-flex">
        <h2 className="hz-form-title">
          {category === 'LAND' && 'Land Assessment'}
          {category === 'RESIDENTIAL' && 'Residential Assessment'}
          {category === 'COMMERCIAL' && 'Commercial Assessment'}
        </h2>
        <button 
          type="button" 
          className="hz-btn-text"
          onClick={() => setCategory(null)}
        >
          Change Category
        </button>
      </div>

      <div className="hz-form-group">
        <label>Property Name / Identifier</label>
        <input 
          type="text" 
          required 
          placeholder="e.g. Ruaka Corner Plot"
          onChange={(e) => handleInputChange('name', e.target.value)}
        />
      </div>

      <div className="hz-form-group">
        <label>LR Number / Block Number (Critical for Legal Verify)</label>
        <input 
          type="text" 
          placeholder="e.g. Kajiado/Kaputiei/1234"
          onChange={(e) => handleInputChange('lr_number', e.target.value)}
        />
      </div>

      <div className="hz-form-group hz-checkbox-group" style={{ marginBottom: '1.5rem', backgroundColor: 'rgba(214, 0, 28, 0.05)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-primary)' }}>
        <input 
          type="checkbox" 
          id="visual_dispute" 
          onChange={(e) => handleInputChange('has_visual_dispute', e.target.checked)}
        />
        <label htmlFor="visual_dispute" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
          Are there visual signs of dispute? (e.g. "Not for sale" painted on walls)
        </label>
      </div>

      {/* ── CONDITIONAL RENDER: LAND ── */}
      {category === 'LAND' && (
        <div className="hz-form-section">
          <h3>Land Details</h3>
          
          <div className="hz-form-group">
            <label>Topography</label>
            <select required onChange={(e) => handleInputChange('topography', e.target.value)}>
              <option value="">Select Topography...</option>
              <option value="flat">Flat</option>
              <option value="gentle_slope">Gentle Slope</option>
              <option value="steep_slope">Steep Slope</option>
              <option value="marshy">Marshy / Swampy</option>
            </select>
          </div>

          <div className="hz-form-group hz-checkbox-group">
            <input 
              type="checkbox" 
              id="beacons" 
              onChange={(e) => handleInputChange('beacons_visible', e.target.checked)}
            />
            <label htmlFor="beacons">Are boundary beacons clearly visible?</label>
          </div>

          <div className="hz-form-group">
            <label>Soil Type Observation</label>
            <input 
              type="text" 
              placeholder="e.g. Black cotton, Red soil, Rocky" 
              onChange={(e) => handleInputChange('soil', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* ── CONDITIONAL RENDER: RESIDENTIAL ── */}
      {category === 'RESIDENTIAL' && (
        <div className="hz-form-section">
          <h3>Residential Details</h3>
          
          <div className="hz-form-group">
            <label>Road Access Type</label>
            <select required onChange={(e) => handleInputChange('road_access', e.target.value)}>
              <option value="">Select Road Type...</option>
              <option value="tarmac">Tarmac (Paved)</option>
              <option value="cabro">Cabro Paved</option>
              <option value="murram">Murram (Graded Dirt)</option>
              <option value="rough">Rough / Un-graded</option>
            </select>
          </div>

          <div className="hz-form-group">
            <label>Security Features (Comma separated)</label>
            <input 
              type="text" 
              placeholder="e.g. Perimeter wall, Electric fence, CCTV" 
              onChange={(e) => handleInputChange('security', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* ── CONDITIONAL RENDER: COMMERCIAL ── */}
      {category === 'COMMERCIAL' && (
        <div className="hz-form-section">
          <h3>Commercial Details</h3>
          
          <div className="hz-form-group hz-checkbox-group">
            <input 
              type="checkbox" 
              id="power3" 
              onChange={(e) => handleInputChange('three_phase_power', e.target.checked)}
            />
            <label htmlFor="power3">3-Phase Power Available?</label>
          </div>

          <div className="hz-form-group hz-checkbox-group">
            <input 
              type="checkbox" 
              id="loading_bay" 
              onChange={(e) => handleInputChange('loading_bay', e.target.checked)}
            />
            <label htmlFor="loading_bay">Accessible Loading Bay for Trucks?</label>
          </div>

          <div className="hz-form-group">
            <label>Estimated Foot Traffic / Visibility</label>
            <select required onChange={(e) => handleInputChange('foot_traffic', e.target.value)}>
              <option value="">Select Level...</option>
              <option value="high">High (Main highway/Street)</option>
              <option value="medium">Medium (Secondary road)</option>
              <option value="low">Low (Hidden / Industrial park interior)</option>
            </select>
          </div>
        </div>
      )}

      <div className="hz-form-group">
        <label>General Scout Notes</label>
        <textarea 
          rows={4} 
          placeholder="Any other observations not covered above..."
          onChange={(e) => handleInputChange('notes', e.target.value)}
        ></textarea>
      </div>

      <button type="submit" className="btn-primary w-full mt-4">
        Save & Continue to Review
      </button>
    </form>
  );
}
