import { es } from '@/locales/es';
import {
  type BillingCycle,
  PricingCalculatorService,
  type PricingPlanConfig,
} from '@go-agree/domain';
import Link from 'next/link';
import type React from 'react';

export interface PricingCardProps {
  readonly plan: PricingPlanConfig;
  readonly selectedCycle: BillingCycle;
  readonly isAuthenticated: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  selectedCycle,
  isAuthenticated,
}) => {
  const displayPrice = PricingCalculatorService.getDisplayPrice(plan, selectedCycle);

  return (
    <div className="relative bg-white border-2 border-primary-500 rounded-2xl p-8 sm:p-10 shadow-xl flex flex-col justify-between max-w-lg mx-auto">
      {/* Featured Pill */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
        <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-600 text-white shadow-sm">
          Plan Recomendado
        </span>
      </div>

      <div>
        {/* Plan Header */}
        <div className="text-center pb-6 border-b border-gray-100">
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">{plan.name}</h3>
          <p className="mt-1 text-sm text-gray-500">{plan.tagline}</p>

          {/* Price Block */}
          <div className="mt-6 flex items-baseline justify-center gap-1">
            <span className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
              {displayPrice.formatted}
            </span>
            <span className="text-gray-500 text-base font-medium">{displayPrice.periodLabel}</span>
          </div>

          {/* Billing Note */}
          <p className="mt-2 text-xs sm:text-sm text-gray-500 font-medium">
            {displayPrice.billingSummary}
          </p>
        </div>

        {/* Feature List */}
        <div className="pt-6">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
            {es.landing.pricing.featuresTitle}
          </p>
          <ul className="space-y-3.5">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm sm:text-base text-gray-700 leading-snug">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* CTA Button */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <Link
          href={isAuthenticated ? '/dashboard' : plan.cta.href}
          className="w-full inline-flex items-center justify-center px-6 py-3.5 border border-transparent text-base font-bold rounded-lg shadow-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          {isAuthenticated ? es.landing.hero.ctaDashboard : es.landing.pricing.cta}
        </Link>
      </div>
    </div>
  );
};
