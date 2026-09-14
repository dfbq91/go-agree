/**
 * @file PaymentProviderInfo.ts
 * @description Domain entity and types for Payment Providers.
 */

import type { CountryCode } from './PricingConfig.js';

export type PaymentProviderId = 'wompi' | 'stripe' | 'mercadopago' | string;

export interface PaymentProviderInfo {
  readonly id: PaymentProviderId;
  readonly name: string;
  readonly description: string;
  readonly supportedCountries: readonly CountryCode[];
  readonly supportedPaymentMethods: readonly string[];
  readonly logoKey: string;
  readonly isDefault: boolean;
}

export {
  DEFAULT_COLOMBIA_WOMPI_PROVIDER,
  PaymentProviderRegistry,
} from './PaymentProviderRegistry.js';
