/**
 * @file ProcessPaymentWebhookUseCase.ts
 * @description Processes incoming payment gateway webhook events, enforcing cryptographic checksum verification, strict idempotency, amount matching, and duplicate payment rejection.
 */

import { PaymentTamperError, UserId, UserSubscription } from '@go-agree/domain';
import type { LoggerPort } from '../ports/LoggerPort.js';
import type { PaymentGatewayPort } from '../ports/PaymentGatewayPort.js';
import type { PaymentRepositoryPort } from '../ports/PaymentRepositoryPort.js';
import type { SubscriptionRepositoryPort } from '../ports/SubscriptionRepositoryPort.js';

export interface ProcessPaymentWebhookInput {
  readonly providerId: string;
  readonly rawBody: string;
  readonly headers: Record<string, string | string[] | undefined>;
  readonly parsedPayload: Record<string, unknown>;
}

export interface ProcessPaymentWebhookResult {
  readonly status: 'processed' | 'ignored_duplicate' | 'failed_verification' | 'flagged_mismatch';
  readonly message?: string;
  readonly transactionReference?: string;
  readonly planActivated?: boolean;
}

export class ProcessPaymentWebhookUseCase {
  constructor(
    private readonly subscriptionRepo: SubscriptionRepositoryPort,
    private readonly paymentRepo: PaymentRepositoryPort,
    private readonly gatewayResolver: (providerId: string) => PaymentGatewayPort,
    private readonly logger?: LoggerPort
  ) {}

