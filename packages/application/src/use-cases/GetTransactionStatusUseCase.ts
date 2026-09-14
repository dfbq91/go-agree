/**
 * @file GetTransactionStatusUseCase.ts
 * @description Retrieves current status and diagnostics of a payment transaction.
 */

import type { PaymentRepositoryPort } from '../ports/PaymentRepositoryPort.js';
import type { PaymentStatus } from '@go-agree/domain';

export interface GetTransactionStatusInput {
  readonly reference: string;
  readonly userId?: string;
}

export interface TransactionStatusResult {
  readonly id: string;
  readonly reference: string;
  readonly status: PaymentStatus;
  readonly planId: string;
  readonly billingCycle: 'monthly' | 'annual';
  readonly amount: number;
  readonly currency: string;
  readonly providerId: string;
  readonly paymentMethodType: string | null;
  readonly rejectionReason: string | null;
  readonly updatedAt: string;
}

export class GetTransactionStatusUseCase {
  constructor(private readonly paymentRepo: PaymentRepositoryPort) {}

  async execute(input: GetTransactionStatusInput): Promise<TransactionStatusResult | null> {
    const tx = await this.paymentRepo.getTransactionByReference(input.reference);
    if (!tx) {
      return null;
    }

    // Tenant isolation: if userId provided, verify ownership
    if (input.userId && tx.userId !== input.userId) {
      return null;
    }

    return {
      id: tx.id,
      reference: tx.reference,
      status: tx.status,
      planId: tx.planId,
      billingCycle: tx.billingCycle,
      amount: tx.amount,
      currency: tx.currency,
      providerId: tx.providerId,
      paymentMethodType: tx.paymentMethodType,
      rejectionReason: tx.rejectionReason,
      updatedAt: tx.updatedAt,
    };
  }
}
