'use client';

import { useState, useEffect, useRef } from 'react';
import imageCompression from 'browser-image-compression';

interface ScoutDynamicFormProps {
  onSubmit: (data: any, kmzFile: File | null) => void;
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
        maxSizeMB: 0.1,
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
  const [formData, setFormData] = useState<Record<string, any>>({
    part1_macro: {},
    part2_construction: {},
    part3_land: {},
    part4_viability: {},
    part5_crm: {}
  });
  const [kmzFile, setKmzFile] = useState<File | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('hz_scout_pipeline_v2');
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to parse saved form data", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('hz_scout_pipeline_v2', JSON.stringify(formData));
    }
  }, [formData, isLoaded]);

  const handleRootChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePartChange = (part: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [part]: {
        ...(prev[part] || {}),
        [field]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kmzFile) {
      alert('Please upload a KMZ file before submitting.');
      return;
    }
    onSubmit(formData, kmzFile);
  };

  if (!isLoaded) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Form...</div>;

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6 bg-black text-white p-4 rounded-xl">
      
      {/* ── HEADER & KMZ UPLOAD ── */}
      <div className="bg-[#0a0a0a] p-6 rounded-xl border border-gray-800">
        <h2 className="text-2xl font-bold mb-6 text-white">Area Intelligence Brief</h2>
        
        <div className="mb-4">
          <label className="block text-gray-400 text-sm font-medium mb-2">General Area Name / Identifier</label>
          <input 
            type="text" 
            required 
            placeholder="e.g. Ruaka Ridge Area"
            value={formData.name || ''}
            onChange={(e) => handleRootChange('name', e.target.value)}
            className="w-full bg-[#111] text-white border border-gray-700 rounded-md p-3 focus:border-red-600 outline-none"
          />
        </div>

        <div className="mt-4">
          <label className="flex items-center gap-2 text-red-500 font-semibold mb-1">
            📍 Upload KMZ File (Required)
          </label>
          <p className="text-gray-500 text-sm mb-4">
            Attach the exported .kmz route and pins from Locus Map.
          </p>
          <input 
            type="file" 
            accept=".kmz"
            required
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setKmzFile(file);
            }}
            className="w-full p-3 bg-[#111] rounded-md text-white border border-dashed border-gray-700"
          />
        </div>
      </div>

      {/* ── FORM 1: MACRO-ECONOMICS ── */}
      <div className="bg-[#0a0a0a] p-6 rounded-xl border border-gray-800 border-l-4 border-l-red-600">
        <h3 className="text-xl font-bold text-white mb-1">Form 1: Area Macro-Economics</h3>
        <p className="text-gray-500 text-sm mb-6">Prices of standard daily goods in this specific village/area.</p>
        
        <div className="mb-4"><label className="block text-gray-400 text-sm font-medium mb-2">Maize Flour (2kg packet) [KES]</label><input type="number" placeholder="e.g. 210" value={formData.part1_macro?.maize_flour || ''} onChange={(e) => handlePartChange('part1_macro', 'maize_flour', e.target.value)} className="w-full bg-[#111] text-white border border-gray-700 rounded-md p-3 focus:border-red-600 outline-none"/></div>
        <div className="mb-4"><label className="block text-gray-400 text-sm font-medium mb-2">Cooking Oil (1 Litre) [KES]</label><input type="number" placeholder="e.g. 350" value={formData.part1_macro?.cooking_oil || ''} onChange={(e) => handlePartChange('part1_macro', 'cooking_oil', e.target.value)} className="w-full bg-[#111] text-white border border-gray-700 rounded-md p-3 focus:border-red-600 outline-none"/></div>
        <div className="mb-4"><label className="block text-gray-400 text-sm font-medium mb-2">Sugar (1 kg) [KES]</label><input type="number" placeholder="e.g. 180" value={formData.part1_macro?.sugar || ''} onChange={(e) => handlePartChange('part1_macro', 'sugar', e.target.value)} className="w-full bg-[#111] text-white border border-gray-700 rounded-md p-3 focus:border-red-600 outline-none"/></div>
        <div className="mb-4"><label className="block text-gray-400 text-sm font-medium mb-2">Milk (500ml fresh) [KES]</label><input type="number" placeholder="e.g. 60" value={formData.part1_macro?.milk || ''} onChange={(e) => handlePartChange('part1_macro', 'milk', e.target.value)} className="w-full bg-[#111] text-white border border-gray-700 rounded-md p-3 focus:border-red-600 outline-none"/></div>
        <div className="mb-4"><label className="block text-gray-400 text-sm font-medium mb-2">Casual Labor Wage (Per Day) [KES]</label><input type="number" placeholder="e.g. 800" value={formData.part1_macro?.labor_wage || ''} onChange={(e) => handlePartChange('part1_macro', 'labor_wage', e.target.value)} className="w-full bg-[#111] text-white border border-gray-700 rounded-md p-3 focus:border-red-600 outline-none"/></div>
        <div className="mb-4"><label className="block text-gray-400 text-sm font-medium mb-2">Boda-Boda Fare (To Highway) [KES]</label><input type="number" placeholder="e.g. 50" value={formData.part1_macro?.boda_fare || ''} onChange={(e) => handlePartChange('part1_macro', 'boda_fare', e.target.value)} className="w-full bg-[#111] text-white border border-gray-700 rounded-md p-3 focus:border-red-600 outline-none"/></div>
      </div>

      {/* ── FORM 2: CONSTRUCTION ECONOMICS ── */}
      <div className="bg-[#0a0a0a] p-6 rounded-xl border border-gray-800 border-l-4 border-l-yellow-500">
        <h3 className="text-xl font-bold text-white mb-1">Form 2: Construction Economics</h3>
        <p className="text-gray-500 text-sm mb-6">Local costs of building materials if sourced in this area.</p>
        
        <div className="mb-4"><label className="block text-gray-400 text-sm font-medium mb-2">Building Stones (per foot) [KES]</label><input type="number" placeholder="e.g. 45" value={formData.part2_construction?.building_stones || ''} onChange={(e) => handlePartChange('part2_construction', 'building_stones', e.target.value)} className="w-full bg-[#111] text-white border border-gray-700 rounded-md p-3 focus:border-red-600 outline-none"/></div>
        <div className="mb-4"><label className="block text-gray-400 text-sm font-medium mb-2">River Sand (per lorry) [KES]</label><input type="number" placeholder="e.g. 15000" value={formData.part2_construction?.river_sand || ''} onChange={(e) => handlePartChange('part2_construction', 'river_sand', e.target.value)} className="w-full bg-[#111] text-white border border-gray-700 rounded-md p-3 focus:border-red-600 outline-none"/></div>
        <div className="mb-4"><label className="block text-gray-400 text-sm font-medium mb-2">Cement (50kg bag) [KES]</label><input type="number" placeholder="e.g. 850" value={formData.part2_construction?.cement || ''} onChange={(e) => handlePartChange('part2_construction', 'cement', e.target.value)} className="w-full bg-[#111] text-white border border-gray-700 rounded-md p-3 focus:border-red-600 outline-none"/></div>
        <div className="mb-4"><label className="block text-gray-400 text-sm font-medium mb-2">Water Bowser (10,000L Truck) [KES]</label><input type="number" placeholder="e.g. 4000" value={formData.part2_construction?.water_bowser || ''} onChange={(e) => handlePartChange('part2_construction', 'water_bowser', e.target.value)} className="w-full bg-[#111] text-white border border-gray-700 rounded-md p-3 focus:border-red-600 outline-none"/></div>
      </div>

      {/* ── FORM 3: LAND & AGRI ── */}
      <div className="bg-[#0a0a0a] p-6 rounded-xl border border-gray-800 border-l-4 border-l-green-500">
        <h3 className="text-xl font-bold text-white mb-6">Form 3: Land & Agricultural Data</h3>
        
        <div className="mb-4">
          <label className="block text-gray-400 text-sm font-medium mb-2">Topography (Slope)</label>
          <select value={formData.part3_land?.topography || ''} onChange={(e) => handlePartChange('part3_land', 'topography', e.target.value)} className="w-full bg-[#111] text-white border border-gray-700 rounded-md p-3 focus:border-red-600 outline-none">
            <option value="">Select...</option>
            <option value="Flat">Flat</option>
            <option value="Gentle Slope">Gentle Slope</option>
            <option value="Steep/Hilly">Steep / Hilly</option>
            <option value="Rocky">Rocky / Uneven</option>
          </select>
        </div>

        <div className="mb-4"><label className="block text-gray-400 text-sm font-medium mb-2">Soil Type & Appearance</label><input type="text" placeholder="e.g. Deep red volcanic, Black cotton..." value={formData.part3_land?.soil_type || ''} onChange={(e) => handlePartChange('part3_land', 'soil_type', e.target.value)} className="w-full bg-[#111] text-white border border-gray-700 rounded-md p-3 focus:border-red-600 outline-none"/></div>
        <div className="mb-4"><label className="block text-gray-400 text-sm font-medium mb-2">Visible Fertility (Crops)</label><input type="text" placeholder="e.g. Healthy maize, stunted coffee..." value={formData.part3_land?.visible_fertility || ''} onChange={(e) => handlePartChange('part3_land', 'visible_fertility', e.target.value)} className="w-full bg-[#111] text-white border border-gray-700 rounded-md p-3 focus:border-red-600 outline-none"/></div>
        
        <div className="mb-4">
          <label className="block text-gray-400 text-sm font-medium mb-2">Water Accessibility</label>
          <select value={formData.part3_land?.water_access || ''} onChange={(e) => handlePartChange('part3_land', 'water_access', e.target.value)} className="w-full bg-[#111] text-white border border-gray-700 rounded-md p-3 focus:border-red-600 outline-none">
            <option value="">Select...</option>
            <option value="Active Borehole">Active Borehole</option>
            <option value="Piped County Water">Piped County Water</option>
            <option value="Seasonal River">Seasonal River</option>
            <option value="None">None (Rain fed only)</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-400 text-sm font-medium mb-2">Flood Risk Indicators</label>
          <select value={formData.part3_land?.flood_risk || ''} onChange={(e) => handlePartChange('part3_land', 'flood_risk', e.target.value)} className="w-full bg-[#111] text-white border border-gray-700 rounded-md p-3 focus:border-red-600 outline-none">
            <option value="">Select...</option>
            <option value="Safe">Safe (Well drained)</option>
            <option value="Valley Bottom">Valley Bottom</option>
            <option value="Drainage Trenches">Drainage trenches present</option>
            <option value="Watermarks">Watermarks on trees/buildings</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-400 text-sm font-medium mb-2">Road Passability (Wet Season)</label>
          <select value={formData.part3_land?.road_passability || ''} onChange={(e) => handlePartChange('part3_land', 'road_passability', e.target.value)} className="w-full bg-[#111] text-white border border-gray-700 rounded-md p-3 focus:border-red-600 outline-none">
            <option value="">Select...</option>
            <option value="All-weather/Tarmac">All-weather / Tarmac</option>
            <option value="Passable">Passable when wet</option>
            <option value="Impassable">Impassable during heavy rains</option>
          </select>
        </div>

        <div className="flex gap-4 mt-6">
          <InlineCameraBtn label="Soil Photo" value={formData.part3_land?.photo_soil || ''} onChange={(val) => handlePartChange('part3_land', 'photo_soil', val)} />
          <InlineCameraBtn label="Slope Photo" value={formData.part3_land?.photo_slope || ''} onChange={(val) => handlePartChange('part3_land', 'photo_slope', val)} />
        </div>
      </div>

      {/* ── FORM 4: RESIDENTIAL & COMMERCIAL ── */}
      <div className="bg-[#0a0a0a] p-6 rounded-xl border border-gray-800 border-l-4 border-l-blue-500">
        <h3 className="text-xl font-bold text-white mb-6">Form 4: Viability & Infrastructure</h3>
        
        <div className="mb-4"><label className="block text-gray-400 text-sm font-medium mb-2">Infrastructure Proximity</label><input type="text" placeholder="e.g. 500m to tarmac, 100m to transformer..." value={formData.part4_viability?.infrastructure || ''} onChange={(e) => handlePartChange('part4_viability', 'infrastructure', e.target.value)} className="w-full bg-[#111] text-white border border-gray-700 rounded-md p-3 focus:border-red-600 outline-none"/></div>
        
        <div className="mb-4">
          <label className="block text-gray-400 text-sm font-medium mb-2">Grid Reliability (Power)</label>
          <select value={formData.part4_viability?.grid_reliability || ''} onChange={(e) => handlePartChange('part4_viability', 'grid_reliability', e.target.value)} className="w-full bg-[#111] text-white border border-gray-700 rounded-md p-3 focus:border-red-600 outline-none">
            <option value="">Select...</option>
            <option value="Very Reliable">Very Reliable</option>
            <option value="Frequent Blackouts">Frequent Blackouts / Rationing</option>
            <option value="No Grid">No Grid Connection</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-400 text-sm font-medium mb-2">Mobile Network Signal</label>
          <select value={formData.part4_viability?.network_signal || ''} onChange={(e) => handlePartChange('part4_viability', 'network_signal', e.target.value)} className="w-full bg-[#111] text-white border border-gray-700 rounded-md p-3 focus:border-red-600 outline-none">
            <option value="">Select...</option>
            <option value="Strong">Strong 4G/5G</option>
            <option value="Weak">Weak Signal</option>
            <option value="Deadzone">Deadzone (No Network)</option>
          </select>
        </div>

        <div className="mb-8">
          <label className="block text-gray-400 text-sm font-medium mb-2">Surrounding Land Use (Zoning)</label>
          <select value={formData.part4_viability?.zoning || ''} onChange={(e) => handlePartChange('part4_viability', 'zoning', e.target.value)} className="w-full bg-[#111] text-white border border-gray-700 rounded-md p-3 focus:border-red-600 outline-none">
            <option value="">Select...</option>
            <option value="Strictly Residential">Strictly Residential</option>
            <option value="Mixed Commercial">Mixed Commercial</option>
            <option value="Farming">Farming</option>
            <option value="Industrial">Industrial</option>
          </select>
        </div>

        {/* Existing Structures Sub-Section */}
        <h4 className="text-lg font-bold text-white mb-4 border-t border-gray-800 pt-6">Existing Structures (If Applicable)</h4>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Bedrooms</label>
            <input type="number" placeholder="e.g. 3" value={formData.part4_viability?.bedrooms || ''} onChange={(e) => handlePartChange('part4_viability', 'bedrooms', e.target.value ? parseInt(e.target.value) : '')} className="w-full bg-[#111] text-white border border-gray-700 rounded-md p-3 focus:border-red-600 outline-none"/>
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Bathrooms</label>
            <input type="number" placeholder="e.g. 2" value={formData.part4_viability?.bathrooms || ''} onChange={(e) => handlePartChange('part4_viability', 'bathrooms', e.target.value ? parseInt(e.target.value) : '')} className="w-full bg-[#111] text-white border border-gray-700 rounded-md p-3 focus:border-red-600 outline-none"/>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-400 text-sm font-medium mb-2">Interior Condition</label>
          <select value={formData.part4_viability?.interior_condition || ''} onChange={(e) => handlePartChange('part4_viability', 'interior_condition', e.target.value)} className="w-full bg-[#111] text-white border border-gray-700 rounded-md p-3 focus:border-red-600 outline-none">
            <option value="">Select...</option>
            <option value="Move-in Ready">Move-in Ready (Excellent)</option>
            <option value="Needs Minor Renovation">Needs Minor Renovation</option>
            <option value="Requires Major Repair">Requires Major Repair</option>
            <option value="Unfinished Shell">Unfinished Shell</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-400 text-sm font-medium mb-2">Indoor Plumbing / Water Connectivity</label>
          <select value={formData.part4_viability?.indoor_plumbing || ''} onChange={(e) => handlePartChange('part4_viability', 'indoor_plumbing', e.target.value)} className="w-full bg-[#111] text-white border border-gray-700 rounded-md p-3 focus:border-red-600 outline-none">
            <option value="">Select...</option>
            <option value="Fully Connected (Hot & Cold)">Fully Connected (Hot & Cold)</option>
            <option value="Cold Water Only">Cold Water Only</option>
            <option value="Outside Tap Only">Outside Tap Only</option>
            <option value="No Plumbing">No Plumbing</option>
          </select>
        </div>
      </div>

      {/* ── FORM 5: PRIVATE CRM ── */}
      <div className="bg-[#1a0505] p-6 rounded-xl border border-red-900 border-l-4 border-l-red-600">
        <h3 className="text-xl font-bold text-red-500 mb-1">Form 5: Private CRM & Legal (CONFIDENTIAL)</h3>
        <p className="text-red-300/60 text-sm mb-6">This data is locked to Hazina HQ and never published to the public investor map.</p>
        
        <div className="mb-4"><label className="block text-gray-400 text-sm font-medium mb-2">Landowner Name</label><input type="text" placeholder="Name of owner..." value={formData.part5_crm?.landowner_name || ''} onChange={(e) => handlePartChange('part5_crm', 'landowner_name', e.target.value)} className="w-full bg-[#111] text-white border border-gray-700 rounded-md p-3 focus:border-red-600 outline-none"/></div>
        <div className="mb-4"><label className="block text-gray-400 text-sm font-medium mb-2">Landowner Phone Number</label><input type="text" placeholder="Phone number..." value={formData.part5_crm?.landowner_phone || ''} onChange={(e) => handlePartChange('part5_crm', 'landowner_phone', e.target.value)} className="w-full bg-[#111] text-white border border-gray-700 rounded-md p-3 focus:border-red-600 outline-none"/></div>
        
        <div className="mb-4">
          <label className="block text-gray-400 text-sm font-medium mb-2">Title Deed Status</label>
          <select value={formData.part5_crm?.title_status || ''} onChange={(e) => handlePartChange('part5_crm', 'title_status', e.target.value)} className="w-full bg-[#111] text-white border border-gray-700 rounded-md p-3 focus:border-red-600 outline-none">
            <option value="">Select...</option>
            <option value="Ready Freehold">Ready Freehold</option>
            <option value="Share Certificate">Share Certificate</option>
            <option value="Ongoing Adjudication">Ongoing Adjudication</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-400 text-sm font-medium mb-2">Scout's Assessment of Urgency</label>
          <select value={formData.part5_crm?.urgency || ''} onChange={(e) => handlePartChange('part5_crm', 'urgency', e.target.value)} className="w-full bg-[#111] text-white border border-gray-700 rounded-md p-3 focus:border-red-600 outline-none">
            <option value="">Select...</option>
            <option value="Highly motivated">Highly motivated to sell (Discount possible)</option>
            <option value="Firm on price">Firm on price</option>
            <option value="Not selling">Not selling</option>
          </select>
        </div>

        <div className="mb-4"><label className="block text-gray-400 text-sm font-medium mb-2">Private Scout Notes</label><textarea rows={3} placeholder="Anything suspicious, highly lucrative, or off-the-record..." value={formData.part5_crm?.private_notes || ''} onChange={(e) => handlePartChange('part5_crm', 'private_notes', e.target.value)} className="w-full bg-[#111] text-white border border-gray-700 rounded-md p-3 focus:border-red-600 outline-none"></textarea></div>
      </div>

      <button type="submit" className="w-full py-4 mt-4 bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-xl transition-colors">
        Submit Complete Intelligence Brief
      </button>
    </form>
  );
}
