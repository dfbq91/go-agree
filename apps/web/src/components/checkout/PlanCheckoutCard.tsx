'use client';

import React, { useState } from 'react';
import type {
  PaymentProviderInfo,
  BillingCycle,
  PricingPlanConfig,
  CountryCode,
} from '@go-agree/domain';
import { CountryPricingRegistry, getLocaleForCountry } from '@go-agree/domain';
import { es } from '../../locales/es';

export interface PlanCheckoutCardProps {
  readonly selectedProvider: PaymentProviderInfo;
  readonly onInitiateCheckout: (billingCycle: BillingCycle) => Promise<void> | void;
  readonly error?: string | null;
  readonly plan?: PricingPlanConfig;
  readonly countryCode?: CountryCode;
}

export const PlanCheckoutCard: React.FC<PlanCheckoutCardProps> = ({
  selectedProvider,
  onInitiateCheckout,
  error,
  plan: propPlan,
  countryCode = 'CO',
}) => {
  const plan = propPlan ?? CountryPricingRegistry.getPlanForCountry(countryCode);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAnnual = billingCycle === 'annual';
  const locale = getLocaleForCountry(plan.countryCode);
  const hasDecimals = plan.monthlyPrice % 1 !== 0 || plan.annualTotal % 1 !== 0;

  const formatNumber = (val: number) =>
    val.toLocaleString(locale, {
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: hasDecimals ? 2 : 0,
    });

  const displayPrice = isAnnual
    ? formatNumber(plan.annualTotal)
    : formatNumber(plan.monthlyPrice);

  const annualMonthlyPrice = formatNumber(plan.annualMonthlyPrice);

  const handlePay = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onInitiateCheckout(billingCycle);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center mb-6">
        <div className="inline-flex rounded-xl bg-muted p-1 border border-border">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              !isAnnual
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {es.landing.pricing.billingCycle.monthly}
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('annual')}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              isAnnual
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>{es.landing.pricing.billingCycle.annual}</span>
            {plan.annualDiscountPercent > 0 && (
              <span className="rounded bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                {es.landing.pricing.billingCycle.saveBadge}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Price Display */}
      <div className="text-center pb-6 border-b border-border">
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {plan.name}
        </span>
        <div className="mt-2 flex items-baseline justify-center gap-1">
          <span className="text-4xl font-extrabold text-foreground">
            {plan.currency.symbol}{displayPrice}
          </span>
          <span className="text-sm font-medium text-muted-foreground">
            {isAnnual ? `${plan.currency.code} / año` : `${plan.currency.code} / mes`}
          </span>
        </div>
        {isAnnual && (
          <p className="text-xs text-muted-foreground mt-1">
            Equivale a {plan.currency.symbol}{annualMonthlyPrice} {plan.currency.code} / mes
          </p>
        )}
      </div>

      {/* Features List */}
      <div className="py-6 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {es.landing.pricing.featuresTitle}
        </h4>
        <ul className="space-y-2.5">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs text-foreground">
              <svg
                className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
          {error}
        </div>
      )}

      {/* Pay CTA Button with Double-Click Guard */}
      <button
        type="button"
        disabled={isSubmitting}
        onClick={handlePay}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <svg
              className="h-4 w-4 animate-spin text-current"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>{es.checkout.processing}</span>
          </>
        ) : (
          <span>
            {es.checkout.payButton.replace('{provider}', selectedProvider.name)}
          </span>
        )}
      </button>
    </div>
  );
};
