/**
 * @file WompiPaymentGatewayAdapter.ts
 * @description Wompi payment gateway adapter supporting checkout URL generation, signature calculation, and webhook verification.
 */

import { createHash } from 'crypto';
import type {
  PaymentGatewayPort,
  CreateCheckoutInput,
  CreateCheckoutResult,
  WebhookVerificationInput,
  ParsedTransactionEvent,
} from '@go-agree/application';

export interface WompiGatewayConfig {
  readonly publicKey: string;
  readonly privateKey?: string;
  readonly integritySecret: string;
  readonly eventsSecret: string;
  readonly checkoutBaseUrl?: string;
  readonly apiBaseUrl?: string;
}

export class WompiPaymentGatewayAdapter implements PaymentGatewayPort {
  readonly providerId = 'wompi';
  private readonly publicKey: string;
  private readonly privateKey?: string;
  private readonly integritySecret: string;
  private readonly eventsSecret: string;
  private readonly checkoutBaseUrl: string;
  private readonly apiBaseUrl: string;

  constructor(config: WompiGatewayConfig) {
    this.publicKey = config.publicKey;
    this.privateKey = config.privateKey;
    this.integritySecret = config.integritySecret;
    this.eventsSecret = config.eventsSecret;
    this.checkoutBaseUrl = config.checkoutBaseUrl ?? 'https://checkout.wompi.co/p/';
    this.apiBaseUrl = config.apiBaseUrl ?? 'https://production.wompi.co/v1';
  }

  /**
   * Generates the hosted checkout redirect URL and calculates SHA-256 integrity signature.
   * Formula: SHA256(reference + amountInCents + currency + integritySecret)
   */
  async createCheckoutUrl(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
    const rawSignatureString = `${input.reference}${input.amountInCents}${input.currency}${this.integritySecret}`;
    const signature = createHash('sha256').update(rawSignatureString).digest('hex');

    const url = new URL(this.checkoutBaseUrl);
    url.searchParams.set('public-key', this.publicKey);
    url.searchParams.set('currency', input.currency);
    url.searchParams.set('amount-in-cents', input.amountInCents.toString());
    url.searchParams.set('reference', input.reference);
    url.searchParams.set('signature:integrity', signature);
    url.searchParams.set('redirect-url', input.redirectUrl);
    if (input.customerEmail) {
      url.searchParams.set('customer-data:email', input.customerEmail);
    }

    return {
      checkoutUrl: url.toString(),
      reference: input.reference,
      signature,
    };
  }

  /**
   * Verifies the cryptographic integrity/checksum of an incoming webhook from Wompi.
   * Concatenates properties in signature.properties + timestamp + eventsSecret.
   */
  verifyWebhookSignature(input: WebhookVerificationInput): boolean {
    const payload = input.parsedPayload as any;
    if (!payload || !payload.signature || !payload.signature.checksum || !payload.signature.properties) {
      return false;
    }

    const properties: string[] = payload.signature.properties;
    const providedChecksum: string = payload.signature.checksum;
    const timestamp = payload.timestamp;

    let concatValues = '';
    for (const prop of properties) {
      const parts = prop.split('.');
      let val = payload.data;
      for (const part of parts) {
        val = val?.[part];
      }
      if (val !== undefined && val !== null) {
        concatValues += val.toString();
      }
    }

    concatValues += `${timestamp}${this.eventsSecret}`;
    const calculatedChecksum = createHash('sha256').update(concatValues).digest('hex');

    return calculatedChecksum.toLowerCase() === providedChecksum.toLowerCase();
  }

  /**
   * Normalizes Wompi-specific webhook payload into a standardized domain event.
   */
  parseWebhookEvent(input: WebhookVerificationInput): ParsedTransactionEvent {
    const payload = input.parsedPayload as any;
    const tx = payload?.data?.transaction;
    const timestampRaw = payload?.timestamp;
    const timestamp = timestampRaw ? new Date(timestampRaw * 1000) : new Date();

    return {
      eventId: `${tx?.id || 'unknown'}_${timestampRaw || Date.now()}`,
      transactionReference: tx?.reference || '',
      gatewayTransactionId: tx?.id || '',
      status: (tx?.status as any) || 'PENDING',
      amountInCents: tx?.amount_in_cents ?? 0,
      currency: tx?.currency || 'COP',
      paymentMethodType: tx?.payment_method_type,
      rejectionReason: tx?.status_message,
      timestamp,
    };
  }

  /**
   * Direct API query for current transaction status from Wompi (fallback query).
   */
  async getTransactionStatus(gatewayTransactionId: string): Promise<ParsedTransactionEvent> {
    const response = await fetch(`${this.apiBaseUrl}/transactions/${gatewayTransactionId}`, {
      headers: {
        Authorization: `Bearer ${this.privateKey || this.publicKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Wompi API returned ${response.status} for transaction ${gatewayTransactionId}`);
    }

    const json = await response.json();
    const tx = json.data;

    return {
      eventId: `${tx.id}_status_query`,
      transactionReference: tx.reference,
      gatewayTransactionId: tx.id,
      status: tx.status,
      amountInCents: tx.amount_in_cents,
      currency: tx.currency,
      paymentMethodType: tx.payment_method_type,
      rejectionReason: tx.status_message,
      timestamp: new Date(tx.created_at || Date.now()),
    };
  }
}
