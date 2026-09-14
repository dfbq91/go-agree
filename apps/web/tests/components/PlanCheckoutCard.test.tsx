import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlanCheckoutCard } from '../../src/components/checkout/PlanCheckoutCard';
import type { PaymentProviderInfo, PricingPlanConfig } from '@go-agree/domain';

const mockProvider: PaymentProviderInfo = {
  id: 'wompi',
  name: 'Wompi (Bancolombia)',
  description: 'PSE, Tarjetas, Nequi y transferencias Bancolombia',
  supportedCountries: ['CO'],
  supportedPaymentMethods: ['PSE', 'CARD', 'NEQUI'],
  logoKey: 'wompi',
  isDefault: true,
};

describe('PlanCheckoutCard Component', () => {
  it('renders Colombia plan and COP currency by default', () => {
    render(
      <PlanCheckoutCard
        selectedProvider={mockProvider}
        onInitiateCheckout={vi.fn()}
      />
    );

    expect(screen.getByText('Plan Pro')).toBeDefined();
    expect(screen.getByText(/49[.,]000/)).toBeDefined();
    expect(screen.getByText('COP / mes')).toBeDefined();
  });

  it('updates price and period on annual billing cycle toggle for default plan', () => {
    render(
      <PlanCheckoutCard
        selectedProvider={mockProvider}
        onInitiateCheckout={vi.fn()}
      />
    );

    const annualBtn = screen.getByRole('button', { name: /anual/i });
    fireEvent.click(annualBtn);

    expect(screen.getByText(/468[.,]000/)).toBeDefined();
    expect(screen.getByText('COP / año')).toBeDefined();
    expect(screen.getByText(/39[.,]000\s*COP \/ mes/)).toBeDefined();
  });

  it('renders dynamic country currency and prices when custom plan is supplied', () => {
    const customMxPlan: PricingPlanConfig = {
      id: 'pro-mx',
      name: 'Plan Pro México',
      tagline: 'Acceso total México',
      countryCode: 'MX',
      currency: {
        symbol: '$',
        code: 'MXN',
        position: 'prefix',
      },
      monthlyPrice: 299,
      annualMonthlyPrice: 239,
      annualTotal: 2868,
      annualDiscountPercent: 20,
      freeContractsIncluded: 3,
      features: ['Característica 1', 'Característica 2', 'Característica 3'],
      cta: { label: 'Comenzar', href: '/register' },
    };

    render(
      <PlanCheckoutCard
        selectedProvider={mockProvider}
        onInitiateCheckout={vi.fn()}
        plan={customMxPlan}
        countryCode="MX"
      />
    );

    expect(screen.getByText('Plan Pro México')).toBeDefined();
    expect(screen.getByText('$299')).toBeDefined();
    expect(screen.getByText('MXN / mes')).toBeDefined();
    expect(screen.getByText('Característica 1')).toBeDefined();

    // Toggle annual
    const annualBtn = screen.getByRole('button', { name: /anual/i });
    fireEvent.click(annualBtn);

    expect(screen.getByText(/2[.,]868/)).toBeDefined();
    expect(screen.getByText('MXN / año')).toBeDefined();
    expect(screen.getByText(/239\s*MXN \/ mes/)).toBeDefined();
  });

  it('calls onInitiateCheckout with selected billing cycle when pay button is clicked', async () => {
    const onInitiateCheckout = vi.fn();
    render(
      <PlanCheckoutCard
        selectedProvider={mockProvider}
        onInitiateCheckout={onInitiateCheckout}
      />
    );

    const annualBtn = screen.getByRole('button', { name: /anual/i });
    fireEvent.click(annualBtn);

    const payButton = screen.getByRole('button', { name: /pagar con wompi/i });
    fireEvent.click(payButton);

    expect(onInitiateCheckout).toHaveBeenCalledWith('annual');
  });

  it('renders error message when error prop is provided', () => {
    render(
      <PlanCheckoutCard
        selectedProvider={mockProvider}
        onInitiateCheckout={vi.fn()}
        error="Fallo en la conexión con la pasarela"
      />
    );

    expect(screen.getByText('Fallo en la conexión con la pasarela')).toBeDefined();
  });
});
