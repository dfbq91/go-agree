import { describe, expect, it, vi } from 'vitest';
import { MockPaymentRepository } from '../../src/adapters/storage/MockPaymentRepository';
import { SupabasePaymentRepository } from '../../src/adapters/storage/SupabasePaymentRepository';

describe('PaymentRepository getTransactionByReference', () => {
  describe('MockPaymentRepository', () => {
    it('retrieves transaction by merchant reference', async () => {
      const repo = new MockPaymentRepository();
      await repo.createTransaction({
        userId: 'usr_1',
        providerId: 'wompi',
        reference: 'ga_pro_m_123',
        gatewayTransactionId: null,
        planId: 'pro',
        billingCycle: 'monthly',
        amount: 4900000,
        currency: 'COP',
        status: 'pending',
        paymentMethodType: null,
        rejectionReason: null,
      });

      const tx = await repo.getTransactionByReference('ga_pro_m_123');
      expect(tx).not.toBeNull();
      expect(tx?.reference).toBe('ga_pro_m_123');
    });

    it('retrieves transaction by gatewayTransactionId when reference does not match directly', async () => {
      const repo = new MockPaymentRepository();
      await repo.createTransaction({
        userId: 'usr_1',
        providerId: 'wompi',
        reference: 'ga_pro_m_123',
        gatewayTransactionId: null,
        planId: 'pro',
        billingCycle: 'monthly',
        amount: 4900000,
        currency: 'COP',
        status: 'pending',
        paymentMethodType: null,
        rejectionReason: null,
      });

      await repo.updateTransactionStatus('ga_pro_m_123', 'approved', 'wompi_tx_999', 'PSE');

      const tx = await repo.getTransactionByReference('wompi_tx_999');
      expect(tx).not.toBeNull();
      expect(tx?.reference).toBe('ga_pro_m_123');
      expect(tx?.gatewayTransactionId).toBe('wompi_tx_999');
      expect(tx?.status).toBe('approved');
    });

    it('returns null when neither reference nor gatewayTransactionId matches', async () => {
      const repo = new MockPaymentRepository();
      const tx = await repo.getTransactionByReference('non_existent');
      expect(tx).toBeNull();
    });
  });

  describe('SupabasePaymentRepository', () => {
    it('queries using .or(reference.eq,gateway_transaction_id.eq)', async () => {
      const mockRow = {
        id: 'tx-1',
        user_id: 'usr-1',
        provider_id: 'wompi',
        reference: 'ga_pro_m_123',
        gateway_transaction_id: 'wompi_tx_999',
        plan_id: 'pro',
        billing_cycle: 'monthly',
        amount: 4900000,
        currency: 'COP',
        status: 'approved',
        payment_method_type: 'PSE',
        rejection_reason: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            or: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: mockRow, error: null }),
            }),
          }),
        }),
      };

      const repo = new SupabasePaymentRepository(mockSupabase as any);
      const tx = await repo.getTransactionByReference('wompi_tx_999');

      expect(mockSupabase.from).toHaveBeenCalledWith('payment_transactions');
      expect(tx).not.toBeNull();
      expect(tx?.reference).toBe('ga_pro_m_123');
      expect(tx?.gatewayTransactionId).toBe('wompi_tx_999');
    });
  });
});
