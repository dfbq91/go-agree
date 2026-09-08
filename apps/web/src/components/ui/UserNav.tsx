'use client';

import React, { useState } from 'react';
import { es } from '@/locales/es';

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
    <div className="flex items-center space-x-4">
      {userEmail && (
        <span className="text-sm font-medium text-gray-700 hidden sm:inline-block">
          {userEmail}
        </span>
      )}
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        aria-label={es.nav.logout}
        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoggingOut ? 'Cerrando sesión...' : es.nav.logout}
      </button>
    </div>
  );
}
