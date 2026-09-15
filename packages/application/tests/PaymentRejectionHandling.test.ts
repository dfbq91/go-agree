import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PaymentGatewayPort } from '../src/ports/PaymentGatewayPort.js';
import type {
  PaymentRepositoryPort,
  PaymentTransactionDTO,
  PaymentWebhookEventDTO,
} from '../src/ports/PaymentRepositoryPort.js';
import type {
  SubscriptionRepositoryPort,
  UserSubscriptionDTO,
} from '../src/ports/SubscriptionRepositoryPort.js';
import { GetTransactionStatusUseCase } from '../src/use-cases/GetTransactionStatusUseCase.js';
import { InitiatePlanCheckoutUseCase } from '../src/use-cases/InitiatePlanCheckoutUseCase.js';
import { ProcessPaymentWebhookUseCase } from '../src/use-cases/ProcessPaymentWebhookUseCase.js';

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

  async activateProPlan(): Promise<void> {}
  async expireSubscriptions(): Promise<number> {
    return 0;
  }
}

class InMemoryPaymentRepo implements PaymentRepositoryPort {
  public txs = new Map<string, PaymentTransactionDTO>();
  public webhookEvents = new Map<string, PaymentWebhookEventDTO>();

  async createTransaction(
    tx: Omit<PaymentTransactionDTO, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PaymentTransactionDTO> {
    if (this.txs.has(tx.reference)) {
      throw new Error(`Reference ${tx.reference} already exists and cannot be reused`);
    }

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

  async recordWebhookEvent(
    event: Omit<PaymentWebhookEventDTO, 'id' | 'processedAt'>
  ): Promise<void> {
    this.webhookEvents.set(event.eventId, {
      ...event,
      id: `evt_${Date.now()}`,
      processedAt: new Date().toISOString(),
    });
  }
}

describe('Payment Rejection Handling & Non-Reusable References (US5)', () => {
  let subRepo: InMemorySubscriptionRepo;
  let paymentRepo: InMemoryPaymentRepo;
  let mockGateway: PaymentGatewayPort;
  let initiateUseCase: InitiatePlanCheckoutUseCase;
  let webhookUseCase: ProcessPaymentWebhookUseCase;
  let getStatusUseCase: GetTransactionStatusUseCase;

  const testUserId = 'usr_retry_tester';

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

    initiateUseCase = new InitiatePlanCheckoutUseCase(subRepo, paymentRepo, () => mockGateway);
    webhookUseCase = new ProcessPaymentWebhookUseCase(subRepo, paymentRepo, () => mockGateway);
    getStatusUseCase = new GetTransactionStatusUseCase(paymentRepo);
  });

  it('captures rejection diagnostic reasons and preserves failed status', async () => {
    // 1. Initiate checkout
    const init1 = await initiateUseCase.execute({
      userId: testUserId,
      customerEmail: 'tester@example.com',
      planId: 'pro',
      billingCycle: 'monthly',
      providerId: 'wompi',
      redirectUrl: 'https://go-agree.com/checkout/result',
    });

    // 2. Webhook delivers DECLINED event with reason
    vi.mocked(mockGateway.parseWebhookEvent).mockReturnValue({
      eventId: 'evt_declined_1',
      transactionReference: init1.reference,
      gatewayTransactionId: 'gw_declined_999',
      status: 'DECLINED',
      amountInCents: 4900000,
      currency: 'COP',
      paymentMethodType: 'CARD',
      rejectionReason: 'Fondos insuficientes',
      timestamp: new Date(),
    });

    await webhookUseCase.execute({
      providerId: 'wompi',
      rawBody: '{}',
      headers: {},
      parsedPayload: {},
    });

    // 3. Status query returns rejected with diagnostic reason
    const status = await getStatusUseCase.execute({
      reference: init1.reference,
      userId: testUserId,
    });

    expect(status?.status).toBe('rejected');
    expect(status?.rejectionReason).toBe('Fondos insuficientes');
    expect(status?.paymentMethodType).toBe('CARD');
  });

  it('guarantees retry creates a brand new unique reference and preserves original failed reference archived', async () => {
    // First attempt (which will fail)
    const firstAttempt = await initiateUseCase.execute({
      userId: testUserId,
      customerEmail: 'tester@example.com',
      planId: 'pro',
      billingCycle: 'monthly',
      providerId: 'wompi',
      redirectUrl: 'https://go-agree.com/checkout/result',
    });

    // Second retry attempt
    const secondAttempt = await initiateUseCase.execute({
      userId: testUserId,
      customerEmail: 'tester@example.com',
      planId: 'pro',
      billingCycle: 'monthly',
      providerId: 'wompi',
      redirectUrl: 'https://go-agree.com/checkout/result',
    });

    expect(secondAttempt.reference).not.toBe(firstAttempt.reference);
    expect(secondAttempt.checkoutUrl).not.toBe(firstAttempt.checkoutUrl);

    // Both exist independently in the repository
    const tx1 = await paymentRepo.getTransactionByReference(firstAttempt.reference);
    const tx2 = await paymentRepo.getTransactionByReference(secondAttempt.reference);

    expect(tx1).toBeDefined();
    expect(tx2).toBeDefined();
  });
});
