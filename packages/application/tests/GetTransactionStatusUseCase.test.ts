import { beforeEach, describe, expect, it } from 'vitest';
import type {
  PaymentRepositoryPort,
  PaymentTransactionDTO,
} from '../src/ports/PaymentRepositoryPort.js';
import { GetTransactionStatusUseCase } from '../src/use-cases/GetTransactionStatusUseCase.js';

class InMemoryPaymentRepo implements PaymentRepositoryPort {
  public txs = new Map<string, PaymentTransactionDTO>();

  async createTransaction(
    tx: Omit<PaymentTransactionDTO, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PaymentTransactionDTO> {
    const created: PaymentTransactionDTO = {
      ...tx,
      id: `tx_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.txs.set(tx.reference, created);
    return created;
  }

  async getTransactionByReference(ref: string): Promise<PaymentTransactionDTO | null> {
    return this.txs.get(ref) || null;
  }

  async updateTransactionStatus(): Promise<void> {}
  async hasWebhookEvent(): Promise<boolean> {
    return false;
  }
  async recordWebhookEvent(): Promise<void> {}
}

describe('GetTransactionStatusUseCase', () => {
  let paymentRepo: InMemoryPaymentRepo;
  let useCase: GetTransactionStatusUseCase;

  const testRef = 'ga_pro_m_1726156800000_1234';
  const testUserId = 'usr_owner_1';

  beforeEach(async () => {
    paymentRepo = new InMemoryPaymentRepo();
    await paymentRepo.createTransaction({
      userId: testUserId,
      providerId: 'wompi',
      reference: testRef,
      gatewayTransactionId: 'gw_123',
      planId: 'pro',
      billingCycle: 'monthly',
      amount: 4900000,
      currency: 'COP',
      status: 'pending',
      paymentMethodType: 'PSE',
      rejectionReason: null,
    });

    useCase = new GetTransactionStatusUseCase(paymentRepo);
  });

  it('returns current transaction status by reference for owner', async () => {
    const result = await useCase.execute({
      reference: testRef,
      userId: testUserId,
    });

    expect(result).toBeDefined();
    expect(result?.reference).toBe(testRef);
    expect(result?.status).toBe('pending');
    expect(result?.amount).toBe(4900000);
    expect(result?.paymentMethodType).toBe('PSE');
  });

  it('returns null if transaction does not exist', async () => {
    const result = await useCase.execute({
      reference: 'non_existent_ref',
      userId: testUserId,
    });

    expect(result).toBeNull();
  });

  it('returns null or throws if requesting user does not own the transaction (tenant isolation)', async () => {
    const result = await useCase.execute({
      reference: testRef,
      userId: 'usr_different_intruder',
    });

    expect(result).toBeNull();
  });
});
