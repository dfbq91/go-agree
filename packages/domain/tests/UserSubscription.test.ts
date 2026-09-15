import { describe, expect, it } from 'vitest';
import { UserSubscription } from '../src/entities/UserSubscription.js';
import { FreeQuotaExceededError } from '../src/errors/DomainErrors.js';
import { UserId } from '../src/value-objects/UserId.js';

describe('UserSubscription Entity', () => {
  const userId = new UserId('usr_12345678-1234-1234-1234-123456789012');

  describe('Default Free Subscription', () => {
    it('creates a default free subscription with 0 contracts used and active status', () => {
      const sub = UserSubscription.createDefaultFree(userId);

      expect(sub.userId.value).toBe(userId.value);
      expect(sub.planType).toBe('free');
      expect(sub.status).toBe('active');
      expect(sub.freeContractsUsed).toBe(0);
      expect(sub.remainingFreeQuota()).toBe(3);
      expect(sub.canGenerateContract()).toBe(true);
      expect(sub.canInitiateCheckout()).toBe(true);
      expect(sub.expiresAt).toBeNull();
      expect(sub.currentPeriodBillingCycle).toBeNull();
    });

    it('allows consuming up to 3 free contracts', () => {
      let sub = UserSubscription.createDefaultFree(userId);

      sub = sub.consumeFreeContract();
      expect(sub.freeContractsUsed).toBe(1);
      expect(sub.remainingFreeQuota()).toBe(2);
      expect(sub.canGenerateContract()).toBe(true);

      sub = sub.consumeFreeContract();
      expect(sub.freeContractsUsed).toBe(2);
      expect(sub.remainingFreeQuota()).toBe(1);
      expect(sub.canGenerateContract()).toBe(true);

      sub = sub.consumeFreeContract();
      expect(sub.freeContractsUsed).toBe(3);
      expect(sub.remainingFreeQuota()).toBe(0);
      expect(sub.canGenerateContract()).toBe(false);
    });

    it('throws FreeQuotaExceededError when consuming beyond 3 contracts', () => {
      let sub = UserSubscription.createDefaultFree(userId);
      sub = sub.consumeFreeContract();
      sub = sub.consumeFreeContract();
      sub = sub.consumeFreeContract();

      expect(() => sub.consumeFreeContract()).toThrow(FreeQuotaExceededError);
    });
  });

  describe('Plan Pro Entitlements & Lifecycle', () => {
    it('activates Pro plan for monthly cycle and resets expiration date', () => {
      const freeSub = UserSubscription.createDefaultFree(userId);
      const usedSub = freeSub.consumeFreeContract(); // 1 used

      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const proSub = usedSub.activatePro('monthly', expiresAt, 'tx_abc123');

      expect(proSub.planType).toBe('pro');
      expect(proSub.status).toBe('active');
      expect(proSub.currentPeriodBillingCycle).toBe('monthly');
      expect(proSub.expiresAt).toEqual(expiresAt);
      expect(proSub.lastPaymentTransactionId).toBe('tx_abc123');
      expect(proSub.canGenerateContract()).toBe(true);
      // Lifetime quota count is preserved
      expect(proSub.freeContractsUsed).toBe(1);
      // Active Pro users cannot initiate new checkout (duplicate guard)
      expect(proSub.canInitiateCheckout()).toBe(false);
    });

    it('handles expiration lifecycle: reverts expired Pro to free tier preserving lifetime count', () => {
      const pastDate = new Date(Date.now() - 1000);
      const proSub = UserSubscription.reconstitute({
        id: 'sub_123',
        userId,
        planType: 'pro',
        status: 'active',
        freeContractsUsed: 3,
        startedAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000),
        expiresAt: pastDate,
        currentPeriodBillingCycle: 'monthly',
        lastPaymentTransactionId: 'tx_old',
      });

      expect(proSub.isExpired()).toBe(true);
      expect(proSub.canGenerateContract()).toBe(false); // Expired and used 3/3
      expect(proSub.canInitiateCheckout()).toBe(true); // Can re-subscribe!

      const revertedSub = proSub.revertToExpired();
      expect(revertedSub.planType).toBe('free');
      expect(revertedSub.status).toBe('expired');
      expect(revertedSub.freeContractsUsed).toBe(3);
      expect(revertedSub.canGenerateContract()).toBe(false);
      expect(revertedSub.canInitiateCheckout()).toBe(true);
    });

    it('does not expire if expiresAt is in the future', () => {
      const futureDate = new Date(Date.now() + 100000);
      const proSub = UserSubscription.reconstitute({
        id: 'sub_123',
        userId,
        planType: 'pro',
        status: 'active',
        freeContractsUsed: 3,
        startedAt: new Date(),
        expiresAt: futureDate,
        currentPeriodBillingCycle: 'annual',
        lastPaymentTransactionId: 'tx_new',
      });

      expect(proSub.isExpired()).toBe(false);
      expect(proSub.canGenerateContract()).toBe(true);
      expect(proSub.canInitiateCheckout()).toBe(false);
    });
  });
});
