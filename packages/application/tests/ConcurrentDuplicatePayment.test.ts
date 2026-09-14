import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InitiatePlanCheckoutUseCase } from '../src/use-cases/InitiatePlanCheckoutUseCase.js';
import { ProcessPaymentWebhookUseCase } from '../src/use-cases/ProcessPaymentWebhookUseCase.js';
import type { SubscriptionRepositoryPort, UserSubscriptionDTO } from '../src/ports/SubscriptionRepositoryPort.js';
import type { PaymentRepositoryPort, PaymentTransactionDTO, PaymentWebhookEventDTO } from '../src/ports/PaymentRepositoryPort.js';
import type { PaymentGatewayPort } from '../src/ports/PaymentGatewayPort.js';
import { ActiveSubscriptionExistsError } from '@go-agree/domain';

class InMemorySubscriptionRepo implements SubscriptionRepositoryPort {
  public subs = new Map<string, UserSubscriptionDTO>();

  async getByUserId(userId: string): Promise<UserSubscriptionDTO> {
    return (
      this.subs.get(userId) || {
        id: `sub_${userId}`,
        userId,
        planType: 'free',
        status: 'active',
        freeContractsUsed: 3,
        startedAt: new Date().toISOString(),
        expiresAt: null,
        currentPeriodBillingCycle: null,
        lastPaymentTransactionId: null,
      }
    );
  }

  async save(sub: UserSubscriptionDTO): Promise<void> {
    this.subs.set(sub.userId, { ...sub });
  }

  async incrementFreeContractCount(): Promise<number> {
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
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.txs.set(tx.reference, created);
    return created;
  }

  async getTransactionByReference(ref: string): Promise<PaymentTransactionDTO | null> {
    return this.txs.get(ref) || null;
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

describe('Concurrent Duplicate Payment Prevention (US7)', () => {
  let subRepo: InMemorySubscriptionRepo;
  let paymentRepo: InMemoryPaymentRepo;
  let mockGateway: PaymentGatewayPort;
  let initiateUseCase: InitiatePlanCheckoutUseCase;
  let webhookUseCase: ProcessPaymentWebhookUseCase;

  const testUserId = 'usr_concurrent_client';

  beforeEach(() => {
    subRepo = new InMemorySubscriptionRepo();
    paymentRepo = new InMemoryPaymentRepo();
    mockGateway = {
      providerId: 'wompi',
      createCheckoutUrl: vi.fn().mockImplementation(async (input) => ({
        checkoutUrl: `https://checkout.wompi.co/p/?ref=${input.reference}`,
        reference: input.reference,
        signature: 'sig_mock',
      })),
      verifyWebhookSignature: vi.fn().mockReturnValue(true),
      parseWebhookEvent: vi.fn(),
      getTransactionStatus: vi.fn(),
    };

    initiateUseCase = new InitiatePlanCheckoutUseCase(
      subRepo,
      paymentRepo,
      () => mockGateway
    );
    webhookUseCase = new ProcessPaymentWebhookUseCase(
      subRepo,
      paymentRepo,
      () => mockGateway
    );
  });

  it('rejects concurrent second approved payment as rejected_duplicate when first payment already upgraded user to Pro', async () => {
    // 1. Tab A initiates checkout
    const tabA = await initiateUseCase.execute({
      userId: testUserId,
      customerEmail: 'multi@example.com',
      planId: 'pro',
      billingCycle: 'monthly',
      providerId: 'wompi',
      redirectUrl: 'https://go-agree.com/checkout/result',
    });

    // 2. Tab B initiates checkout concurrently before Tab A completes
    const tabB = await initiateUseCase.execute({
      userId: testUserId,
      customerEmail: 'multi@example.com',
      planId: 'pro',
      billingCycle: 'monthly',
      providerId: 'wompi',
      redirectUrl: 'https://go-agree.com/checkout/result',
    });

    expect(tabA.reference).not.toBe(tabB.reference);

    // 3. Webhook for Tab A arrives and confirms payment
    vi.mocked(mockGateway.parseWebhookEvent).mockReturnValue({
      eventId: 'evt_tab_a',
      transactionReference: tabA.reference,
      gatewayTransactionId: 'gw_tx_a',
      status: 'APPROVED',
      amountInCents: 4900000,
      currency: 'COP',
      paymentMethodType: 'PSE',
      timestamp: new Date(),
    });

    const resultA = await webhookUseCase.execute({
      providerId: 'wompi',
      rawBody: '{}',
      headers: {},
      parsedPayload: {},
    });

    expect(resultA.planActivated).toBe(true);
    const txA = await paymentRepo.getTransactionByReference(tabA.reference);
    expect(txA?.status).toBe('approved');

    // 4. Webhook for Tab B arrives concurrently
    vi.mocked(mockGateway.parseWebhookEvent).mockReturnValue({
      eventId: 'evt_tab_b',
      transactionReference: tabB.reference,
      gatewayTransactionId: 'gw_tx_b',
      status: 'APPROVED',
      amountInCents: 4900000,
      currency: 'COP',
      paymentMethodType: 'CARD',
      timestamp: new Date(),
    });

    const resultB = await webhookUseCase.execute({
      providerId: 'wompi',
      rawBody: '{}',
      headers: {},
      parsedPayload: {},
    });

    expect(resultB.planActivated).toBe(false);
    expect(resultB.message).toContain('duplicado');

    const txB = await paymentRepo.getTransactionByReference(tabB.reference);
    expect(txB?.status).toBe('rejected_duplicate');

    // 5. Subsequent checkout initiation is strictly blocked
    await expect(
      initiateUseCase.execute({
        userId: testUserId,
        customerEmail: 'multi@example.com',
        planId: 'pro',
        billingCycle: 'monthly',
        providerId: 'wompi',
        redirectUrl: 'https://go-agree.com/checkout/result',
      })
    ).rejects.toThrow(ActiveSubscriptionExistsError);
  });
});
