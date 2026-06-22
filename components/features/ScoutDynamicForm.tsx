'use client';

import { useState, useEffect, useRef } from 'react';
import imageCompression from 'browser-image-compression';

type CategoryType = 'A_AGRICULTURAL' | 'B_COMMERCIAL' | 'C_INDUSTRIAL' | 'D_RESIDENTIAL' | 'E_VACANT_LAND' | null;

interface ScoutDynamicFormProps {
  onSubmit: (data: any) => void;
}

function InlineCameraBtn({ label, value, onChange }: { label: string, value: string, onChange: (base64: string) => void }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const options = {
        maxSizeMB: 0.1, // extremely aggressive compression for form JSON
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = () => {
        onChange(reader.result as string);
        setIsProcessing(false);
      };
    } catch (error) {
      console.error('Error compressing image:', error);
      alert('Failed to process image. Try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ marginTop: '0.5rem' }}>
      {value ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'var(--color-dark-bg)', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <img src={value} alt="Captured" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 600 }}>Snap Captured ✓</span>
          <button type="button" onClick={() => onChange('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}>&times;</button>
        </div>
      ) : (
        <>
          <button 
            type="button" 
            onClick={() => fileRef.current?.click()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: '1px dashed var(--color-primary)', color: 'var(--color-text-inverse)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-pill)', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer' }}
          >
            {isProcessing ? 'Processing...' : `📸 Snap ${label}`}
          </button>
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            ref={fileRef} 
            onChange={handleCapture} 
            style={{ display: 'none' }} 
          />
        </>
      )}
    </div>
  );
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
          <button className="hz-category-card" onClick={() => handleCategorySelect('E_VACANT_LAND')} type="button">
            <div className="hz-category-icon">🗺️</div>
            <h3>Form E: Vacant Land</h3>
            <p>Empty plots, undeveloped land (non-agricultural).</p>
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
          {category === 'E_VACANT_LAND' && 'Form E: Vacant Land'}
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
        {formData.has_visual_dispute && (
          <div style={{ marginTop: '0.5rem' }}>
            <InlineCameraBtn 
              label="Dispute Evidence" 
              value={formData.photo_dispute || ''} 
              onChange={(val) => handleInputChange('photo_dispute', val)} 
            />
          </div>
        )}
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
            <InlineCameraBtn 
              label="Crops / Use" 
              value={formData.photo_crops || ''} 
              onChange={(val) => handleInputChange('photo_crops', val)} 
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
            <InlineCameraBtn 
              label="Soil / Terrain" 
              value={formData.photo_soil || ''} 
              onChange={(val) => handleInputChange('photo_soil', val)} 
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
            <InlineCameraBtn 
              label="Road / Access" 
              value={formData.photo_road || ''} 
              onChange={(val) => handleInputChange('photo_road', val)} 
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
            <InlineCameraBtn 
              label="Infrastructure" 
              value={formData.photo_infrastructure || ''} 
              onChange={(val) => handleInputChange('photo_infrastructure', val)} 
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
            <InlineCameraBtn 
              label="Boundary Fence" 
              value={formData.photo_boundary || ''} 
              onChange={(val) => handleInputChange('photo_boundary', val)} 
            />
          </div>
        </div>
      )}

      {/* ── CONDITIONAL RENDER: E_VACANT_LAND ── */}
      {category === 'E_VACANT_LAND' && (
        <div className="hz-form-section">
          <h3>Vacant Land Details</h3>
          
          <div className="hz-form-group">
            <label>Topography & Terrain</label>
            <input 
              type="text" 
              placeholder="e.g. Flat, gently sloping, rocky..." 
              value={formData.topography || ''}
              onChange={(e) => handleInputChange('topography', e.target.value)}
            />
          </div>

          <div className="hz-form-group">
            <label>Vegetation Cover</label>
            <input 
              type="text" 
              placeholder="e.g. Thick bush, cleared, mature trees..." 
              value={formData.vegetation || ''}
              onChange={(e) => handleInputChange('vegetation', e.target.value)}
            />
            <InlineCameraBtn 
              label="Vegetation" 
              value={formData.photo_vegetation || ''} 
              onChange={(val) => handleInputChange('photo_vegetation', val)} 
            />
          </div>
          
          <div className="hz-form-group">
            <label>Observed Potential Use / Zoning</label>
            <select value={formData.potentialUse || ''} onChange={(e) => handleInputChange('potentialUse', e.target.value)}>
              <option value="">Select Potential...</option>
              <option value="Residential">Residential (Surrounded by homes)</option>
              <option value="Commercial">Commercial (Along main road)</option>
              <option value="Mixed">Mixed Use</option>
              <option value="Unknown">Unknown / Remote</option>
            </select>
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
