import type { TransactionStatusResult } from '@go-agree/application';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PaymentResultView } from '../../src/components/checkout/PaymentResultView';
import { es } from '../../src/locales/es';

describe('PaymentResultView Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders approved view when status is approved with link to dashboard', () => {
    const mockTx: TransactionStatusResult = {
      id: 'tx_1',
      reference: 'ga_pro_m_1726156800000_1234',
      status: 'approved',
      planId: 'pro',
      billingCycle: 'monthly',
      amount: 4900000,
      currency: 'COP',
      providerId: 'wompi',
      paymentMethodType: 'PSE',
      rejectionReason: null,
      updatedAt: new Date().toISOString(),
    };

    render(<PaymentResultView initialStatus={mockTx} reference={mockTx.reference} />);

    expect(screen.getByText(es.paymentResult.approvedTitle)).toBeDefined();
    expect(screen.getByText(es.paymentResult.approvedSubtitle)).toBeDefined();
    expect(screen.getByRole('link', { name: es.paymentResult.backToDashboard })).toBeDefined();
  });

  it('renders pending view with manual verify button and Spanish reassuring message', () => {
    const mockTx: TransactionStatusResult = {
      id: 'tx_2',
      reference: 'ga_pro_m_1726156800000_pending',
      status: 'pending',
      planId: 'pro',
      billingCycle: 'monthly',
      amount: 4900000,
      currency: 'COP',
      providerId: 'wompi',
      paymentMethodType: 'PSE',
      rejectionReason: null,
      updatedAt: new Date().toISOString(),
    };

    render(<PaymentResultView initialStatus={mockTx} reference={mockTx.reference} />);

    expect(screen.getByText(es.paymentResult.pendingTitle)).toBeDefined();
    expect(screen.getByText(es.paymentResult.pendingSubtitle)).toBeDefined();
    expect(screen.getByRole('button', { name: es.paymentResult.verifyStatusButton })).toBeDefined();
  });

  it('renders rejected view with diagnostic reason and retry button leading to /checkout', () => {
    const mockTx: TransactionStatusResult = {
      id: 'tx_3',
      reference: 'ga_pro_m_1726156800000_rejected',
      status: 'rejected',
      planId: 'pro',
      billingCycle: 'monthly',
      amount: 4900000,
      currency: 'COP',
      providerId: 'wompi',
      paymentMethodType: 'CARD',
      rejectionReason: 'Fondos insuficientes',
      updatedAt: new Date().toISOString(),
    };

    render(<PaymentResultView initialStatus={mockTx} reference={mockTx.reference} />);

    expect(screen.getByText(es.paymentResult.rejectedTitle)).toBeDefined();
    expect(screen.getByText(/Fondos insuficientes/)).toBeDefined();
    expect(screen.getByRole('link', { name: es.paymentResult.retryButton })).toBeDefined();
  });

  it('updates status dynamically when manual verify button is clicked and API returns approved', async () => {
    const mockTx: TransactionStatusResult = {
      id: 'tx_4',
      reference: 'ga_pro_m_1726156800000_polled',
      status: 'pending',
      planId: 'pro',
      billingCycle: 'monthly',
      amount: 4900000,
      currency: 'COP',
      providerId: 'wompi',
      paymentMethodType: 'PSE',
      rejectionReason: null,
      updatedAt: new Date().toISOString(),
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ...mockTx,
        status: 'approved',
      }),
    });

    render(<PaymentResultView initialStatus={mockTx} reference={mockTx.reference} />);

    const verifyBtn = screen.getByRole('button', { name: es.paymentResult.verifyStatusButton });
    fireEvent.click(verifyBtn);

    await waitFor(() => {
      expect(screen.getByText(es.paymentResult.approvedTitle)).toBeDefined();
    });
  });
});
