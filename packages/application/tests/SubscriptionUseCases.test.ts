import { FreeQuotaExceededError } from '@go-agree/domain';
import { beforeEach, describe, expect, it } from 'vitest';
import type {
  SubscriptionRepositoryPort,
  UserSubscriptionDTO,
} from '../src/ports/SubscriptionRepositoryPort.js';
import { ConsumeContractQuotaUseCase } from '../src/use-cases/ConsumeContractQuotaUseCase.js';
import { GetSubscriptionStatusUseCase } from '../src/use-cases/GetSubscriptionStatusUseCase.js';

class InMemorySubscriptionRepository implements SubscriptionRepositoryPort {
  private subscriptions: Map<string, UserSubscriptionDTO> = new Map();

  async getByUserId(userId: string): Promise<UserSubscriptionDTO> {
    let sub = this.subscriptions.get(userId);
    if (!sub) {
      sub = {
        id: `sub_${userId}`,
        userId,
        planType: 'free',
        status: 'active',
        freeContractsUsed: 0,
        startedAt: new Date().toISOString(),
        expiresAt: null,
        currentPeriodBillingCycle: null,
        lastPaymentTransactionId: null,
      };
      this.subscriptions.set(userId, sub);
    }
    return { ...sub };
  }

  async save(subscription: UserSubscriptionDTO): Promise<void> {
    this.subscriptions.set(subscription.userId, { ...subscription });
  }

  async incrementFreeContractCount(userId: string): Promise<number> {
    const sub = await this.getByUserId(userId);
    const updatedCount = sub.freeContractsUsed + 1;
    await this.save({
      ...sub,
      freeContractsUsed: updatedCount,
    });
    return updatedCount;
  }

  async activateProPlan(
    userId: string,
    billingCycle: 'monthly' | 'annual',
    expiresAt: Date,
    transactionId: string
  ): Promise<void> {
    const sub = await this.getByUserId(userId);
    await this.save({
      ...sub,
      planType: 'pro',
      status: 'active',
      currentPeriodBillingCycle: billingCycle,
      expiresAt: expiresAt.toISOString(),
      lastPaymentTransactionId: transactionId,
    });
  }

  async expireSubscriptions(): Promise<number> {
    return 0;
  }
}

describe('Subscription Use Cases', () => {
  let subRepo: InMemorySubscriptionRepository;
  let getStatusUseCase: GetSubscriptionStatusUseCase;
  let consumeQuotaUseCase: ConsumeContractQuotaUseCase;

  const userId = 'usr_test_123';

  beforeEach(() => {
    subRepo = new InMemorySubscriptionRepository();
    getStatusUseCase = new GetSubscriptionStatusUseCase(subRepo);
    consumeQuotaUseCase = new ConsumeContractQuotaUseCase(subRepo);
  });

  describe('GetSubscriptionStatusUseCase', () => {
    it('returns default free subscription for a new user', async () => {
      const status = await getStatusUseCase.execute({ userId });

      expect(status.planType).toBe('free');
      expect(status.status).toBe('active');
      expect(status.freeContractsUsed).toBe(0);
      expect(status.freeContractsLimit).toBe(3);
      expect(status.remainingQuota).toBe(3);
      expect(status.canGenerateContract).toBe(true);
      expect(status.canInitiateCheckout).toBe(true);
    });

    it('returns active Pro status with unlimited quota', async () => {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await subRepo.activateProPlan(userId, 'monthly', expiresAt, 'tx_123');

      const status = await getStatusUseCase.execute({ userId });

      expect(status.planType).toBe('pro');
      expect(status.status).toBe('active');
      expect(status.canGenerateContract).toBe(true);
      expect(status.canInitiateCheckout).toBe(false); // cannot buy duplicate
      expect(status.currentPeriodBillingCycle).toBe('monthly');
    });
  });

  describe('ConsumeContractQuotaUseCase', () => {
    it('consumes free quota up to 3 contracts', async () => {
      let result = await consumeQuotaUseCase.execute({ userId });
      expect(result.freeContractsUsed).toBe(1);
      expect(result.remainingQuota).toBe(2);

      result = await consumeQuotaUseCase.execute({ userId });
      expect(result.freeContractsUsed).toBe(2);
      expect(result.remainingQuota).toBe(1);

      result = await consumeQuotaUseCase.execute({ userId });
      expect(result.freeContractsUsed).toBe(3);
      expect(result.remainingQuota).toBe(0);
    });

    it('throws FreeQuotaExceededError when 3 contracts have already been consumed', async () => {
      await consumeQuotaUseCase.execute({ userId });
      await consumeQuotaUseCase.execute({ userId });
      await consumeQuotaUseCase.execute({ userId });

      await expect(consumeQuotaUseCase.execute({ userId })).rejects.toThrow(FreeQuotaExceededError);
    });

    it('does not increment free quota count if user is on active Pro plan', async () => {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await subRepo.activateProPlan(userId, 'monthly', expiresAt, 'tx_123');

      const result = await consumeQuotaUseCase.execute({ userId });
      expect(result.freeContractsUsed).toBe(0);
      expect(result.canGenerateContract).toBe(true);

      const currentSub = await subRepo.getByUserId(userId);
      expect(currentSub.freeContractsUsed).toBe(0);
    });
  });
});
