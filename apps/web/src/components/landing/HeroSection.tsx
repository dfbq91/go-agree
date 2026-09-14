import React from 'react';
import Link from 'next/link';
import { es } from '@/locales/es';

export interface HeroSectionProps {
  readonly isAuthenticated: boolean;
  readonly freeContractsCount?: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  isAuthenticated,
  freeContractsCount,
}) => {
  const trialBadge =
    freeContractsCount !== undefined && es.landing.hero.formatFreeTrialBadge
      ? es.landing.hero.formatFreeTrialBadge(freeContractsCount)
      : es.landing.hero.freeTrialBadge;

  const countNote =
    freeContractsCount !== undefined && es.landing.hero.formatContractCountNote
      ? es.landing.hero.formatContractCountNote(freeContractsCount)
      : es.landing.hero.contractCountNote;

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-gradient-to-b from-primary-50/60 to-white py-16 sm:py-24 lg:py-32"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100 text-primary-800 text-xs sm:text-sm font-semibold mb-6">
          <span>{es.landing.hero.badge}</span>
        </div>

        {/* Main Headline */}
        <h1
          id="hero-heading"
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight sm:leading-none"
        >
          {es.landing.hero.title}
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          {es.landing.hero.subtitle}
        </p>

        {/* Free Trial Callout Badge */}
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium shadow-sm">
          <span>{trialBadge}</span>
        </div>

        {/* Call to Actions */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-semibold rounded-lg shadow-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              {es.landing.hero.ctaDashboard}
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-semibold rounded-lg shadow-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                {es.landing.hero.ctaPrimary}
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 border border-gray-300 text-base font-semibold rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                {es.landing.hero.ctaSecondary}
              </Link>
            </>
          )}
        </div>

        {/* Subtext Note */}
        {!isAuthenticated && (
          <p className="mt-4 text-xs sm:text-sm text-gray-500">
            {countNote}
          </p>
        )}
      </div>
    </section>
  );
};
