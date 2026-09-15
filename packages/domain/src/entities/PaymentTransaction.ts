/**
 * @file PaymentTransaction.ts
 * @description Domain entity representing a financial transaction attempt through a payment gateway.
 */

import type { UserId } from '../value-objects/UserId.js';
import type { PaymentProviderId } from './PaymentProviderInfo.js';
import type { BillingCycle } from './PricingConfig.js';

export type PaymentStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'rejected_duplicate'
  | 'expired'
  | 'flagged_mismatch';

export interface PaymentTransactionProps {
  readonly id: string;
  readonly userId: UserId;
  readonly providerId: PaymentProviderId;
  readonly reference: string;
  readonly gatewayTransactionId: string | null;
  readonly planId: string;
  readonly billingCycle: BillingCycle;
  readonly amount: number;
  readonly currency: string;
  readonly status: PaymentStatus;
  readonly paymentMethodType: string | null;
  readonly rejectionReason: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class PaymentTransaction {
  private readonly _id: string;
  private readonly _userId: UserId;
  private readonly _providerId: PaymentProviderId;
  private readonly _reference: string;
  private readonly _gatewayTransactionId: string | null;
  private readonly _planId: string;
  private readonly _billingCycle: BillingCycle;
  private readonly _amount: number;
  private readonly _currency: string;
  private readonly _status: PaymentStatus;
  private readonly _paymentMethodType: string | null;
  private readonly _rejectionReason: string | null;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(props: PaymentTransactionProps) {
    this._id = props.id;
    this._userId = props.userId;
    this._providerId = props.providerId;
    this._reference = props.reference;
    this._gatewayTransactionId = props.gatewayTransactionId;
    this._planId = props.planId;
    this._billingCycle = props.billingCycle;
    this._amount = props.amount;
    this._currency = props.currency;
    this._status = props.status;
    this._paymentMethodType = props.paymentMethodType;
    this._rejectionReason = props.rejectionReason;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get id(): string {
    return this._id;
  }

  get userId(): UserId {
    return this._userId;
  }

  get providerId(): PaymentProviderId {
    return this._providerId;
  }

  get reference(): string {
    return this._reference;
  }

  get gatewayTransactionId(): string | null {
    return this._gatewayTransactionId;
  }

  get planId(): string {
    return this._planId;
  }

  get billingCycle(): BillingCycle {
    return this._billingCycle;
  }

  get amount(): number {
    return this._amount;
  }

  get currency(): string {
    return this._currency;
  }

  get status(): PaymentStatus {
    return this._status;
  }

  get paymentMethodType(): string | null {
    return this._paymentMethodType;
  }

  get rejectionReason(): string | null {
    return this._rejectionReason;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  isFinal(): boolean {
    return ['approved', 'rejected', 'rejected_duplicate', 'expired', 'flagged_mismatch'].includes(
      this._status
    );
  }

  markApproved(gatewayTransactionId: string, paymentMethodType?: string): PaymentTransaction {
    return new PaymentTransaction({
      ...this.toProps(),
      status: 'approved',
      gatewayTransactionId,
      paymentMethodType: paymentMethodType ?? this._paymentMethodType,
      updatedAt: new Date(),
    });
  }

  markRejected(
    rejectionReason: string,
    gatewayTransactionId?: string,
    paymentMethodType?: string
  ): PaymentTransaction {
    return new PaymentTransaction({
      ...this.toProps(),
      status: 'rejected',
      rejectionReason,
      gatewayTransactionId: gatewayTransactionId ?? this._gatewayTransactionId,
      paymentMethodType: paymentMethodType ?? this._paymentMethodType,
      updatedAt: new Date(),
    });
  }

  markDuplicate(gatewayTransactionId?: string, rejectionReason?: string): PaymentTransaction {
    return new PaymentTransaction({
      ...this.toProps(),
      status: 'rejected_duplicate',
      gatewayTransactionId: gatewayTransactionId ?? this._gatewayTransactionId,
      rejectionReason: rejectionReason ?? 'Pago duplicado para cliente con suscripción activa',
      updatedAt: new Date(),
    });
  }

  markFlaggedMismatch(reason: string, gatewayTransactionId?: string): PaymentTransaction {
    return new PaymentTransaction({
      ...this.toProps(),
      status: 'flagged_mismatch',
      rejectionReason: reason,
      gatewayTransactionId: gatewayTransactionId ?? this._gatewayTransactionId,
      updatedAt: new Date(),
    });
  }

  markExpired(): PaymentTransaction {
    return new PaymentTransaction({
      ...this.toProps(),
      status: 'expired',
      updatedAt: new Date(),
    });
  }

  toProps(): PaymentTransactionProps {
    return {
      id: this._id,
      userId: this._userId,
      providerId: this._providerId,
      reference: this._reference,
      gatewayTransactionId: this._gatewayTransactionId,
      planId: this._planId,
      billingCycle: this._billingCycle,
      amount: this._amount,
      currency: this._currency,
      status: this._status,
      paymentMethodType: this._paymentMethodType,
      rejectionReason: this._rejectionReason,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  static createPending(input: {
    id?: string;
    userId: UserId;
    providerId: PaymentProviderId;
    reference: string;
    planId: string;
    billingCycle: BillingCycle;
    amount: number;
    currency: string;
  }): PaymentTransaction {
    const now = new Date();
    return new PaymentTransaction({
      id: input.id ?? `tx_${input.reference}`,
      userId: input.userId,
      providerId: input.providerId,
      reference: input.reference,
      gatewayTransactionId: null,
      planId: input.planId,
      billingCycle: input.billingCycle,
      amount: input.amount,
      currency: input.currency,
      status: 'pending',
      paymentMethodType: null,
      rejectionReason: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: PaymentTransactionProps): PaymentTransaction {
    return new PaymentTransaction(props);
  }
}
