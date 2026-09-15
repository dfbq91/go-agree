import { es } from '@/locales/es';
import Link from 'next/link';
import type React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="mb-6 text-center">
        <Link
          href="/"
          className="text-3xl font-extrabold text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
        >
          {es.brand.name}
        </Link>
        <p className="mt-1 text-sm text-gray-500">{es.brand.tagline}</p>
      </div>
      <div className="w-full max-w-md bg-white py-8 px-6 shadow-md rounded-lg sm:px-10 border border-gray-100">
        {children}
      </div>
    </div>
  );
}
