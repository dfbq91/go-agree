import { es } from '@/locales/es';
import Link from 'next/link';
import type React from 'react';

export interface FinalCTABannerProps {
  readonly isAuthenticated: boolean;
}

export const FinalCTABanner: React.FC<FinalCTABannerProps> = ({ isAuthenticated }) => {
  return (
    <section className="py-16 md:py-20 bg-[#0f172a] text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        {/* Security / Guidance Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs sm:text-sm font-semibold">
          <svg
            className="w-4 h-4 text-blue-400 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span>Redacción contractual guiada y sin fricción</span>
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight max-w-3xl mx-auto leading-tight">
          Protege tus acuerdos comerciales hoy mismo. Empieza con 3 contratos gratis.
        </h2>

        {/* Subtitle */}
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Genera acuerdos listos para firmar fuera de la plataforma con la máxima formalidad y sin
          complicaciones.
        </p>

        {/* CTA Button */}
        <div className="pt-2">
          <Link
            href={isAuthenticated ? '/dashboard' : '/register'}
            className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-sm sm:text-base font-semibold rounded-xl text-white bg-primary-600 hover:bg-primary-700 active:bg-primary-800 transition-all shadow-md gap-2"
          >
            <span>{isAuthenticated ? es.nav.dashboard : 'Registrarme gratis'}</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};
