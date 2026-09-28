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
    <div className="relative bg-white border-2 border-primary-600 rounded-2xl p-8 sm:p-10 shadow-lg flex flex-col justify-between max-w-xl mx-auto overflow-hidden">
      {/* Recommended Top-Right Ribbon */}
      <div className="absolute top-0 right-0">
        <div className="bg-primary-600 text-white text-[11px] uppercase font-bold py-1.5 px-5 rounded-bl-xl tracking-wider shadow-2xs">
          Plan Recomendado
        </div>
      </div>

      <div>
        {/* Plan Header */}
        <div className="pb-6 border-b border-gray-100">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600 block mb-1">
            Suscripción Todo Incluido
          </span>
          <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">{plan.name}</h3>
          <p className="mt-1 text-sm text-gray-500 leading-relaxed">{plan.tagline}</p>

          {/* Price Block */}
          <div className="mt-6 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
              {displayPrice.formatted}
            </span>
            <span className="text-gray-500 text-sm sm:text-base font-medium">
              {displayPrice.periodLabel}
            </span>
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
          <ul className="space-y-4">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-primary-600 shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm sm:text-base text-gray-700 leading-snug font-medium">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* CTA Button */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <Link
          href={isAuthenticated ? '/dashboard' : plan.cta.href}
          className="w-full inline-flex items-center justify-center px-6 py-3.5 border border-transparent text-base font-bold rounded-xl shadow-xs text-white bg-primary-600 hover:bg-primary-700 active:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          {isAuthenticated ? es.landing.hero.ctaDashboard : es.landing.pricing.cta}
        </Link>
      </div>
    </div>
  );
};
