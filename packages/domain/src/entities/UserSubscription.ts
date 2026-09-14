/**
 * @file UserSubscription.ts
 * @description Aggregate root representing a user's subscription, entitlement, and free contract quota.
 */

import { UserId } from '../value-objects/UserId.js';
import type { BillingCycle } from './PricingConfig.js';
import { FreeQuotaExceededError } from '../errors/DomainErrors.js';
import {
  DEFAULT_FREE_CONTRACT_LIMIT,
  getFreeContractLimit,
} from './FreeQuotaConfig.js';

export { DEFAULT_FREE_CONTRACT_LIMIT, getFreeContractLimit };

export type PlanType = 'free' | 'pro';
export type SubscriptionStatus = 'active' | 'expired';

export interface UserSubscriptionProps {
  readonly id: string;
  readonly userId: UserId;
  readonly planType: PlanType;
  readonly status: SubscriptionStatus;
  readonly freeContractsUsed: number;
  readonly freeContractsLimit?: number;
  readonly startedAt: Date;
  readonly expiresAt: Date | null;
  readonly currentPeriodBillingCycle: BillingCycle | null;
  readonly lastPaymentTransactionId: string | null;
}

export const FREE_CONTRACT_LIMIT = getFreeContractLimit();

export class UserSubscription {
  private readonly _id: string;
  private readonly _userId: UserId;
  private readonly _planType: PlanType;
  private readonly _status: SubscriptionStatus;
  private readonly _freeContractsUsed: number;
  private readonly _freeContractsLimit: number;
  private readonly _startedAt: Date;
  private readonly _expiresAt: Date | null;
  private readonly _currentPeriodBillingCycle: BillingCycle | null;
  private readonly _lastPaymentTransactionId: string | null;

  constructor(props: UserSubscriptionProps) {
    this._id = props.id;
    this._userId = props.userId;
    this._planType = props.planType;
    this._status = props.status;
    this._freeContractsUsed = Math.max(0, props.freeContractsUsed);
    this._freeContractsLimit = props.freeContractsLimit ?? getFreeContractLimit();
    this._startedAt = props.startedAt;
    this._expiresAt = props.expiresAt;
    this._currentPeriodBillingCycle = props.currentPeriodBillingCycle;
    this._lastPaymentTransactionId = props.lastPaymentTransactionId;
  }

  get id(): string {
    return this._id;
  }

  get userId(): UserId {
    return this._userId;
  }

  get planType(): PlanType {
    return this._planType;
  }

  get status(): SubscriptionStatus {
    return this._status;
  }

  get freeContractsUsed(): number {
    return this._freeContractsUsed;
  }

  get startedAt(): Date {
    return this._startedAt;
  }

  get expiresAt(): Date | null {
    return this._expiresAt;
  }

  get currentPeriodBillingCycle(): BillingCycle | null {
    return this._currentPeriodBillingCycle;
  }

  get lastPaymentTransactionId(): string | null {
    return this._lastPaymentTransactionId;
  }

  get freeContractsLimit(): number {
    return this._freeContractsLimit;
  }

  remainingFreeQuota(): number {
    return Math.max(0, this._freeContractsLimit - this._freeContractsUsed);
  }

  isExpired(now: Date = new Date()): boolean {
    if (this._planType !== 'pro' || !this._expiresAt) {
      return false;
    }
    return now.getTime() >= this._expiresAt.getTime();
  }

  canGenerateContract(now: Date = new Date()): boolean {
    if (this._planType === 'pro' && !this.isExpired(now)) {
      return true;
    }
    return this._freeContractsUsed < this._freeContractsLimit;
  }

  canInitiateCheckout(now: Date = new Date()): boolean {
    if (this._planType === 'pro' && !this.isExpired(now)) {
      return false;
    }
    return true;
  }

  consumeFreeContract(): UserSubscription {
    if (this._freeContractsUsed >= this._freeContractsLimit) {
      throw new FreeQuotaExceededError(this._freeContractsLimit);
    }

    return new UserSubscription({
      id: this._id,
      userId: this._userId,
      planType: this._planType,
      status: this._status,
      freeContractsUsed: this._freeContractsUsed + 1,
      freeContractsLimit: this._freeContractsLimit,
      startedAt: this._startedAt,
      expiresAt: this._expiresAt,
      currentPeriodBillingCycle: this._currentPeriodBillingCycle,
      lastPaymentTransactionId: this._lastPaymentTransactionId,
    });
  }

  activatePro(
    billingCycle: BillingCycle,
    expiresAt: Date,
    transactionId: string
  ): UserSubscription {
    return new UserSubscription({
      id: this._id,
      userId: this._userId,
      planType: 'pro',
      status: 'active',
      freeContractsUsed: this._freeContractsUsed,
      freeContractsLimit: this._freeContractsLimit,
      startedAt: this._startedAt,
      expiresAt,
      currentPeriodBillingCycle: billingCycle,
      lastPaymentTransactionId: transactionId,
    });
  }

  revertToExpired(): UserSubscription {
    return new UserSubscription({
      id: this._id,
      userId: this._userId,
      planType: 'free',
      status: 'expired',
      freeContractsUsed: this._freeContractsUsed,
      freeContractsLimit: this._freeContractsLimit,
      startedAt: this._startedAt,
      expiresAt: this._expiresAt,
      currentPeriodBillingCycle: this._currentPeriodBillingCycle,
      lastPaymentTransactionId: this._lastPaymentTransactionId,
    });
  }

  static createDefaultFree(userId: UserId, freeContractsLimit?: number): UserSubscription {
    return new UserSubscription({
      id: `sub_${userId.value}`,
      userId,
      planType: 'free',
      status: 'active',
      freeContractsUsed: 0,
      freeContractsLimit: freeContractsLimit ?? getFreeContractLimit(),
      startedAt: new Date(),
      expiresAt: null,
      currentPeriodBillingCycle: null,
      lastPaymentTransactionId: null,
    });
  }

  static reconstitute(props: UserSubscriptionProps): UserSubscription {
    return new UserSubscription(props);
  }
}
