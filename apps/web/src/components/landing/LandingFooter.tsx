import { es } from '@/locales/es';
import Link from 'next/link';
import type React from 'react';

export const LandingFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link
              href="/"
              className="text-2xl font-black text-white tracking-tight flex items-center gap-2"
            >
              <svg
                className="w-8 h-8 text-primary-400"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
              </svg>
              <span>{es.brand.name}</span>
            </Link>
            <p className="text-sm text-gray-400 max-w-md leading-relaxed">
              {es.landing.footer.brandTagline}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Navegación
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#como-funciona"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {es.landing.nav.howItWorks}
                </Link>
              </li>
              <li>
                <Link
                  href="#precios"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {es.landing.nav.pricing}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Account */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Acceso</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/login"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {es.nav.login}
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {es.nav.register}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Statutory Legal Disclaimer Notice */}
        <div className="pt-8 border-t border-gray-800 space-y-4">
          <p className="text-xs leading-relaxed text-gray-400">
            {es.landing.footer.legalDisclaimer}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
            <p>
              © {currentYear} {es.brand.name}. {es.landing.footer.rightsReserved}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
