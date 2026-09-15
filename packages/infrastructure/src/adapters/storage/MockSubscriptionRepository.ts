/**
 * @file MockSubscriptionRepository.ts
 * @description In-memory mock implementation of SubscriptionRepositoryPort for testing.
 */

import type { SubscriptionRepositoryPort, UserSubscriptionDTO } from '@go-agree/application';

export class MockSubscriptionRepository implements SubscriptionRepositoryPort {
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

    // Auto-check expiration
    if (sub.planType === 'pro' && sub.expiresAt) {
      if (new Date(sub.expiresAt).getTime() <= Date.now()) {
        sub = {
          ...sub,
          planType: 'free',
          status: 'expired',
        };
        this.subscriptions.set(userId, sub);
      }
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

  async expireSubscriptions(now: Date = new Date()): Promise<number> {
    let expiredCount = 0;
    const nowTime = now.getTime();
    for (const [userId, sub] of this.subscriptions.entries()) {
      if (sub.planType === 'pro' && sub.expiresAt && new Date(sub.expiresAt).getTime() <= nowTime) {
        this.subscriptions.set(userId, {
          ...sub,
          planType: 'free',
          status: 'expired',
        });
        expiredCount++;
      }
    }
    return expiredCount;
  }
}
