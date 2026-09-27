'use client';

import { es } from '@/locales/es';
import { useState } from 'react';

interface UserNavProps {
  userEmail?: string;
  onLogout?: () => Promise<void> | void;
}

export function UserNav({ userEmail, onLogout }: UserNavProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      if (onLogout) {
        await onLogout();
      } else {
        await fetch('/api/auth/logout', {
          method: 'POST',
        });
        window.location.href = '/';
      }
    } catch {
      window.location.href = '/';
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex items-center space-x-3">
      {userEmail && (
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-canvas border border-border-subtle text-xs">
          <div className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 font-semibold flex items-center justify-center text-[11px]">
            {userEmail.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-gray-700 truncate max-w-[180px]">
            {userEmail}
          </span>
        </div>
      )}
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        aria-label={es.nav.logout}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border-strong text-xs font-semibold rounded-lg text-gray-700 bg-surface-card hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xs active:scale-[0.99]"
      >
        <svg
          className="w-3.5 h-3.5 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        <span>{isLoggingOut ? 'Cerrando sesión...' : es.nav.logout}</span>
      </button>
    </div>
  );
}

