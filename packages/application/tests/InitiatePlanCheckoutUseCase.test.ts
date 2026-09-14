import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InitiatePlanCheckoutUseCase } from '../src/use-cases/InitiatePlanCheckoutUseCase.js';
import { ListPaymentProvidersUseCase } from '../src/use-cases/ListPaymentProvidersUseCase.js';
import type { SubscriptionRepositoryPort, UserSubscriptionDTO } from '../src/ports/SubscriptionRepositoryPort.js';
import type { PaymentRepositoryPort, PaymentTransactionDTO } from '../src/ports/PaymentRepositoryPort.js';
import type { PaymentGatewayPort, CreateCheckoutResult } from '../src/ports/PaymentGatewayPort.js';
import {
  ActiveSubscriptionExistsError,
  UnsupportedPaymentProviderError,
  CountryPricingRegistry,
  PaymentProviderRegistry,
  type PricingPlanConfig,
  type PaymentProviderInfo,
} from '@go-agree/domain';

class InMemorySubscriptionRepo implements SubscriptionRepositoryPort {
  private subs = new Map<string, UserSubscriptionDTO>();

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
  private txs = new Map<string, PaymentTransactionDTO>();

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

describe('InitiatePlanCheckoutUseCase & ListPaymentProvidersUseCase', () => {
  let subRepo: InMemorySubscriptionRepo;
  let paymentRepo: InMemoryPaymentRepo;
  let mockGateway: PaymentGatewayPort;
  let initiateCheckoutUseCase: InitiatePlanCheckoutUseCase;
  let listProvidersUseCase: ListPaymentProvidersUseCase;

  beforeEach(() => {
    CountryPricingRegistry.resetToDefaults();
    PaymentProviderRegistry.resetToDefaults();
    subRepo = new InMemorySubscriptionRepo();
    paymentRepo = new InMemoryPaymentRepo();
    mockGateway = {
      providerId: 'wompi',
      createCheckoutUrl: vi.fn().mockImplementation(async (input) => ({
        checkoutUrl: `https://checkout.wompi.co/p/?ref=${input.reference}`,
        reference: input.reference,
        signature: 'mock_sig_123',
      })),
      verifyWebhookSignature: vi.fn(),
      parseWebhookEvent: vi.fn(),
      getTransactionStatus: vi.fn(),
    };

    initiateCheckoutUseCase = new InitiatePlanCheckoutUseCase(
      subRepo,
      paymentRepo,
      () => mockGateway
    );
    listProvidersUseCase = new ListPaymentProvidersUseCase();
  });

  describe('ListPaymentProvidersUseCase', () => {
    it('returns Wompi for Colombia (CO)', async () => {
      const providers = await listProvidersUseCase.execute({ countryCode: 'CO' });
      expect(providers.length).toBeGreaterThan(0);
      expect(providers.some(p => p.id === 'wompi')).toBe(true);
    });
  });

  describe('InitiatePlanCheckoutUseCase', () => {
    it('creates pending transaction and returns checkout URL for eligible user', async () => {
      const result = await initiateCheckoutUseCase.execute({
        userId: 'usr_abc',
        customerEmail: 'buyer@example.com',
        planId: 'pro',
        billingCycle: 'monthly',
        providerId: 'wompi',
        redirectUrl: 'https://go-agree.com/checkout/result',
      });

      expect(result.checkoutUrl).toContain('https://checkout.wompi.co/p/?ref=');
      expect(result.amount).toBe(4900000); // 49.000 COP in cents
      expect(result.currency).toBe('COP');
      expect(result.providerId).toBe('wompi');

      const savedTx = await paymentRepo.getTransactionByReference(result.reference);
      expect(savedTx).toBeDefined();
      expect(savedTx?.status).toBe('pending');
      expect(savedTx?.amount).toBe(4900000);
      expect(savedTx?.billingCycle).toBe('monthly');
      expect(mockGateway.createCheckoutUrl).toHaveBeenCalledWith(
        expect.objectContaining({
          redirectUrl: `https://go-agree.com/checkout/result?reference=${result.reference}`,
        })
      );
    });

    it('calculates 468.000 COP in cents for annual billing cycle', async () => {
      const result = await initiateCheckoutUseCase.execute({
        userId: 'usr_abc',
        customerEmail: 'buyer@example.com',
        planId: 'pro',
        billingCycle: 'annual',
        providerId: 'wompi',
        redirectUrl: 'https://go-agree.com/checkout/result',
      });

      expect(result.amount).toBe(46800000); // 468.000 COP in cents
    });

    it('blocks checkout initiation and throws ActiveSubscriptionExistsError when user already has active Pro plan', async () => {
      // Activate Pro plan
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await subRepo.activateProPlan('usr_pro', 'monthly', expiresAt, 'tx_existing');

      await expect(
        initiateCheckoutUseCase.execute({
          userId: 'usr_pro',
          customerEmail: 'active@example.com',
          planId: 'pro',
          billingCycle: 'monthly',
          providerId: 'wompi',
          redirectUrl: 'https://go-agree.com/checkout/result',
        })
      ).rejects.toThrow(ActiveSubscriptionExistsError);
    });

    it('initiates checkout with custom country currency and pricing (multi-currency)', async () => {
      // Register custom country plan and provider
      const mxPlan: PricingPlanConfig = {
        id: 'pro-mx',
        name: 'Plan Pro México',
        tagline: 'Acceso en México',
        countryCode: 'MX',
        currency: { symbol: '$', code: 'MXN', position: 'prefix' },
        monthlyPrice: 299,
        annualMonthlyPrice: 239,
        annualTotal: 2868,
        annualDiscountPercent: 20,
        freeContractsIncluded: 3,
        features: ['F1', 'F2', 'F3'],
        cta: { label: 'Comenzar', href: '/register' },
      };
      CountryPricingRegistry.registerPlan('MX', mxPlan);

      const mxProvider: PaymentProviderInfo = {
        id: 'stripe',
        name: 'Stripe',
        description: 'Tarjetas en México',
        supportedCountries: ['MX'],
        supportedPaymentMethods: ['CARD'],
        logoKey: 'stripe',
        isDefault: true,
      };
      PaymentProviderRegistry.registerProvider(mxProvider);

      const result = await initiateCheckoutUseCase.execute({
        userId: 'usr_mx',
        customerEmail: 'mx@example.com',
        planId: 'pro-mx',
        billingCycle: 'monthly',
        providerId: 'stripe',
        redirectUrl: 'https://go-agree.com/checkout/result',
        countryCode: 'MX',
      });

      expect(result.currency).toBe('MXN');
      expect(result.amount).toBe(29900); // 299 MXN in cents
      expect(result.providerId).toBe('stripe');

      const savedTx = await paymentRepo.getTransactionByReference(result.reference);
      expect(savedTx?.currency).toBe('MXN');
      expect(savedTx?.amount).toBe(29900);
    });

    it('throws UnsupportedPaymentProviderError when payment provider is not available in user country', async () => {
      // Attempt to use 'wompi' (only CO) for country 'US'
      await expect(
        initiateCheckoutUseCase.execute({
          userId: 'usr_us',
          customerEmail: 'us@example.com',
          planId: 'pro',
          billingCycle: 'monthly',
          providerId: 'wompi',
          redirectUrl: 'https://go-agree.com/checkout/result',
          countryCode: 'US',
        })
      ).rejects.toThrow(UnsupportedPaymentProviderError);
    });
  });
});
