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
    <div className="mx-auto max-w-4xl py-6 sm:py-10">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          ← {es.dashboard.title}
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          {es.checkout.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{es.checkout.subtitle}</p>
      </div>

      {isActivePro ? (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
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
          <h2 className="text-lg font-bold text-foreground">{es.plans.unlimitedAccess}</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            {es.checkout.duplicateWarning}
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
            >
              {es.paymentResult.backToDashboard}
            </Link>
          </div>
        </div>
      ) : providers.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground text-sm">
            {es.checkout.noProvidersForCountry.replace('{country}', countryCode)}
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
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
