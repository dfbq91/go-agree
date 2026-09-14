/**
 * @file subscription-repository.contract.ts
 * @description Application Port contract for User Subscription & Quota persistence.
 */

export interface UserSubscriptionDTO {
  readonly id: string;
  readonly userId: string;
  readonly planType: 'free' | 'pro';
  readonly status: 'active' | 'expired';
  readonly freeContractsUsed: number;
  readonly startedAt: string;
  readonly expiresAt: string | null;
  readonly currentPeriodBillingCycle: 'monthly' | 'annual' | null;
  readonly lastPaymentTransactionId: string | null;
}

export interface SubscriptionRepositoryPort {
  /**
   * Retrieves or initializes default Free subscription for a user.
   */
  getByUserId(userId: string): Promise<UserSubscriptionDTO>;

  /**
   * Saves updated subscription state.
   */
  save(subscription: UserSubscriptionDTO): Promise<void>;

  /**
   * Increments the user's lifetime free contract generation counter (up to 3).
   */
  incrementFreeContractCount(userId: string): Promise<number>;

  /**
   * Upgrades user to Plan Pro with an expiration date.
   */
  activateProPlan(
    userId: string,
    billingCycle: 'monthly' | 'annual',
    expiresAt: Date,
    transactionId: string
  ): Promise<void>;

  /**
   * Reverts expired Pro subscriptions back to the Free plan.
   */
  expireSubscriptions(now?: Date): Promise<number>;
}
