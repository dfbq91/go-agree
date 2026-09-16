import { es } from '@/locales/es';
import Link from 'next/link';

interface DashboardEmptyStateProps {
  className?: string;
}

export function DashboardEmptyState({ className = '' }: DashboardEmptyStateProps) {
  return (
    <div
      className={`text-center py-16 px-4 sm:px-6 lg:px-8 bg-white rounded-xl border-2 border-dashed border-gray-200 shadow-sm ${className}`}
    >
      {/* Friendly document illustration */}
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-50 text-primary-600 mb-4">
        <svg
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 tracking-tight">
        {es.dashboard.emptyTitle}
      </h3>
      <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">{es.dashboard.emptySubtitle}</p>

      <div className="mt-6">
        <Link
          href="/questionnaire"
          className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          <svg
            className="-ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {es.dashboard.createFirstContract}
        </Link>
      </div>
    </div>
  );
}
