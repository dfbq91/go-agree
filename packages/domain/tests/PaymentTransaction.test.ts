import { describe, it, expect } from 'vitest';
import { UserId } from '../src/value-objects/UserId.js';
import { PaymentTransaction } from '../src/entities/PaymentTransaction.js';

describe('PaymentTransaction Entity', () => {
  const userId = new UserId('usr_12345678-1234-1234-1234-123456789012');

  it('creates an initial pending transaction correctly', () => {
    const tx = PaymentTransaction.createPending({
      userId,
      providerId: 'wompi',
      reference: 'ga_pro_m_1726156800000_f3a1b2c4',
      planId: 'pro',
      billingCycle: 'monthly',
      amount: 4900000,
      currency: 'COP',
    });

    expect(tx.status).toBe('pending');
    expect(tx.reference).toBe('ga_pro_m_1726156800000_f3a1b2c4');
    expect(tx.amount).toBe(4900000);
    expect(tx.currency).toBe('COP');
    expect(tx.gatewayTransactionId).toBeNull();
    expect(tx.paymentMethodType).toBeNull();
    expect(tx.rejectionReason).toBeNull();
    expect(tx.isFinal()).toBe(false);
  });

  it('transitions from pending to approved', () => {
    const tx = PaymentTransaction.createPending({
      userId,
      providerId: 'wompi',
      reference: 'ga_pro_m_1726156800000_f3a1b2c4',
      planId: 'pro',
      billingCycle: 'monthly',
      amount: 4900000,
      currency: 'COP',
    });

    const approved = tx.markApproved('wompi_tx_999', 'PSE');
    expect(approved.status).toBe('approved');
    expect(approved.gatewayTransactionId).toBe('wompi_tx_999');
    expect(approved.paymentMethodType).toBe('PSE');
    expect(approved.isFinal()).toBe(true);
  });

  it('transitions from pending to rejected with reason', () => {
    const tx = PaymentTransaction.createPending({
      userId,
      providerId: 'wompi',
      reference: 'ga_pro_m_1726156800000_f3a1b2c4',
      planId: 'pro',
      billingCycle: 'monthly',
      amount: 4900000,
      currency: 'COP',
    });

    const rejected = tx.markRejected('Fondos insuficientes', 'wompi_tx_888', 'CARD');
    expect(rejected.status).toBe('rejected');
    expect(rejected.rejectionReason).toBe('Fondos insuficientes');
    expect(rejected.gatewayTransactionId).toBe('wompi_tx_888');
    expect(rejected.paymentMethodType).toBe('CARD');
    expect(rejected.isFinal()).toBe(true);
  });

  it('marks duplicate payment rejected for duplicate prevention policy', () => {
    const tx = PaymentTransaction.createPending({
      userId,
      providerId: 'wompi',
      reference: 'ga_pro_m_1726156800000_f3a1b2c4',
      planId: 'pro',
      billingCycle: 'monthly',
      amount: 4900000,
      currency: 'COP',
    });

    const duplicate = tx.markDuplicate('wompi_tx_dup', 'Pago duplicado para cliente con Plan Pro');
    expect(duplicate.status).toBe('rejected_duplicate');
    expect(duplicate.isFinal()).toBe(true);
  });

  it('marks flagged mismatch when amounts differ', () => {
    const tx = PaymentTransaction.createPending({
      userId,
      providerId: 'wompi',
      reference: 'ga_pro_m_1726156800000_f3a1b2c4',
      planId: 'pro',
      billingCycle: 'monthly',
      amount: 4900000,
      currency: 'COP',
    });

    const flagged = tx.markFlaggedMismatch('Monto recibido no coincide: 10000 vs 4900000');
    expect(flagged.status).toBe('flagged_mismatch');
    expect(flagged.isFinal()).toBe(true);
  });
});
