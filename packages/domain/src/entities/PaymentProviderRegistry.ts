/**
 * @file PaymentProviderRegistry.ts
 * @description Domain registry for Payment Providers, supporting multi-provider lookups and country-based filtering.
 */

import type { PaymentProviderId, PaymentProviderInfo } from './PaymentProviderInfo.js';
import type { CountryCode } from './PricingConfig.js';

export const DEFAULT_COLOMBIA_WOMPI_PROVIDER: PaymentProviderInfo = {
  id: 'wompi',
  name: 'Wompi (Bancolombia)',
  description: 'PSE, Tarjetas de crédito y débito, Nequi y transferencias Bancolombia',
  supportedCountries: ['CO'],
  supportedPaymentMethods: ['PSE', 'CARD', 'NEQUI', 'BANCOLOMBIA_TRANSFER'],
  logoKey: 'wompi',
  isDefault: true,
};

export class PaymentProviderRegistry {
  private static readonly providers: Map<PaymentProviderId, PaymentProviderInfo> = new Map([
    ['wompi', DEFAULT_COLOMBIA_WOMPI_PROVIDER],
  ]);

  static getProvidersForCountry(countryCode: CountryCode = 'CO'): PaymentProviderInfo[] {
    const normalized = countryCode.toUpperCase();
    return Array.from(PaymentProviderRegistry.providers.values()).filter((provider) =>
      provider.supportedCountries.map((c) => c.toUpperCase()).includes(normalized)
    );
  }

  static getProvider(id: PaymentProviderId): PaymentProviderInfo | undefined {
    return PaymentProviderRegistry.providers.get(id);
  }

  static registerProvider(provider: PaymentProviderInfo): void {
    PaymentProviderRegistry.providers.set(provider.id, provider);
  }

  static resetToDefaults(): void {
    PaymentProviderRegistry.providers.clear();
    PaymentProviderRegistry.providers.set('wompi', DEFAULT_COLOMBIA_WOMPI_PROVIDER);
  }
}
