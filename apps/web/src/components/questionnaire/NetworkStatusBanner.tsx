import type React from 'react';
import { useEffect, useState } from 'react';
import { es } from '../../locales/es';

export interface NetworkStatusBannerProps {
  hasError?: boolean;
  isRetrying?: boolean;
  onRetry?: () => void;
  message?: string;
}

export const NetworkStatusBanner: React.FC<NetworkStatusBannerProps> = ({
  hasError = false,
  isRetrying = false,
  onRetry,
  message,
}) => {
  const [isOffline, setIsOffline] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      return !navigator.onLine;
    }
    return false;
  });

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const shouldShow = isOffline || hasError;

  if (!shouldShow) {
    return null;
  }

  const displayMessage = message || es.questionnaire.saveError;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="mb-4 p-4 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm transition-all"
    >
      <div className="flex items-center gap-3">
        <svg
          className="w-5 h-5 text-amber-600 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-sm font-medium">{displayMessage}</span>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="px-3 py-1.5 text-xs font-semibold rounded bg-amber-600 text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 disabled:opacity-50 transition-colors self-end sm:self-auto"
        >
          {isRetrying ? es.questionnaire.retrying : es.questionnaire.retry}
        </button>
      )}
    </div>
  );
};
