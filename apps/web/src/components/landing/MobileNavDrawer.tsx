import { es } from '@/locales/es';
import Link from 'next/link';
import type React from 'react';
import { useEffect, useRef } from 'react';

export interface MobileNavDrawerProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly isAuthenticated: boolean;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  isOpen,
  onClose,
  isAuthenticated,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Menú de navegación"
      className="fixed inset-0 z-50 flex justify-end md:hidden"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        className="relative w-full max-w-xs bg-white h-full shadow-2xl p-6 flex flex-col justify-between z-10"
      >
        <div>
          {/* Header with Close Action */}
          <div className="flex items-center justify-between pb-6 border-b border-gray-100">
            <span className="text-xl font-black text-primary-600 tracking-tight">
              {es.brand.name}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label={es.landing.nav.closeMenuAria}
              className="p-2.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 flex flex-col space-y-2">
            <Link
              href="#como-funciona"
              onClick={onClose}
              className="px-4 py-3 rounded-lg text-base font-semibold text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors min-h-[44px] flex items-center"
            >
              {es.landing.nav.howItWorks}
            </Link>
            <Link
              href="#precios"
              onClick={onClose}
              className="px-4 py-3 rounded-lg text-base font-semibold text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors min-h-[44px] flex items-center"
            >
              {es.landing.nav.pricing}
            </Link>
          </nav>
        </div>

        {/* Auth Action Buttons */}
        <div className="pt-6 border-t border-gray-100 flex flex-col space-y-3">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              onClick={onClose}
              className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-base font-bold rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 min-h-[44px]"
            >
              {es.nav.dashboard}
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                onClick={onClose}
                className="w-full inline-flex items-center justify-center px-4 py-3 border border-gray-300 text-base font-semibold rounded-lg shadow-xs text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 min-h-[44px]"
              >
                {es.nav.login}
              </Link>
              <Link
                href="/register"
                onClick={onClose}
                className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-base font-bold rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 min-h-[44px]"
              >
                {es.nav.register}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
