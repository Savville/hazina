'use client';

import Link from 'next/link';
import PublicNavbar from '@/components/layout/PublicNavbar';

export default function VerificationPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-[Outfit]">
      <PublicNavbar />
      
      <main className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Ground-Truth Data.<br/>No Guesswork.</h1>
          <p className="text-xl text-gray-600">
            Hazina is not a real estate broker. We are Kenya's premier Land Intelligence System. We physically verify every property before it hits our map, protecting buyers from disputes and helping sellers prove their land's value.
          </p>
        </div>

        {/* The Pipeline Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-16">
          <div className="p-8 md:p-12 border-b border-gray-100 bg-red-50 text-center">
            <h2 className="text-3xl font-bold text-gray-900">The Verification Pipeline</h2>
          </div>
          
          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            
            {/* Step 1 */}
            <div className="p-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">1. Scout Dispatch</h3>
              <p className="text-gray-600">
                When a property is submitted, we deploy a trained field scout directly to the physical location. They map the exact perimeter using GPS tracking technology to generate an accurate KMZ file.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">2. Ground-Truth Analysis</h3>
              <p className="text-gray-600">
                While on-site, the scout collects photographic evidence of the terrain, soil type, access roads, and local infrastructure, noting any boundary disputes or neighbor encroachment.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">3. Interactive Mapping</h3>
              <p className="text-gray-600">
                The data is reviewed by Hazina HQ. Only properties that pass the intelligence check are uploaded to our Interactive Map with the official "Verified" badge.
              </p>
            </div>
            
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gray-900 rounded-2xl p-10 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to use intelligent data?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">Whether you are an owner looking to prove your land's value, or an agent looking for trusted inventory, Hazina is your platform.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
              Submit Land for Verification
            </Link>
            <Link href="/agents" className="bg-white hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition-colors border border-gray-200" style={{ color: 'black' }}>
              Partner with Us
            </Link>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-8 text-center max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-100 rounded-lg p-4">
            <p className="text-sm text-gray-600 font-medium">
              <span className="font-bold text-red-600">Legal Disclaimer:</span> Hazina Ground-Truth Verification confirms the physical state, access, and perimeter of a property using field intelligence. It does not replace an official Ministry of Lands Title Search. Buyers must always conduct their own legal due diligence.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}
