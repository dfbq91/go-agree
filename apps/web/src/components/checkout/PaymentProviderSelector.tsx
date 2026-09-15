'use client';

import type { PaymentProviderInfo } from '@go-agree/domain';
import type React from 'react';
import { es } from '../../locales/es';

export interface PaymentProviderSelectorProps {
  readonly providers: PaymentProviderInfo[];
  readonly selectedProviderId: string;
  readonly onSelectProvider: (providerId: string) => void;
}

export const PaymentProviderSelector: React.FC<PaymentProviderSelectorProps> = ({
  providers,
  selectedProviderId,
  onSelectProvider,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-foreground">
          {es.checkout.providerSectionTitle}
        </h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          {es.checkout.providerSectionSubtitle}
        </p>
      </div>

      <div className="space-y-3" role="radiogroup" aria-label={es.checkout.providerSectionTitle}>
        {providers.map((provider) => {
          const isSelected = provider.id === selectedProviderId;

          return (
            <div
              key={provider.id}
              onClick={() => onSelectProvider(provider.id)}
              className={`relative flex cursor-pointer rounded-xl border p-4 shadow-sm transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30'
              }`}
            >
              <div className="flex h-5 items-center">
                <input
                  id={`provider-${provider.id}`}
                  name="payment-provider"
                  type="radio"
                  checked={isSelected}
                  onChange={() => onSelectProvider(provider.id)}
                  aria-label={provider.name}
                  className="h-4 w-4 border-muted-foreground text-primary focus:ring-primary"
                />
              </div>

              <div className="ml-3 flex flex-1 flex-col justify-between">
                <label
                  htmlFor={`provider-${provider.id}`}
                  className="cursor-pointer font-medium text-foreground text-sm"
                >
                  {provider.name}
                </label>
                <p className="text-xs text-muted-foreground mt-0.5">{provider.description}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {provider.supportedPaymentMethods.map((method) => (
                    <span
                      key={method}
                      className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground uppercase"
                    >
                      {method}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
