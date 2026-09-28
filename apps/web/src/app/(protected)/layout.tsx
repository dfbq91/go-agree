import { Logo } from '@/components/ui/Logo';
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
    <div className="min-h-screen bg-surface-canvas flex flex-col font-sans text-gray-900 antialiased">
      <header className="bg-surface-card border-b border-border-subtle sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg p-0.5"
            >
              <Logo className="h-10 sm:h-11 w-auto" />
              <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-surface-muted text-gray-600 font-semibold border border-border-subtle">
                LEGAL STUDIO
              </span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/dashboard"
                className="text-primary font-semibold border-b-2 border-primary pb-1 text-sm transition-colors"
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
      <footer className="mt-auto border-t border-border-subtle bg-surface-card py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800">{es.brand.name}</span>
            <span>•</span>
            <span>LegalTech Operations & Compliance</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/" className="hover:text-primary transition-colors">
              Inicio
            </Link>
            <Link href="/dashboard" className="hover:text-primary transition-colors">
              {es.nav.myContracts}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
