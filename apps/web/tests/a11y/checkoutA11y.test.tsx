import type { PaymentProviderInfo } from '@go-agree/domain';
import { render } from '@testing-library/react';
import axe from 'axe-core';
import { describe, expect, it, vi } from 'vitest';
import { PaymentProviderSelector } from '../../src/components/checkout/PaymentProviderSelector';
import { PaymentResultView } from '../../src/components/checkout/PaymentResultView';
import { PlanCheckoutCard } from '../../src/components/checkout/PlanCheckoutCard';
import { PlanQuotaBadge } from '../../src/components/dashboard/PlanQuotaBadge';
import { QuotaUpgradeModal } from '../../src/components/modals/QuotaUpgradeModal';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/checkout',
}));

const mockProvider: PaymentProviderInfo = {
  id: 'wompi',
  name: 'Wompi (Bancolombia)',
  description: 'PSE, Tarjetas, Nequi y transferencias Bancolombia',
  supportedCountries: ['CO'],
  supportedPaymentMethods: ['PSE', 'CARD', 'NEQUI'],
  logoKey: 'wompi',
  isDefault: true,
};

describe('Checkout & Quota Accessibility Audit (axe-core)', () => {
  const axeOptions: axe.RunOptions = {
    rules: {
      'color-contrast': { enabled: false }, // happy-dom does not calculate CSS render trees
    },
  };

  it('PlanQuotaBadge passes accessibility checks without violations', async () => {
    const { container: freeContainer } = render(
      <PlanQuotaBadge
        planType="free"
        status="active"
        freeContractsUsed={1}
        freeContractsLimit={3}
        remainingQuota={2}
      />
    );
    const freeResults = await axe.run(freeContainer, axeOptions);
    expect(freeResults.violations).toEqual([]);

    const { container: proContainer } = render(
      <PlanQuotaBadge
        planType="pro"
        status="active"
        freeContractsUsed={3}
        freeContractsLimit={3}
        remainingQuota={9999}
      />
    );
    const proResults = await axe.run(proContainer, axeOptions);
    expect(proResults.violations).toEqual([]);
  });

  it('QuotaUpgradeModal passes accessibility checks without violations', async () => {
    const { container } = render(
      <QuotaUpgradeModal isOpen={true} onClose={vi.fn()} onUpgrade={vi.fn()} />
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it('PaymentProviderSelector passes accessibility checks without violations', async () => {
    const { container } = render(
      <PaymentProviderSelector
        providers={[mockProvider]}
        selectedProviderId="wompi"
        onSelectProvider={vi.fn()}
      />
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it('PlanCheckoutCard passes accessibility checks without violations', async () => {
    const { container } = render(
      <PlanCheckoutCard selectedProvider={mockProvider} onInitiateCheckout={vi.fn()} />
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it('PaymentResultView passes accessibility checks across all statuses', async () => {
    // Approved
    const { container: approvedContainer } = render(
      <PaymentResultView
        initialStatus={{
          id: 'tx_1',
          reference: 'ga_pro_m_1',
          status: 'approved',
          planId: 'pro',
          billingCycle: 'monthly',
          amount: 4900000,
          currency: 'COP',
          providerId: 'wompi',
          paymentMethodType: 'PSE',
          rejectionReason: null,
          updatedAt: new Date().toISOString(),
        }}
        reference="ga_pro_m_1"
      />
    );
    const approvedResults = await axe.run(approvedContainer, axeOptions);
    expect(approvedResults.violations).toEqual([]);

    // Pending
    const { container: pendingContainer } = render(
      <PaymentResultView
        initialStatus={{
          id: 'tx_2',
          reference: 'ga_pro_m_2',
          status: 'pending',
          planId: 'pro',
          billingCycle: 'monthly',
          amount: 4900000,
          currency: 'COP',
          providerId: 'wompi',
          paymentMethodType: 'PSE',
          rejectionReason: null,
          updatedAt: new Date().toISOString(),
        }}
        reference="ga_pro_m_2"
      />
    );
    const pendingResults = await axe.run(pendingContainer, axeOptions);
    expect(pendingResults.violations).toEqual([]);

    // Rejected
    const { container: rejectedContainer } = render(
      <PaymentResultView
        initialStatus={{
          id: 'tx_3',
          reference: 'ga_pro_m_3',
          status: 'rejected',
          planId: 'pro',
          billingCycle: 'monthly',
          amount: 4900000,
          currency: 'COP',
          providerId: 'wompi',
          paymentMethodType: 'CARD',
          rejectionReason: 'Fondos insuficientes',
          updatedAt: new Date().toISOString(),
        }}
        reference="ga_pro_m_3"
      />
    );
    const rejectedResults = await axe.run(rejectedContainer, axeOptions);
    expect(rejectedResults.violations).toEqual([]);
  });
});
