/**
 * @file GetSubscriptionStatusUseCase.ts
 * @description Retrieves the current subscription, plan tier, and remaining free quota for a user.
 */

import type { SubscriptionRepositoryPort } from '../ports/SubscriptionRepositoryPort.js';
import { UserSubscription, UserId, FREE_CONTRACT_LIMIT } from '@go-agree/domain';

export interface GetSubscriptionStatusInput {
  readonly userId: string;
}

export interface SubscriptionStatusResult {
  readonly planType: 'free' | 'pro';
  readonly status: 'active' | 'expired';
  readonly freeContractsUsed: number;
  readonly freeContractsLimit: number;
  readonly remainingQuota: number;
  readonly canGenerateContract: boolean;
  readonly canInitiateCheckout: boolean;
  readonly expiresAt: string | null;
  readonly currentPeriodBillingCycle: 'monthly' | 'annual' | null;
}

export class GetSubscriptionStatusUseCase {
  constructor(private readonly subscriptionRepo: SubscriptionRepositoryPort) {}

  async execute(input: GetSubscriptionStatusInput): Promise<SubscriptionStatusResult> {
    const dto = await this.subscriptionRepo.getByUserId(input.userId);

    const subscription = UserSubscription.reconstitute({
      id: dto.id,
      userId: new UserId(dto.userId),
      planType: dto.planType,
      status: dto.status,
      freeContractsUsed: dto.freeContractsUsed,
      startedAt: new Date(dto.startedAt),
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      currentPeriodBillingCycle: dto.currentPeriodBillingCycle,
      lastPaymentTransactionId: dto.lastPaymentTransactionId,
    });

    return {
      planType: subscription.planType,
      status: subscription.status,
      freeContractsUsed: subscription.freeContractsUsed,
      freeContractsLimit: subscription.freeContractsLimit,
      remainingQuota: subscription.remainingFreeQuota(),
      canGenerateContract: subscription.canGenerateContract(),
      canInitiateCheckout: subscription.canInitiateCheckout(),
      expiresAt: dto.expiresAt,
      currentPeriodBillingCycle: dto.currentPeriodBillingCycle,
    };
  }
}
