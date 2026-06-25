'use client';

import { useState } from 'react';
import PublicNavbar from '@/components/layout/PublicNavbar';

export default function AgentsPage() {
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
          <div className="md:flex flex-row-reverse">
            {/* Right Side: Copy/Value Prop */}
            <div className="md:w-1/2 bg-black p-10 text-white flex flex-col justify-center">
              <h1 className="text-4xl font-bold mb-4">Elevate your portfolio with Deep Land Intelligence.</h1>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                Modern buyers demand data, not just photos. Partner with Hazina to enrich your real estate listings with ground-truth intelligence. We provide you with verified GPS perimeters, soil conditions, economic context, and neighborhood data that you cannot get from a site visit alone.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="bg-white/10 p-2 rounded-full"><svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>
                  <span className="font-medium">Deep Economic & Geographic Data</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-white/10 p-2 rounded-full"><svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>
                  <span className="font-medium">The "Hazina Verified" Trust Badge</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-white/10 p-2 rounded-full"><svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>
                  <span className="font-medium">White-labeled Intelligence Briefs for Buyers</span>
                </li>
              </ul>
            </div>

            {/* Left Side: Form */}
            <div className="md:w-1/2 p-10 bg-white">
              {isSubmitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Application Received</h3>
                  <p className="text-gray-600">Our partnership team will contact you to discuss integration and network access.</p>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Partner Application</h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Agency Name</label>
                      <input type="text" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent transition-shadow outline-none" placeholder="e.g. Nairobi Prime Real Estate" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Person</label>
                      <input type="text" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent transition-shadow outline-none" placeholder="Your Name" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                      <input type="tel" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent transition-shadow outline-none" placeholder="+254 7XX XXX XXX" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Primary Operating Region</label>
                      <input type="text" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent transition-shadow outline-none" placeholder="e.g. Kiambu County" />
                    </div>
                    <button type="submit" className="w-full bg-red-600 text-white font-bold py-4 rounded-lg hover:bg-red-700 transition-colors mt-4 shadow-md">
                      Apply for Partner Access
                    </button>
                    <p className="text-xs text-center text-gray-500 mt-4">Hazina is a closed network. Applications are reviewed within 48 hours.</p>
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
