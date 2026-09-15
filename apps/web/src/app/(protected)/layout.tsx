import { UserNav } from '@/components/ui/UserNav';
import { getServerAuthAdapter } from '@/lib/auth';
import { es } from '@/locales/es';
import Link from 'next/link';
import type React from 'react';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  let userEmail: string | undefined;

  try {
    const authAdapter = await getServerAuthAdapter();
    const session = await authAdapter.getCurrentSession();
    if (session) {
      userEmail = session.userId;
    }
  } catch {
    userEmail = undefined;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link
              href="/dashboard"
              className="text-2xl font-bold text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
            >
              {es.brand.name}
            </Link>
            <nav className="hidden md:flex space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                {es.nav.myContracts}
              </Link>
            </nav>
          </div>
          <div id="user-nav-container" className="flex items-center space-x-4">
            <UserNav userEmail={userEmail} />
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
