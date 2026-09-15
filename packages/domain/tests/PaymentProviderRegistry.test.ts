import { beforeEach, describe, expect, it } from 'vitest';
import {
  type PaymentProviderInfo,
  PaymentProviderRegistry,
} from '../src/entities/PaymentProviderInfo.js';

describe('PaymentProviderRegistry', () => {
  beforeEach(() => {
    PaymentProviderRegistry.resetToDefaults();
  });

  it('returns default Wompi provider for Colombia (CO)', () => {
    const providers = PaymentProviderRegistry.getProvidersForCountry('CO');
    expect(providers).toHaveLength(1);
    expect(providers[0].id).toBe('wompi');
    expect(providers[0].name).toBe('Wompi (Bancolombia)');
    expect(providers[0].isDefault).toBe(true);
    expect(providers[0].supportedPaymentMethods).toContain('PSE');
    expect(providers[0].supportedPaymentMethods).toContain('NEQUI');
  });

  it('handles lowercase country codes gracefully', () => {
    const providers = PaymentProviderRegistry.getProvidersForCountry('co');
    expect(providers).toHaveLength(1);
    expect(providers[0].id).toBe('wompi');
  });

  it('returns empty list for country with no configured providers', () => {
    const providers = PaymentProviderRegistry.getProvidersForCountry('AR');
    expect(providers).toHaveLength(0);
  });

  it('allows registering and filtering additional providers dynamically', () => {
    const stripeMexico: PaymentProviderInfo = {
      id: 'stripe_mx',
      name: 'Stripe Mexico',
      description: 'Tarjetas de crédito y débito OXXO',
      supportedCountries: ['MX'],
      supportedPaymentMethods: ['CARD', 'OXXO'],
      logoKey: 'stripe',
      isDefault: true,
    };

    PaymentProviderRegistry.registerProvider(stripeMexico);

    const mxProviders = PaymentProviderRegistry.getProvidersForCountry('MX');
    expect(mxProviders).toHaveLength(1);
    expect(mxProviders[0].id).toBe('stripe_mx');

    // Colombia still only returns Wompi
    const coProviders = PaymentProviderRegistry.getProvidersForCountry('CO');
    expect(coProviders).toHaveLength(1);
    expect(coProviders[0].id).toBe('wompi');
  });

  it('retrieves a provider by id', () => {
    const provider = PaymentProviderRegistry.getProvider('wompi');
    expect(provider).toBeDefined();
    expect(provider?.id).toBe('wompi');
  });
});
