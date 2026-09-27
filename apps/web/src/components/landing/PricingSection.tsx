'use client';

import { es } from '@/locales/es';
import type { BillingCycle, PricingPlanConfig } from '@go-agree/domain';
import type React from 'react';
import { useState } from 'react';
import { BillingToggle } from './BillingToggle';
import { PricingCard } from './PricingCard';

export interface PricingSectionProps {
  readonly plan: PricingPlanConfig;
  readonly isAuthenticated: boolean;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ plan, isAuthenticated }) => {
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>('monthly');

  return (
    <section
      id="precios"
      aria-labelledby="pricing-heading"
      className="py-16 sm:py-24 bg-gray-50/60 border-t border-gray-100 scroll-mt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">
            {es.landing.pricing.tagline}
          </p>
          <h2
            id="pricing-heading"
            className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight"
          >
            {es.landing.pricing.title}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed">
            {es.landing.pricing.subtitle}
          </p>
        </div>

        {/* 3 Free Contracts Highlight Banner */}
        <div className="mt-10 max-w-2xl mx-auto bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center shadow-sm">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 mb-2">
            <span>{es.landing.pricing.freeTrialBanner.badge}</span>
          </div>
          <h3 className="text-xl font-bold text-emerald-950">
            {plan.freeContractsIncluded !== undefined &&
            es.landing.pricing.freeTrialBanner.formatTitle
              ? es.landing.pricing.freeTrialBanner.formatTitle(plan.freeContractsIncluded)
              : es.landing.pricing.freeTrialBanner.title}
          </h3>
          <p className="mt-2 text-sm text-emerald-800 leading-relaxed">
            {plan.freeContractsIncluded !== undefined &&
            es.landing.pricing.freeTrialBanner.formatDescription
              ? es.landing.pricing.freeTrialBanner.formatDescription(plan.freeContractsIncluded)
              : es.landing.pricing.freeTrialBanner.description}
          </p>
        </div>

        {/* Billing Cycle Frequency Toggle */}
        <div className="mt-10 text-center">
          <BillingToggle
            selectedCycle={selectedCycle}
            onCycleChange={setSelectedCycle}
            annualDiscountPercent={plan.annualDiscountPercent}
          />
        </div>

        {/* Single Pro Plan Card */}
        <div className="mt-10">
          <PricingCard
            plan={plan}
            selectedCycle={selectedCycle}
            isAuthenticated={isAuthenticated}
          />
        </div>

        {/* Free Plan Footnote Card */}
        <div className="mt-8 max-w-xl mx-auto bg-gray-50/80 border border-gray-200/80 rounded-2xl p-5 text-center">
          <p className="text-sm text-gray-600 leading-relaxed">
            <strong className="text-gray-900 font-semibold">¿Solo necesitas unos pocos?</strong> Plan Gratuito disponible con 3 contratos completos para siempre sin tarjeta de crédito.
          </p>
          {!isAuthenticated && (
            <div className="mt-2.5">
              <a
                href="/register"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
              >
                <span>Crear cuenta gratuita</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
