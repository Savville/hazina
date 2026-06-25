'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-[1000] bg-white border-b border-gray-200 w-full shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-red-600 font-[Outfit] tracking-tight">
                Hazina
              </Link>
            </div>

            {/* Desktop Menu - "Land Intelligence" Branding */}
            <nav className="hidden md:flex items-center space-x-1">
              
              {/* Home */}
              <div className="px-2 py-2">
                <Link href="/" className="text-sm font-medium text-gray-700 hover:text-red-600">
                  Home
                </Link>
              </div>

              {/* Top Level Map Button */}
              <div className="px-3 py-2">
                <Link href="/map" className="text-sm font-bold text-gray-800 hover:text-red-600 flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-full transition-colors">
                  <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                  Interactive Map
                </Link>
              </div>

              {/* Verified Properties Dropdown */}
              <div className="relative group px-3 py-2">
                <button className="text-sm font-medium text-gray-700 group-hover:text-red-600 flex items-center gap-1">
                  Verified Properties
                  <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-100 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left z-50">
                  <div className="py-1">
                    <Link href="/properties" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600">Browse Verified Listings</Link>
                    <Link href="/verification" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600">How We Verify Data</Link>
                  </div>
                </div>
              </div>

              {/* Partnership Dropdown */}
              <div className="relative group px-3 py-2">
                <button className="text-sm font-medium text-gray-700 group-hover:text-red-600 flex items-center gap-1">
                  Partnership
                  <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-100 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left z-50">
                  <div className="py-1">
                    <Link href="/submit" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600">Submit Land for Verification</Link>
                    <Link href="/agents" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600">Agency Partnership</Link>
                  </div>
                </div>
              </div>

              <div className="pl-4">
                <Link
                  href="/scout/login"
                  className="bg-red-600 text-white px-5 py-2 rounded-md text-sm font-bold hover:bg-red-700 transition-colors shadow-sm"
                >
                  Scout HQ Login
                </Link>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(true)}
                className="text-gray-800 hover:text-black focus:outline-none p-2"
                aria-expanded={isOpen}
              >
                <span className="sr-only">Open main menu</span>
                <svg className="block h-7 w-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide-out Sidebar (Redfin style) */}
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex md:hidden">
          {/* Overlay background */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          ></div>

          {/* Sidebar */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl h-full overflow-y-auto animate-slide-in-right ml-auto">
            
            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-4 pt-5 pb-4 border-b border-gray-100">
              <span className="text-xl font-bold text-red-600 font-[Outfit]">Hazina</span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-black p-2 focus:outline-none"
              >
                <span className="sr-only">Close menu</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Sidebar Links */}
            <nav className="mt-2 px-2 flex flex-col gap-1">
              
              {/* Home */}
              <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-gray-800 hover:bg-gray-50">
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                Home
              </Link>

              {/* Top Level: Map */}
              <Link href="/map" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-bold text-gray-900 bg-red-50 mt-2 mb-2 border border-red-100">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                Interactive Map
              </Link>

              {/* Category: Verified Properties */}
              <div className="px-3 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Verified Properties
              </div>
              <Link href="/properties" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-gray-800 hover:bg-gray-50">
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                Browse Verified Land
              </Link>
              <Link href="/verification" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-gray-800 hover:bg-gray-50">
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                How We Verify Data
              </Link>

              {/* Category: Partnership */}
              <div className="px-3 pt-6 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-t border-gray-100 mt-2">
                Partnership
              </div>
              <Link href="/submit" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-gray-800 hover:bg-gray-50">
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                Request Verification
              </Link>
              <Link href="/agents" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-gray-800 hover:bg-gray-50">
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                Agency Partnership
              </Link>
              
              <div className="mt-8 px-3">
                <Link
                  href="/scout/login"
                  onClick={() => setIsOpen(false)}
                  className="flex justify-center w-full bg-red-600 text-white px-4 py-3 rounded-md text-base font-bold hover:bg-red-700 transition-colors shadow-sm"
                >
                  Scout HQ Login
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Global styles for the slide-in animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out forwards;
        }
      `}} />
    </>
  );
}
