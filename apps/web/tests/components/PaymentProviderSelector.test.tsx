import type { PaymentProviderInfo } from '@go-agree/domain';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PaymentProviderSelector } from '../../src/components/checkout/PaymentProviderSelector';
import { PlanCheckoutCard } from '../../src/components/checkout/PlanCheckoutCard';
import { es } from '../../src/locales/es';

const mockProviders: PaymentProviderInfo[] = [
  {
    id: 'wompi',
    name: 'Wompi (Bancolombia)',
    description: 'PSE, Tarjetas, Nequi y transferencias Bancolombia',
    supportedCountries: ['CO'],
    supportedPaymentMethods: ['PSE', 'CARD', 'NEQUI'],
    logoKey: 'wompi',
    isDefault: true,
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Tarjetas de crédito internacionales',
    supportedCountries: ['CO', 'US'],
    supportedPaymentMethods: ['CARD'],
    logoKey: 'stripe',
    isDefault: false,
  },
];

describe('PaymentProviderSelector & PlanCheckoutCard Components', () => {
  describe('PaymentProviderSelector', () => {
    it('renders provider list and allows selecting a provider', () => {
      const onSelect = vi.fn();

      render(
        <PaymentProviderSelector
          providers={mockProviders}
          selectedProviderId="wompi"
          onSelectProvider={onSelect}
        />
      );

      expect(screen.getByText('Wompi (Bancolombia)')).toBeDefined();
      expect(screen.getByText('Stripe')).toBeDefined();

      const stripeRadio = screen.getByLabelText('Stripe');
      fireEvent.click(stripeRadio);

      expect(onSelect).toHaveBeenCalledWith('stripe');
    });

    it('renders payment method tags for each provider', () => {
      render(
        <PaymentProviderSelector
          providers={mockProviders}
          selectedProviderId="wompi"
          onSelectProvider={vi.fn()}
        />
      );

      expect(screen.getByText('PSE')).toBeDefined();
      expect(screen.getByText('NEQUI')).toBeDefined();
    });
  });

  describe('PlanCheckoutCard', () => {
    it('renders plan pricing and toggles between monthly and annual cycles', () => {
      render(<PlanCheckoutCard selectedProvider={mockProviders[0]} onInitiateCheckout={vi.fn()} />);

      // Default monthly fee
      expect(screen.getByText(/49[.,]000/)).toBeDefined();

      // Switch to annual
      const annualBtn = screen.getByRole('button', { name: /Anual/i });
      fireEvent.click(annualBtn);

      expect(screen.getByText(/468[.,]000/)).toBeDefined();
    });

    it('disables button with spinner upon click to guard against double clicks', async () => {
      const onInitiate = vi.fn().mockImplementation(() => new Promise(() => {})); // Never resolves during test

      render(
        <PlanCheckoutCard selectedProvider={mockProviders[0]} onInitiateCheckout={onInitiate} />
      );

      const payBtn = screen.getByRole('button', { name: /Pagar con Wompi/i });
      expect(payBtn).toBeDefined();

      fireEvent.click(payBtn);

      expect(onInitiate).toHaveBeenCalledOnce();
      expect(payBtn.hasAttribute('disabled')).toBe(true);
      expect(screen.getByText(es.checkout.processing)).toBeDefined();
    });
  });
});
