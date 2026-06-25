'use client';

import { useState } from 'react';
import PublicNavbar from '@/components/layout/PublicNavbar';

export default function SubmitPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-[Outfit]">
      <PublicNavbar />
      
      <main className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="md:flex">
            {/* Left Side: Copy/Value Prop */}
            <div className="md:w-1/2 bg-red-600 p-10 text-white flex flex-col justify-center">
              <h1 className="text-4xl font-bold mb-4">Don't just list your land. Verify it.</h1>
              <p className="text-red-100 text-lg mb-8 leading-relaxed">
                Hazina is Kenya's first Land Intelligence System. By submitting your property, we dispatch a trained scout to verify its borders, soil, and infrastructure. Verified properties sell faster because buyers trust our ground-truth data.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-full"><svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>
                  <span className="font-medium">Free Scout Dispatch</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-full"><svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>
                  <span className="font-medium">KMZ Perimeter Mapping</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-full"><svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>
                  <span className="font-medium">Premium Map Placement</span>
                </li>
              </ul>
            </div>

            {/* Right Side: Form */}
            <div className="md:w-1/2 p-10 bg-white">
              {isSubmitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Request Received</h3>
                  <p className="text-gray-600">Our dispatch team will contact you shortly to schedule your land verification.</p>
                  <button onClick={() => setIsSubmitted(false)} className="mt-8 text-red-600 font-semibold hover:underline">Submit another property</button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Request Verification</h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                      <input type="text" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent transition-shadow outline-none" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                      <input type="tel" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent transition-shadow outline-none" placeholder="+254 7XX XXX XXX" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Property Location</label>
                      <input type="text" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent transition-shadow outline-none" placeholder="e.g. Ruaka, Kiambu" />
                    </div>
                    <div className="flex gap-4">
                      <div className="w-1/2">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Acreage</label>
                        <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent transition-shadow outline-none" placeholder="e.g. 0.5 Acres" />
                      </div>
                      <div className="w-1/2">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Asking Price</label>
                        <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent transition-shadow outline-none" placeholder="Ksh..." />
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-black text-white font-bold py-4 rounded-lg hover:bg-gray-800 transition-colors mt-4 shadow-md">
                      Request Scout Dispatch
                    </button>
                    <p className="text-xs text-center text-gray-500 mt-4">By submitting, you agree to our verification terms. Hazina is a data platform, not a real estate broker.</p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
