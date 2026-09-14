import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProcessPaymentWebhookUseCase } from '../src/use-cases/ProcessPaymentWebhookUseCase.js';
import type { SubscriptionRepositoryPort, UserSubscriptionDTO } from '../src/ports/SubscriptionRepositoryPort.js';
import type { PaymentRepositoryPort, PaymentTransactionDTO, PaymentWebhookEventDTO } from '../src/ports/PaymentRepositoryPort.js';
import type { PaymentGatewayPort } from '../src/ports/PaymentGatewayPort.js';
import { PaymentTamperError } from '@go-agree/domain';

class InMemorySubscriptionRepo implements SubscriptionRepositoryPort {
  public subs = new Map<string, UserSubscriptionDTO>();

  async getByUserId(userId: string): Promise<UserSubscriptionDTO> {
    const sub = this.subs.get(userId);
    if (!sub) {
      return {
        id: `sub_${userId}`,
        userId,
        planType: 'free',
        status: 'active',
        freeContractsUsed: 3,
        startedAt: new Date().toISOString(),
        expiresAt: null,
        currentPeriodBillingCycle: null,
        lastPaymentTransactionId: null,
      };
    }
    return { ...sub };
  }

  async save(sub: UserSubscriptionDTO): Promise<void> {
    this.subs.set(sub.userId, { ...sub });
  }

  async incrementFreeContractCount(userId: string): Promise<number> {
    return 3;
  }

  async activateProPlan(userId: string, cycle: 'monthly' | 'annual', expiresAt: Date, txId: string): Promise<void> {
    this.subs.set(userId, {
      id: `sub_${userId}`,
      userId,
      planType: 'pro',
      status: 'active',
      freeContractsUsed: 3,
      startedAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      currentPeriodBillingCycle: cycle,
      lastPaymentTransactionId: txId,
    });
  }

  async expireSubscriptions(): Promise<number> {
    return 0;
  }
}

class InMemoryPaymentRepo implements PaymentRepositoryPort {
  public txs = new Map<string, PaymentTransactionDTO>();
  public webhookEvents = new Map<string, PaymentWebhookEventDTO>();

