/**
 * @file ConsumeContractQuotaUseCase.ts
 * @description Validates and increments the free contract generation quota for a user.
 */

import { FreeQuotaExceededError, UserId, UserSubscription } from '@go-agree/domain';
import type { LoggerPort } from '../ports/LoggerPort.js';
import type { SubscriptionRepositoryPort } from '../ports/SubscriptionRepositoryPort.js';

export interface ConsumeContractQuotaInput {
  readonly userId: string;
}

export interface ConsumeContractQuotaResult {
  readonly freeContractsUsed: number;
  readonly remainingQuota: number;
  readonly canGenerateContract: boolean;
}

export class ConsumeContractQuotaUseCase {
  constructor(
    private readonly subscriptionRepo: SubscriptionRepositoryPort,
    private readonly logger?: LoggerPort
  ) {}

  async execute(input: ConsumeContractQuotaInput): Promise<ConsumeContractQuotaResult> {
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

    // Active Pro plan users have unlimited contract generations
    if (subscription.planType === 'pro' && !subscription.isExpired()) {
      this.logger?.debug('Contract quota verified for Pro subscriber (unlimited)', {
        userId: input.userId,
      });
      return {
        freeContractsUsed: subscription.freeContractsUsed,
        remainingQuota: 9999,
        canGenerateContract: true,
      };
    }

    // Free plan users must have remaining quota
    if (!subscription.canGenerateContract()) {
      this.logger?.warn('Contract quota consumption blocked: free limit reached', {
        userId: input.userId,
        freeContractsLimit: subscription.freeContractsLimit,
      });
      throw new FreeQuotaExceededError(subscription.freeContractsLimit);
    }

    const updatedCount = await this.subscriptionRepo.incrementFreeContractCount(input.userId);
    const updatedSubscription = subscription.consumeFreeContract();

    this.logger?.info('Contract quota consumed', {
      userId: input.userId,
      freeContractsUsed: updatedCount,
      remainingQuota: updatedSubscription.remainingFreeQuota(),
    });

    return {
      freeContractsUsed: updatedCount,
      remainingQuota: updatedSubscription.remainingFreeQuota(),
      canGenerateContract: updatedSubscription.canGenerateContract(),
    };
  }
}
