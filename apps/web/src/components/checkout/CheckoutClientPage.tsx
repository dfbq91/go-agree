'use client';

import type { SubscriptionStatusResult } from '@go-agree/application';
import type {
  BillingCycle,
  CountryCode,
  PaymentProviderInfo,
  PricingPlanConfig,
} from '@go-agree/domain';
import Link from 'next/link';
import type React from 'react';
import { useState } from 'react';
import { es } from '../../locales/es';
import { PaymentProviderSelector } from './PaymentProviderSelector';
import { PlanCheckoutCard } from './PlanCheckoutCard';

export interface CheckoutClientPageProps {
  readonly providers: PaymentProviderInfo[];
  readonly subscription: SubscriptionStatusResult;
  readonly countryCode?: CountryCode;
  readonly plan?: PricingPlanConfig;
}

export const CheckoutClientPage: React.FC<CheckoutClientPageProps> = ({
  providers,
  subscription,
  countryCode = 'CO',
  plan,
}) => {
  const defaultProvider = providers.find((p) => p.isDefault) || providers[0];
  const [selectedProviderId, setSelectedProviderId] = useState(defaultProvider?.id || '');
  const [error, setError] = useState<string | null>(null);

  const selectedProvider = providers.find((p) => p.id === selectedProviderId) || defaultProvider;

  const isActivePro = subscription.planType === 'pro' && subscription.status === 'active';

  const handleInitiateCheckout = async (billingCycle: BillingCycle) => {
    setError(null);
    try {
      const res = await fetch('/api/checkout/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan?.id || 'pro',
          billingCycle,
          providerId: selectedProviderId,
          countryCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || es.checkout.errors.checkoutFailed);
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err: any) {
      setError(err?.message || es.checkout.errors.checkoutFailed);
      throw err;
    }
  };

  return (
    <div className="mx-auto max-w-4xl py-6 sm:py-10 px-4 sm:px-6">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 mb-4 transition-colors"
        >
          ← {es.dashboard.title}
        </Link>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-900">
          {es.checkout.title}
        </h1>
        <p className="mt-2 text-sm text-slate-500">{es.checkout.subtitle}</p>
      </div>

      {isActivePro ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-primary mb-3">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="font-serif text-lg font-bold text-slate-900">
            {es.plans.unlimitedAccess}
          </h2>
          <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
            {es.checkout.duplicateWarning}
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
            >
              {es.paymentResult.backToDashboard}
            </Link>
          </div>
        </div>
      ) : providers.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs">
          <p className="text-slate-500 text-sm">
            {es.checkout.noProvidersForCountry.replace('{country}', countryCode)}
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
            >
              {es.paymentResult.backToDashboard}
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <div className="md:col-span-7">
            <PaymentProviderSelector
              providers={providers}
              selectedProviderId={selectedProviderId}
              onSelectProvider={setSelectedProviderId}
            />
          </div>

          <div className="md:col-span-5">
            {selectedProvider && (
              <PlanCheckoutCard
                selectedProvider={selectedProvider}
                onInitiateCheckout={handleInitiateCheckout}
                error={error}
                plan={plan}
                countryCode={countryCode}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
