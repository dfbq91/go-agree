/**
 * @file PaymentGatewayPort.ts
 * @description Application Port contract for Payment Gateways (Wompi, etc.)
 */

export interface CreateCheckoutInput {
  readonly reference: string;
  readonly amountInCents: number;
  readonly currency: string;
  readonly customerEmail?: string;
  readonly redirectUrl: string;
  readonly planName: string;
}

export interface CreateCheckoutResult {
  readonly checkoutUrl: string;
  readonly reference: string;
  readonly signature: string;
}

export interface WebhookVerificationInput {
  readonly rawBody: string;
  readonly headers: Record<string, string | string[] | undefined>;
  readonly parsedPayload: Record<string, unknown>;
}

export interface ParsedTransactionEvent {
  readonly eventId: string;
  readonly transactionReference: string;
  readonly gatewayTransactionId: string;
  readonly status: 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR' | 'PENDING';
  readonly amountInCents: number;
  readonly currency: string;
  readonly paymentMethodType?: string;
  readonly rejectionReason?: string;
  readonly timestamp: Date;
}

export interface PaymentGatewayPort {
  readonly providerId: string;

  /**
   * Generates the hosted checkout redirect URL and calculates integrity signature.
   */
  createCheckoutUrl(input: CreateCheckoutInput): Promise<CreateCheckoutResult>;

  /**
   * Verifies the cryptographic integrity/checksum of an incoming webhook.
   */
  verifyWebhookSignature(input: WebhookVerificationInput): boolean;

  /**
   * Normalizes gateway-specific webhook payload into a standardized domain event.
   */
  parseWebhookEvent(input: WebhookVerificationInput): ParsedTransactionEvent;

  /**
   * Direct API query for current transaction status from the gateway (fallback).
   */
  getTransactionStatus(gatewayTransactionId: string): Promise<ParsedTransactionEvent>;
}
