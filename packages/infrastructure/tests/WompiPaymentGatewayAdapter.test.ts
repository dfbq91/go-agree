import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { WompiPaymentGatewayAdapter } from '../src/adapters/payment/WompiPaymentGatewayAdapter.js';

describe('WompiPaymentGatewayAdapter', () => {
  const config = {
    publicKey: 'pub_test_12345',
    privateKey: 'prv_test_67890',
    integritySecret: 'test_integrity_secret_abc',
    eventsSecret: 'test_events_secret_xyz',
    checkoutBaseUrl: 'https://checkout.wompi.co/p/',
  };

  const adapter = new WompiPaymentGatewayAdapter(config);

  describe('createCheckoutUrl', () => {
    it('generates the correct checkout URL and SHA-256 integrity signature', async () => {
      const input = {
        reference: 'ga_pro_m_1726156800000_1234',
        amountInCents: 4900000,
        currency: 'COP',
        customerEmail: 'user@example.com',
        redirectUrl: 'https://go-agree.com/checkout/result',
        planName: 'Plan Pro Mensual',
      };

      const expectedSignature = createHash('sha256')
        .update(
          `${input.reference}${input.amountInCents}${input.currency}${config.integritySecret}`
        )
        .digest('hex');

      const result = await adapter.createCheckoutUrl(input);

      expect(result.reference).toBe(input.reference);
      expect(result.signature).toBe(expectedSignature);
      expect(result.checkoutUrl).toContain('https://checkout.wompi.co/p/?');
      expect(result.checkoutUrl).toContain(`public-key=${config.publicKey}`);
      expect(result.checkoutUrl).toContain(`currency=${input.currency}`);
      expect(result.checkoutUrl).toContain(`amount-in-cents=${input.amountInCents}`);
      expect(result.checkoutUrl).toContain(`reference=${input.reference}`);
      expect(result.checkoutUrl).toContain(`signature%3Aintegrity=${expectedSignature}`);
      expect(result.checkoutUrl).toContain(
        `customer-data%3Aemail=${encodeURIComponent(input.customerEmail)}`
      );
    });
  });

  describe('verifyWebhookSignature', () => {
    it('validates a correct Wompi webhook signature', () => {
      const transactionId = '12345-67890';
      const status = 'APPROVED';
      const amountInCents = 4900000;
      const timestamp = 1726156800;

      const rawConcat = `${transactionId}${status}${amountInCents}${timestamp}${config.eventsSecret}`;
      const validChecksum = createHash('sha256').update(rawConcat).digest('hex');

      const payload = {
        event: 'transaction.updated',
        data: {
          transaction: {
            id: transactionId,
            status,
            amount_in_cents: amountInCents,
            reference: 'ga_pro_m_1726156800000_1234',
            currency: 'COP',
            payment_method_type: 'PSE',
          },
        },
        signature: {
          properties: ['transaction.id', 'transaction.status', 'transaction.amount_in_cents'],
          checksum: validChecksum,
        },
        timestamp,
      };

      const isValid = adapter.verifyWebhookSignature({
        rawBody: JSON.stringify(payload),
        headers: {},
        parsedPayload: payload,
      });

      expect(isValid).toBe(true);
    });

    it('rejects a tampered or invalid webhook checksum', () => {
      const payload = {
        event: 'transaction.updated',
        data: {
          transaction: {
            id: 'tx_123',
            status: 'APPROVED',
            amount_in_cents: 4900000,
          },
        },
        signature: {
          properties: ['transaction.id', 'transaction.status', 'transaction.amount_in_cents'],
          checksum: 'invalid_forged_checksum',
        },
        timestamp: 1726156800,
      };

      const isValid = adapter.verifyWebhookSignature({
        rawBody: JSON.stringify(payload),
        headers: {},
        parsedPayload: payload,
      });

      expect(isValid).toBe(false);
    });
  });

  describe('parseWebhookEvent', () => {
    it('parses a webhook payload into standard ParsedTransactionEvent', () => {
      const payload = {
        event: 'transaction.updated',
        data: {
          transaction: {
            id: 'tx_wompi_001',
            status: 'APPROVED',
            amount_in_cents: 4900000,
            currency: 'COP',
            reference: 'ga_pro_m_1726156800000_1234',
            payment_method_type: 'NEQUI',
            status_message: null,
          },
        },
        timestamp: 1726156800,
      };

      const parsed = adapter.parseWebhookEvent({
        rawBody: JSON.stringify(payload),
        headers: {},
        parsedPayload: payload,
      });

      expect(parsed.gatewayTransactionId).toBe('tx_wompi_001');
      expect(parsed.transactionReference).toBe('ga_pro_m_1726156800000_1234');
      expect(parsed.status).toBe('APPROVED');
      expect(parsed.amountInCents).toBe(4900000);
      expect(parsed.currency).toBe('COP');
      expect(parsed.paymentMethodType).toBe('NEQUI');
    });
  });
});
