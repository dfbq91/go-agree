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
        <h3 className="font-serif text-lg font-bold text-slate-900">
          {es.checkout.providerSectionTitle}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">{es.checkout.providerSectionSubtitle}</p>
      </div>

      <div className="space-y-3" role="radiogroup" aria-label={es.checkout.providerSectionTitle}>
        {providers.map((provider) => {
          const isSelected = provider.id === selectedProviderId;

          return (
            <div
              key={provider.id}
              onClick={() => onSelectProvider(provider.id)}
              className={`relative flex cursor-pointer rounded-xl border p-4 shadow-xs transition-all ${
                isSelected
                  ? 'border-primary bg-blue-50/40 ring-2 ring-primary/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
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
                  className="h-4 w-4 border-slate-300 text-primary focus:ring-primary"
                />
              </div>

              <div className="ml-3 flex flex-1 flex-col justify-between">
                <label
                  htmlFor={`provider-${provider.id}`}
                  className="cursor-pointer font-semibold text-slate-900 text-sm"
                >
                  {provider.name}
                </label>
                <p className="text-xs text-slate-500 mt-0.5">{provider.description}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {provider.supportedPaymentMethods.map((method) => (
                    <span
                      key={method}
                      className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 uppercase tracking-wider"
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
