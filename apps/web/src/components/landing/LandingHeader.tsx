'use client';

import { es } from '@/locales/es';
import Link from 'next/link';
import type React from 'react';
import { useState } from 'react';
import { MobileNavDrawer } from './MobileNavDrawer';

export interface LandingHeaderProps {
  readonly isAuthenticated: boolean;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({ isAuthenticated }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-xs border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center gap-2.5 group hover:opacity-95 transition-opacity"
            >
              <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-xs">
                g
              </div>
              <span className="text-lg font-bold text-gray-900 tracking-tight group-hover:text-primary-600 transition-colors">
                {es.brand.name}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8" aria-label="Navegación principal">
            <Link
              href="#como-funciona"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              {es.landing.nav.howItWorks}
            </Link>
            <Link
              href="#precios"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              {es.landing.nav.pricing}
            </Link>
          </nav>

          {/* Desktop Auth CTAs */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-semibold rounded-xl shadow-xs text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all min-h-[40px]"
              >
                {es.nav.dashboard}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-3.5 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors min-h-[40px]"
                >
                  {es.nav.login}
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-semibold rounded-xl shadow-xs text-white bg-primary-600 hover:bg-primary-700 active:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all min-h-[40px]"
                >
                  {es.nav.register}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setIsDrawerOpen((prev) => !prev)}
              aria-expanded={isDrawerOpen ? 'true' : 'false'}
              aria-label={es.landing.nav.openMenuAria}
              className="p-2.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Accessible Mobile Nav Drawer */}
      <MobileNavDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        isAuthenticated={isAuthenticated}
      />
    </header>
  );
};
