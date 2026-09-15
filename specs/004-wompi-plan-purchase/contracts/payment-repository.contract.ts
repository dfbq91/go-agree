/**
 * @file payment-repository.contract.ts
 * @description Application Port contract for Payment Transactions and Webhook Event logs.
 */

export interface PaymentTransactionDTO {
  readonly id: string;
  readonly userId: string;
  readonly providerId: string;
  readonly reference: string;
  readonly gatewayTransactionId: string | null;
  readonly planId: string;
  readonly billingCycle: 'monthly' | 'annual';
  readonly amount: number;
  readonly currency: string;
  readonly status:
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'rejected_duplicate'
    | 'expired'
    | 'flagged_mismatch';
  readonly paymentMethodType: string | null;
  readonly rejectionReason: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface PaymentWebhookEventDTO {
  readonly id: string;
  readonly eventId: string;
  readonly providerId: string;
  readonly transactionReference: string;
  readonly eventType: string;
  readonly payload: Record<string, unknown>;
  readonly checksum: string;
  readonly status: 'processed' | 'ignored_duplicate' | 'failed_verification' | 'flagged_mismatch';
  readonly processedAt: string;
}

export interface PaymentRepositoryPort {
  /**
   * Records an initial pending payment transaction.
   */
  createTransaction(
    transaction: Omit<PaymentTransactionDTO, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PaymentTransactionDTO>;

  /**
   * Retrieves transaction by internal reference.
   */
  getTransactionByReference(reference: string): Promise<PaymentTransactionDTO | null>;

  /**
   * Updates transaction status, gateway ID, and failure diagnostics.
   */
  updateTransactionStatus(
    reference: string,
    status: PaymentTransactionDTO['status'],
    gatewayTransactionId?: string,
    paymentMethodType?: string,
    rejectionReason?: string
  ): Promise<void>;

  /**
   * Checks if an incoming webhook event has already been recorded (idempotency check).
   */
  hasWebhookEvent(eventId: string): Promise<boolean>;

  /**
   * Records a webhook receipt log.
   */
  recordWebhookEvent(event: Omit<PaymentWebhookEventDTO, 'id' | 'processedAt'>): Promise<void>;
}
