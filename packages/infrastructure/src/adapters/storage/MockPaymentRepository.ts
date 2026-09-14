/**
 * @file MockPaymentRepository.ts
 * @description In-memory mock implementation of PaymentRepositoryPort for tests.
 */

import type {
  PaymentRepositoryPort,
  PaymentTransactionDTO,
  PaymentWebhookEventDTO,
} from '@go-agree/application';

export class MockPaymentRepository implements PaymentRepositoryPort {
  private transactions: Map<string, PaymentTransactionDTO> = new Map();
  private webhookEvents: Map<string, PaymentWebhookEventDTO> = new Map();

  async createTransaction(
    transaction: Omit<PaymentTransactionDTO, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PaymentTransactionDTO> {
    const now = new Date().toISOString();
    const created: PaymentTransactionDTO = {
      ...transaction,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };
    this.transactions.set(created.reference, created);
    return { ...created };
  }

  async getTransactionByReference(reference: string): Promise<PaymentTransactionDTO | null> {
    let tx = this.transactions.get(reference);
    if (!tx) {
      for (const item of this.transactions.values()) {
        if (item.gatewayTransactionId === reference) {
          tx = item;
          break;
        }
      }
    }
    return tx ? { ...tx } : null;
  }

  async updateTransactionStatus(
    reference: string,
    status: PaymentTransactionDTO['status'],
    gatewayTransactionId?: string,
    paymentMethodType?: string,
    rejectionReason?: string
  ): Promise<void> {
    const tx = this.transactions.get(reference);
    if (!tx) {
      throw new Error(`Transaction with reference ${reference} not found`);
    }

    const updated: PaymentTransactionDTO = {
      ...tx,
      status,
      gatewayTransactionId: gatewayTransactionId ?? tx.gatewayTransactionId,
      paymentMethodType: paymentMethodType ?? tx.paymentMethodType,
      rejectionReason: rejectionReason ?? tx.rejectionReason,
      updatedAt: new Date().toISOString(),
    };

    this.transactions.set(reference, updated);
  }

  async hasWebhookEvent(eventId: string): Promise<boolean> {
    return this.webhookEvents.has(eventId);
  }

  async recordWebhookEvent(
    event: Omit<PaymentWebhookEventDTO, 'id' | 'processedAt'>
  ): Promise<void> {
    const now = new Date().toISOString();
    const created: PaymentWebhookEventDTO = {
      ...event,
      id: `evt_${Date.now()}`,
      processedAt: now,
    };
    this.webhookEvents.set(event.eventId, created);
  }
}
