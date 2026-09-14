/**
 * @file config.ts
 * @description Centralized environment configuration and validation.
 */

export interface PaymentConfig {
  readonly wompiPublicKey: string;
  readonly wompiPrivateKey: string;
  readonly wompiIntegritySecret: string;
  readonly wompiEventSecret: string;
  readonly wompiCheckoutUrl: string;
  readonly appUrl: string;
}

export function getPaymentConfig(): PaymentConfig {
  return {
    wompiPublicKey: process.env.WOMPI_PUBLIC_KEY || 'pub_test_default',
    wompiPrivateKey: process.env.WOMPI_PRIVATE_KEY || 'prv_test_default',
    wompiIntegritySecret: process.env.WOMPI_INTEGRITY_SECRET || 'test_integrity_secret',
    wompiEventSecret: process.env.WOMPI_EVENT_SECRET || 'test_event_secret',
    wompiCheckoutUrl: process.env.WOMPI_CHECKOUT_URL || 'https://checkout.wompi.co/p/',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  };
}
