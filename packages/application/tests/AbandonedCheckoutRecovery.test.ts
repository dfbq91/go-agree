import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InitiatePlanCheckoutUseCase } from '../src/use-cases/InitiatePlanCheckoutUseCase.js';
import type { SubscriptionRepositoryPort, UserSubscriptionDTO } from '../src/ports/SubscriptionRepositoryPort.js';
import type { PaymentRepositoryPort, PaymentTransactionDTO } from '../src/ports/PaymentRepositoryPort.js';
import type { PaymentGatewayPort } from '../src/ports/PaymentGatewayPort.js';

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
    return this.txs.get(ref) || null;
  }

  async updateTransactionStatus(): Promise<void> {}
  async hasWebhookEvent(): Promise<boolean> { return false; }
  async recordWebhookEvent(): Promise<void> {}
}

describe('Abandoned Checkout Recovery (US6)', () => {
  let subRepo: InMemorySubscriptionRepo;
  let paymentRepo: InMemoryPaymentRepo;
  let mockGateway: PaymentGatewayPort;
  let initiateUseCase: InitiatePlanCheckoutUseCase;

  const testUserId = 'usr_abandoned_recovery';

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
      verifyWebhookSignature: vi.fn(),
      parseWebhookEvent: vi.fn(),
      getTransactionStatus: vi.fn(),
    };

    initiateUseCase = new InitiatePlanCheckoutUseCase(
      subRepo,
      paymentRepo,
      () => mockGateway
    );
  });

  it('allows user to initiate a new checkout session after abandoning a previous pending session', async () => {
    // 1. Initial checkout attempt abandoned by user
    const session1 = await initiateUseCase.execute({
      userId: testUserId,
      customerEmail: 'abandon@example.com',
      planId: 'pro',
      billingCycle: 'monthly',
      providerId: 'wompi',
      redirectUrl: 'https://go-agree.com/checkout/result',
    });

    expect(session1.reference).toBeDefined();

    // 2. User returns later (window was closed) and starts fresh checkout
    const session2 = await initiateUseCase.execute({
      userId: testUserId,
      customerEmail: 'abandon@example.com',
      planId: 'pro',
      billingCycle: 'annual', // Can even change billing cycle
      providerId: 'wompi',
      redirectUrl: 'https://go-agree.com/checkout/result',
    });

    expect(session2.reference).toBeDefined();
    expect(session2.reference).not.toBe(session1.reference);
    expect(session2.amount).toBe(46800000); // 468.000 COP

    // Both transaction records are safely retained in repository
    const tx1 = await paymentRepo.getTransactionByReference(session1.reference);
    const tx2 = await paymentRepo.getTransactionByReference(session2.reference);

    expect(tx1).toBeDefined();
    expect(tx2).toBeDefined();
    expect(tx1?.status).toBe('pending');
    expect(tx2?.status).toBe('pending');
  });
});