  async createTransaction(tx: Omit<PaymentTransactionDTO, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentTransactionDTO> {
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
    const tx = this.txs.get(ref);
    return tx ? { ...tx } : null;
  }

  async updateTransactionStatus(
    reference: string,
    status: PaymentTransactionDTO['status'],
    gatewayTransactionId?: string,
    paymentMethodType?: string,
    rejectionReason?: string
  ): Promise<void> {
    const tx = this.txs.get(reference);
    if (tx) {
      this.txs.set(reference, {
        ...tx,
        status,
        gatewayTransactionId: gatewayTransactionId ?? tx.gatewayTransactionId,
        paymentMethodType: paymentMethodType ?? tx.paymentMethodType,
        rejectionReason: rejectionReason ?? tx.rejectionReason,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  async hasWebhookEvent(eventId: string): Promise<boolean> {
    return this.webhookEvents.has(eventId);
  }

  async recordWebhookEvent(event: Omit<PaymentWebhookEventDTO, 'id' | 'processedAt'>): Promise<void> {
    this.webhookEvents.set(event.eventId, {
      ...event,
      id: `evt_${Date.now()}`,
      processedAt: new Date().toISOString(),
    });
  }
}

describe('ProcessPaymentWebhookUseCase', () => {
  let subRepo: InMemorySubscriptionRepo;
  let paymentRepo: InMemoryPaymentRepo;
  let mockGateway: PaymentGatewayPort;
  let useCase: ProcessPaymentWebhookUseCase;

  const testRef = 'ga_pro_m_1726156800000_abcd';
  const testUserId = 'usr_test_client_1';

  beforeEach(async () => {
    subRepo = new InMemorySubscriptionRepo();
    paymentRepo = new InMemoryPaymentRepo();

    // Create a pending transaction
    await paymentRepo.createTransaction({
      userId: testUserId,
      providerId: 'wompi',
      reference: testRef,
      gatewayTransactionId: null,
      planId: 'pro',
      billingCycle: 'monthly',
      amount: 4900000,
      currency: 'COP',
      status: 'pending',
      paymentMethodType: null,
      rejectionReason: null,
    });

    mockGateway = {
      providerId: 'wompi',
      createCheckoutUrl: vi.fn(),
      verifyWebhookSignature: vi.fn().mockReturnValue(true),
      parseWebhookEvent: vi.fn().mockReturnValue({
        eventId: 'wompi_evt_123',
        transactionReference: testRef,
        gatewayTransactionId: 'gw_tx_888',
        status: 'APPROVED',
        amountInCents: 4900000,
        currency: 'COP',
        paymentMethodType: 'PSE',
        timestamp: new Date(),
      }),
      getTransactionStatus: vi.fn(),
    };

    useCase = new ProcessPaymentWebhookUseCase(
      subRepo,
      paymentRepo,
      () => mockGateway
    );
  });

  it('activates Plan Pro upon valid approved webhook', async () => {
    const result = await useCase.execute({
      providerId: 'wompi',
      rawBody: '{}',
      headers: {},
      parsedPayload: {},
    });

    expect(result.status).toBe('processed');
    expect(result.planActivated).toBe(true);

    const updatedTx = await paymentRepo.getTransactionByReference(testRef);
    expect(updatedTx?.status).toBe('approved');
    expect(updatedTx?.gatewayTransactionId).toBe('gw_tx_888');

    const updatedSub = await subRepo.getByUserId(testUserId);
    expect(updatedSub.planType).toBe('pro');
    expect(updatedSub.status).toBe('active');
    expect(updatedSub.expiresAt).toBeDefined();
  });

  it('rejects tampered webhook and throws PaymentTamperError', async () => {
    vi.mocked(mockGateway.verifyWebhookSignature).mockReturnValue(false);

    await expect(
      useCase.execute({
        providerId: 'wompi',
        rawBody: '{}',
        headers: {},
        parsedPayload: {},
      })
    ).rejects.toThrow(PaymentTamperError);

    const failedEvent = Array.from(paymentRepo.webhookEvents.values()).find(
      e => e.status === 'failed_verification'
    );
    expect(failedEvent).toBeDefined();
  });

  it('enforces idempotency and ignores already processed webhook events', async () => {
    // Record event as already existing
    await paymentRepo.recordWebhookEvent({
      eventId: 'wompi_evt_123',
      providerId: 'wompi',
      transactionReference: testRef,
      eventType: 'transaction.updated',
      payload: {},
      checksum: 'valid',
      status: 'processed',
    });

    const result = await useCase.execute({
      providerId: 'wompi',
      rawBody: '{}',
      headers: {},
      parsedPayload: {},
    });

    expect(result.status).toBe('ignored_duplicate');
  });

  it('flags transaction and rejects activation if amount does not match', async () => {
    vi.mocked(mockGateway.parseWebhookEvent).mockReturnValue({
      eventId: 'wompi_evt_mismatch',
      transactionReference: testRef,
      gatewayTransactionId: 'gw_tx_888',
      status: 'APPROVED',
      amountInCents: 10000, // Mismatched amount! Expected 4900000
      currency: 'COP',
      paymentMethodType: 'PSE',
      timestamp: new Date(),
    });

    const result = await useCase.execute({
      providerId: 'wompi',
      rawBody: '{}',
      headers: {},
      parsedPayload: {},
    });

    expect(result.status).toBe('flagged_mismatch');
    expect(result.planActivated).toBe(false);

    const updatedTx = await paymentRepo.getTransactionByReference(testRef);
    expect(updatedTx?.status).toBe('flagged_mismatch');

    const sub = await subRepo.getByUserId(testUserId);
    expect(sub.planType).toBe('free'); // Not upgraded!
  });

  it('rejects duplicate payment when user already has active Pro plan', async () => {
    // Put user on active Pro plan
    const expiresAt = new Date(Date.now() + 25 * 24 * 60 * 60 * 1000);
    await subRepo.activateProPlan(testUserId, 'monthly', expiresAt, 'tx_prior');

    const result = await useCase.execute({
      providerId: 'wompi',
      rawBody: '{}',
      headers: {},
      parsedPayload: {},
    });

    expect(result.status).toBe('processed');
    expect(result.planActivated).toBe(false);

    const updatedTx = await paymentRepo.getTransactionByReference(testRef);
    expect(updatedTx?.status).toBe('rejected_duplicate');
  });
});
