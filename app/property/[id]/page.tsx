'use client';

import { useState, useEffect, use } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const PublicMapClient = dynamic(() => import('@/components/features/PublicMap'), { ssr: false });

export default function PropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const propertyId = unwrappedParams.id;
  
  const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const url = propertyId !== 'demo' ? `/api/public/properties?id=${propertyId}` : '/api/public/properties';
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch property');
        
        const data = await res.json();
        
        if (data && data.length > 0) {
          setProperty(data[0]);
        } else {
          setProperty(null);
        }
      } catch (err) {
        console.error('Error fetching property:', err);
        setProperty(null);
      }
      setIsLoading(false);
    };

    fetchProperty();
  }, [propertyId]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500 font-[Outfit]">Loading intelligence data...</div>;
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-500 font-[Outfit] bg-gray-50">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Property Not Found</h1>
        <p className="mb-6">This property may not exist or is pending verification by Hazina HQ.</p>
        <Link href="/properties" className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors">
          Browse Verified Listings
        </Link>
      </div>
    );
  }

  // Parse Data
  const formData = property.form_data || {};
  const areaData = property.area_data || {};
  const photos = property.photo_urls || [];
  
  // Format Price
  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const displayPrice = formData.price ? formatter.format(formData.price) : 'Price Upon Request';

  return (
    <div className="min-h-screen bg-white font-[Outfit]">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-[100] bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-red-600 tracking-tight">Hazina</Link>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-700">
            <Link href="/" className="hover:text-red-600">Home</Link>
            <Link href="/map" className="hover:text-red-600">Interactive Map</Link>
            <Link href="/submit" className="hover:text-red-600">Partnership</Link>
          </nav>
        </div>
      </header>

      {/* ── Hero Image Carousel/Mosaic (Redfin Style) ── */}
      <div className="w-full bg-black relative" style={{ height: '500px' }}>
        {photos.length > 0 ? (
          <div className="flex w-full h-full gap-1 p-1">
            {/* Main large image */}
            <div className="w-2/3 h-full relative group cursor-pointer" onClick={() => setActivePhoto(0)}>
              <img src={photos[0]} alt="Property Main" className="w-full h-full object-cover rounded-l-lg hover:opacity-90 transition-opacity" />
              <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded text-sm font-bold backdrop-blur-sm">
                1 / {photos.length}
              </div>
            </div>
            {/* Grid of smaller images */}
            <div className="w-1/3 h-full flex flex-col gap-1">
              {photos.slice(1, 3).map((photoSrc: string, idx: number) => (
                <div key={idx} className="h-1/2 w-full relative group cursor-pointer" onClick={() => setActivePhoto(idx + 1)}>
                  <img src={photoSrc} alt={`Property view ${idx+2}`} className={`w-full h-full object-cover hover:opacity-90 transition-opacity ${idx === 1 ? 'rounded-br-lg' : 'rounded-tr-lg'}`} />
                  {idx === 1 && photos.length > 3 && (
                    <div className="absolute inset-0 bg-black/50 rounded-br-lg flex items-center justify-center text-white font-bold text-lg hover:bg-black/60 transition-colors">
                      +{photos.length - 3} Photos
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
           <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
             No images available
           </div>
        )}
      </div>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-12">
        
        {/* ── Left Column: Property Details & Intelligence ── */}
        <div className="lg:w-2/3">
          
          {/* Header Section */}
          <div className="flex justify-between items-start mb-6 border-b border-gray-200 pb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{displayPrice}</h1>
              <div className="flex items-center gap-4 text-gray-600 mb-4 text-lg">
                <span><strong className="text-gray-900">{formData.bedrooms || '-'}</strong> beds</span>
                <span><strong className="text-gray-900">{formData.bathrooms || '-'}</strong> baths</span>
                <span><strong className="text-gray-900">{formData.sqft ? formData.sqft.toLocaleString() : '-'}</strong> sq ft</span>
              </div>
              <h2 className="text-xl text-gray-800">{property.property_name}</h2>
              <div className="mt-4 inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm">
                <svg className="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Hazina Verified
              </div>
            </div>
          </div>

          {/* About This Home */}
          <section className="mb-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">About this home</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {formData.description || "Description not provided."}
            </p>
          </section>

          {/* Quick Facts Grid */}
          <section className="mb-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <div className="text-sm text-gray-500 mb-1">Property Type</div>
                <div className="font-bold text-gray-900">{formData.propertyType || 'Unknown'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Year Built</div>
                <div className="font-bold text-gray-900">{formData.yearBuilt || 'Unknown'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Lot Size</div>
                <div className="font-bold text-gray-900">{formData.lotSqft ? `${formData.lotSqft.toLocaleString()} sq ft` : 'Unknown'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Parking</div>
                <div className="font-bold text-gray-900">{formData.features?.parking || 'None'}</div>
              </div>
            </div>
            
            {/* Agency Source Disclosure */}
            {formData.agency && (
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500 border-b border-gray-100 pb-4">
                <span>Listed by <strong className="text-gray-900">{formData.listedBy}</strong> • {formData.agency}</span>
                <span>Source: {formData.mlsId}</span>
              </div>
            )}
          </section>

          {/* THE HAZINA INTELLIGENCE BRIEF */}
          <section className="mb-10 mt-16">
            <div className="flex items-center gap-3 mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              <h3 className="text-3xl font-bold text-gray-900">Hazina Intelligence Brief</h3>
            </div>
            <p className="text-gray-600 mb-8">This data was collected by an independent Hazina field scout to verify the ground truth of this listing.</p>

            {/* Sub-section: Terrain & Infrastructure */}
            <div className="mb-8">
              <h4 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Ground Intelligence</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                <div className="flex justify-between border-b border-gray-100 py-2">
                  <span className="text-gray-500">Terrain</span>
                  <span className="font-medium text-gray-900">{formData.terrain || 'Not surveyed'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 py-2">
                  <span className="text-gray-500">Road Frontage</span>
                  <span className="font-medium text-gray-900">{formData.roadFrontage || 'Not surveyed'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 py-2">
                  <span className="text-gray-500">Current Use</span>
                  <span className="font-medium text-gray-900">{formData.currentUse || 'Unknown'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 py-2">
                  <span className="text-gray-500">Utilities</span>
                  <span className="font-medium text-gray-900">{formData.utilities || 'Unknown'}</span>
                </div>
              </div>
            </div>

            {/* Sub-section: Economic Context */}
            <div className="mb-8 bg-blue-50 p-6 rounded-xl border border-blue-100">
              <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Economic Context (Local Prices)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-500">1kg Maize Flour</div>
                  <div className="text-xl font-bold text-gray-900">{areaData.priceUnga ? `KES ${areaData.priceUnga}` : 'N/A'}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-500">Local Transport (Boda)</div>
                  <div className="text-xl font-bold text-gray-900">{areaData.bodaFare ? `KES ${areaData.bodaFare}` : 'N/A'}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-500">Walkability</div>
                  <div className="text-xl font-bold text-gray-900 text-sm mt-1">{areaData.walkability || 'Unknown'}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-500">Noise Level</div>
                  <div className="text-xl font-bold text-gray-900 text-sm mt-1">{areaData.noiseLevel || 'Unknown'}</div>
                </div>
              </div>
            </div>

            {/* Sub-section: Map Context */}
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">Verified GPS Boundary</h4>
              <div className="h-[400px] w-full rounded-xl overflow-hidden border border-gray-200 shadow-inner z-0">
                <PublicMapClient properties={[property]} />
              </div>
            </div>

          </section>

        </div>

        {/* ── Right Column: Sticky Lead Capture ── */}
        <div className="lg:w-1/3">
          <div className="sticky top-24 bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            
            {/* Payment Calculator equivalent / Pricing Context */}
            <div className="mb-6 border-b border-gray-100 pb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{displayPrice}</h3>
              {formData.estMonthlyPayment && (
                <p className="text-gray-500 font-medium">Est. ${formData.estMonthlyPayment.toLocaleString()}/mo</p>
              )}
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-4">Request a Viewing or Report</h3>
            <form onSubmit={(e) => { e.preventDefault(); alert('Lead Sent! A Hazina representative will contact you shortly.'); }}>
              
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">First & Last Name *</label>
                <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-shadow" placeholder="Jane Doe" required />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Phone *</label>
                <input type="tel" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-shadow" placeholder="(000) 000-0000" required />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-1">Email *</label>
                <input type="email" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-shadow" placeholder="jane@example.com" required />
              </div>

              <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-md transition-colors text-lg">
                Connect with Agency
              </button>

              <p className="text-xs text-gray-500 text-center mt-4 leading-relaxed">
                By submitting this form, you agree to Hazina's Terms of Use and Privacy Policy. You also agree to receive calls/texts from Hazina and its partners.
              </p>
            </form>
          </div>
        </div>

      </main>
      
      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-[1400px] mx-auto px-4 text-center">
          <span className="text-3xl font-bold text-red-600 tracking-tight block mb-4">Hazina</span>
          <p className="text-gray-400 mb-4">&copy; {new Date().getFullYear()} Hazina Technology, Inc. All rights reserved.</p>
          <p className="text-xs text-gray-500 max-w-2xl mx-auto">
            Hazina provides Ground-Truth data aggregation. We are not a licensed real estate brokerage. All data points (including economic and infrastructure proxies) are estimates gathered by field scouts and Zillow/MRED market aggregators.
          </p>
        </div>
      </footer>
    </div>
  );
}