  async execute(input: ProcessPaymentWebhookInput): Promise<ProcessPaymentWebhookResult> {
    const gateway = this.gatewayResolver(input.providerId);

    // 1. Verify cryptographic checksum/signature
    const isValid = gateway.verifyWebhookSignature({
      rawBody: input.rawBody,
      headers: input.headers,
      parsedPayload: input.parsedPayload,
    });

    if (!isValid) {
      const failedEventId = `failed_verification_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      this.logger?.error('SECURITY ALERT: Webhook cryptographic checksum verification failed', {
        providerId: input.providerId,
        failedEventId,
      });
      await this.paymentRepo.recordWebhookEvent({
        eventId: failedEventId,
        providerId: input.providerId,
        transactionReference: 'unknown',
        eventType: 'verification_failed',
        payload: input.parsedPayload,
        checksum: 'invalid',
        status: 'failed_verification',
      });

      throw new PaymentTamperError('Firma criptográfica inválida en el webhook');
    }

    // 2. Standardize event payload
    const event = gateway.parseWebhookEvent({
      rawBody: input.rawBody,
      headers: input.headers,
      parsedPayload: input.parsedPayload,
    });

    // 3. Strict Idempotency check
    const isAlreadyProcessed = await this.paymentRepo.hasWebhookEvent(event.eventId);
    if (isAlreadyProcessed) {
      this.logger?.debug('Duplicate webhook event ignored (already processed)', {
        eventId: event.eventId,
        transactionReference: event.transactionReference,
      });
      return {
        status: 'ignored_duplicate',
        message: 'Evento ya procesado previamente',
        transactionReference: event.transactionReference,
        planActivated: false,
      };
    }

    // 4. Retrieve matching transaction
    const tx = await this.paymentRepo.getTransactionByReference(event.transactionReference);
    if (!tx) {
      this.logger?.warn('Webhook received for unknown transaction reference', {
        eventId: event.eventId,
        transactionReference: event.transactionReference,
      });
      await this.paymentRepo.recordWebhookEvent({
        eventId: event.eventId,
        providerId: input.providerId,
        transactionReference: event.transactionReference,
        eventType: 'transaction.updated',
        payload: input.parsedPayload,
        checksum: 'valid',
        status: 'processed',
      });

      return {
        status: 'processed',
        message: `Transacción no encontrada para referencia: ${event.transactionReference}`,
        transactionReference: event.transactionReference,
        planActivated: false,
      };
    }

    // 5. Amount and Currency validation
    if (tx.amount !== event.amountInCents || tx.currency !== event.currency) {
      this.logger?.error('FINANCIAL ALERT: Transaction amount or currency mismatch', {
        reference: tx.reference,
        expectedAmount: tx.amount,
        receivedAmount: event.amountInCents,
        expectedCurrency: tx.currency,
        receivedCurrency: event.currency,
      });
      await this.paymentRepo.updateTransactionStatus(
        tx.reference,
        'flagged_mismatch',
        event.gatewayTransactionId,
        event.paymentMethodType,
        `Discrepancia en monto o moneda: Esperado ${tx.amount} ${tx.currency}, recibido ${event.amountInCents} ${event.currency}`
      );

      await this.paymentRepo.recordWebhookEvent({
        eventId: event.eventId,
        providerId: input.providerId,
        transactionReference: event.transactionReference,
        eventType: 'transaction.updated',
        payload: input.parsedPayload,
        checksum: 'valid',
        status: 'flagged_mismatch',
      });

      return {
        status: 'flagged_mismatch',
        message: 'Monto o moneda recibido no coincide con el registro original',
        transactionReference: event.transactionReference,
        planActivated: false,
      };
    }

    // 6. Handle payment status
    if (event.status === 'APPROVED') {
      // Check duplicate payment policy: If client already has active Pro plan
      const subDTO = await this.subscriptionRepo.getByUserId(tx.userId);
      const currentSub = UserSubscription.reconstitute({
        id: subDTO.id,
        userId: new UserId(subDTO.userId),
        planType: subDTO.planType,
        status: subDTO.status,
        freeContractsUsed: subDTO.freeContractsUsed,
        startedAt: new Date(subDTO.startedAt),
        expiresAt: subDTO.expiresAt ? new Date(subDTO.expiresAt) : null,
        currentPeriodBillingCycle: subDTO.currentPeriodBillingCycle,
        lastPaymentTransactionId: subDTO.lastPaymentTransactionId,
      });

      if (
        currentSub.planType === 'pro' &&
        !currentSub.isExpired() &&
        currentSub.lastPaymentTransactionId !== tx.id
      ) {
        this.logger?.warn('Duplicate payment rejected for active Pro subscriber', {
          userId: tx.userId,
          reference: tx.reference,
          lastPaymentTransactionId: currentSub.lastPaymentTransactionId,
        });
        // Reject duplicate payment and mark for refund/reconciliation
        await this.paymentRepo.updateTransactionStatus(
          tx.reference,
          'rejected_duplicate',
          event.gatewayTransactionId,
          event.paymentMethodType,
          'Pago duplicado: el usuario ya cuenta con una suscripción activa a Plan Pro'
        );

        await this.paymentRepo.recordWebhookEvent({
          eventId: event.eventId,
          providerId: input.providerId,
          transactionReference: event.transactionReference,
          eventType: 'transaction.updated',
          payload: input.parsedPayload,
          checksum: 'valid',
          status: 'ignored_duplicate',
        });

        return {
          status: 'processed',
          message: 'Pago identificado como duplicado y rechazado',
          transactionReference: event.transactionReference,
          planActivated: false,
        };
      }

      // Calculate expiration date (30 days for monthly, 365 days for annual)
      const durationDays = tx.billingCycle === 'annual' ? 365 : 30;
      const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

      // Approve transaction
      await this.paymentRepo.updateTransactionStatus(
        tx.reference,
        'approved',
        event.gatewayTransactionId,
        event.paymentMethodType
      );

      // Activate Pro subscription
      await this.subscriptionRepo.activateProPlan(tx.userId, tx.billingCycle, expiresAt, tx.id);

      this.logger?.info('Payment approved and Pro plan activated successfully', {
        userId: tx.userId,
        reference: tx.reference,
        billingCycle: tx.billingCycle,
        expiresAt: expiresAt.toISOString(),
      });

      // Record idempotency receipt
      await this.paymentRepo.recordWebhookEvent({
        eventId: event.eventId,
        providerId: input.providerId,
        transactionReference: event.transactionReference,
        eventType: 'transaction.updated',
        payload: input.parsedPayload,
        checksum: 'valid',
        status: 'processed',
      });

      return {
        status: 'processed',
        message: 'Plan Pro activado exitosamente',
        transactionReference: event.transactionReference,
        planActivated: true,
      };
    }

    if (event.status === 'DECLINED' || event.status === 'ERROR' || event.status === 'VOIDED') {
      this.logger?.warn('Payment transaction rejected by gateway', {
        reference: tx.reference,
        gatewayTransactionId: event.gatewayTransactionId,
        rejectionReason: event.rejectionReason,
      });
      await this.paymentRepo.updateTransactionStatus(
        tx.reference,
        'rejected',
        event.gatewayTransactionId,
        event.paymentMethodType,
        event.rejectionReason || 'Transacción declinada'
      );

      await this.paymentRepo.recordWebhookEvent({
        eventId: event.eventId,
        providerId: input.providerId,
        transactionReference: event.transactionReference,
        eventType: 'transaction.updated',
        payload: input.parsedPayload,
        checksum: 'valid',
        status: 'processed',
      });

      return {
        status: 'processed',
        message: 'Transacción rechazada',
        transactionReference: event.transactionReference,
        planActivated: false,
      };
    }

    // Pending or other intermediate status
    this.logger?.info('Payment transaction in pending state', {
      reference: tx.reference,
      gatewayTransactionId: event.gatewayTransactionId,
      status: event.status,
    });
    await this.paymentRepo.recordWebhookEvent({
      eventId: event.eventId,
      providerId: input.providerId,
      transactionReference: event.transactionReference,
      eventType: 'transaction.updated',
      payload: input.parsedPayload,
      checksum: 'valid',
      status: 'processed',
    });

    return {
      status: 'processed',
      message: 'Transacción en estado pendiente',
      transactionReference: event.transactionReference,
      planActivated: false,
    };
  }
}
