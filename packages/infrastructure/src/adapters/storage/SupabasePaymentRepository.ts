/**
 * @file SupabasePaymentRepository.ts
 * @description Supabase implementation of PaymentRepositoryPort.
 */

import type {
  LoggerPort,
  PaymentRepositoryPort,
  PaymentTransactionDTO,
  PaymentWebhookEventDTO,
} from '@go-agree/application';
import type { SupabaseClient } from '@supabase/supabase-js';

interface PaymentTransactionRow {
  id: string;
  user_id: string;
  provider_id: string;
  reference: string;
  gateway_transaction_id: string | null;
  plan_id: string;
  billing_cycle: 'monthly' | 'annual';
  amount: number;
  currency: string;
  status: PaymentTransactionDTO['status'];
  payment_method_type: string | null;
  rejection_reason: string | null;
  redirect_url?: string | null;
  created_at: string;
  updated_at: string;
}

export class SupabasePaymentRepository implements PaymentRepositoryPort {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly logger?: LoggerPort
  ) {}

  private mapRowToDTO(row: PaymentTransactionRow): PaymentTransactionDTO {
    return {
      id: row.id,
      userId: row.user_id,
      providerId: row.provider_id,
      reference: row.reference,
      gatewayTransactionId: row.gateway_transaction_id,
      planId: row.plan_id,
      billingCycle: row.billing_cycle,
      amount: row.amount,
      currency: row.currency,
      status: row.status,
      paymentMethodType: row.payment_method_type,
      rejectionReason: row.rejection_reason,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async createTransaction(
    transaction: Omit<PaymentTransactionDTO, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PaymentTransactionDTO> {
    const { data, error } = await this.supabase
      .from('payment_transactions')
      .insert({
        user_id: transaction.userId,
        provider_id: transaction.providerId,
        reference: transaction.reference,
        gateway_transaction_id: transaction.gatewayTransactionId,
        plan_id: transaction.planId,
        billing_cycle: transaction.billingCycle,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        payment_method_type: transaction.paymentMethodType,
        rejection_reason: transaction.rejectionReason,
      })
      .select('*')
      .single();

    if (error || !data) {
      this.logger?.error('Supabase insert failed on payment_transactions.create', {
        reference: transaction.reference,
        userId: transaction.userId,
        error: error?.message,
        code: error?.code,
      });
      throw new Error(`Failed to create payment transaction: ${error?.message}`);
    }

    return this.mapRowToDTO(data as PaymentTransactionRow);
  }

  async getTransactionByReference(reference: string): Promise<PaymentTransactionDTO | null> {
    const { data, error } = await this.supabase
      .from('payment_transactions')
      .select('*')
      .or(`reference.eq.${reference},gateway_transaction_id.eq.${reference}`)
      .maybeSingle();

    if (error) {
      this.logger?.error('Supabase query failed on payment_transactions.getByReference', {
        reference,
        error: error.message,
        code: error.code,
      });
      return null;
    }

    if (!data) {
      return null;
    }

    return this.mapRowToDTO(data as PaymentTransactionRow);
  }

  async updateTransactionStatus(
    reference: string,
    status: PaymentTransactionDTO['status'],
    gatewayTransactionId?: string,
    paymentMethodType?: string,
    rejectionReason?: string
  ): Promise<void> {
    const updatePayload: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (gatewayTransactionId !== undefined) {
      updatePayload.gateway_transaction_id = gatewayTransactionId;
    }
    if (paymentMethodType !== undefined) {
      updatePayload.payment_method_type = paymentMethodType;
    }
    if (rejectionReason !== undefined) {
      updatePayload.rejection_reason = rejectionReason;
    }

    const { error } = await this.supabase
      .from('payment_transactions')
      .update(updatePayload)
      .eq('reference', reference);

    if (error) {
      this.logger?.error('Supabase update failed on payment_transactions.updateStatus', {
        reference,
        status,
        error: error.message,
        code: error.code,
      });
      throw new Error(`Failed to update transaction ${reference}: ${error.message}`);
    }
  }

  async hasWebhookEvent(eventId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('payment_webhook_events')
      .select('id')
      .eq('event_id', eventId)
      .maybeSingle();

    if (error) {
      this.logger?.error('Supabase query failed on payment_webhook_events.hasWebhookEvent', {
        eventId,
        error: error.message,
        code: error.code,
      });
      return false;
    }

    if (!data) {
      return false;
    }

    return true;
  }

  async recordWebhookEvent(
    event: Omit<PaymentWebhookEventDTO, 'id' | 'processedAt'>
  ): Promise<void> {
    const { error } = await this.supabase.from('payment_webhook_events').insert({
      event_id: event.eventId,
      provider_id: event.providerId,
      transaction_reference: event.transactionReference,
      event_type: event.eventType,
      payload: event.payload,
      checksum: event.checksum,
      status: event.status,
    });

    if (error) {
      this.logger?.error('Supabase insert failed on payment_webhook_events.record', {
        eventId: event.eventId,
        transactionReference: event.transactionReference,
        error: error.message,
        code: error.code,
      });
      throw new Error(`Failed to record webhook event ${event.eventId}: ${error.message}`);
    }
  }
}
