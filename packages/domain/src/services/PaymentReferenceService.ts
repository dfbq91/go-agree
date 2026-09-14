/**
 * @file PaymentReferenceService.ts
 * @description Generates unique, non-reusable transaction reference strings for payment gateways.
 */

import type { BillingCycle } from '../entities/PricingConfig.js';

export class PaymentReferenceService {
  /**
   * Generates a cryptographically unique merchant reference string.
   * Format: ga_{planId}_{cyclePrefix}_{timestamp}_{randomHex}
   * Example: ga_pro_m_1726156800000_f3a1b2c4
   */
  static generateReference(planId: string = 'pro', cycle: BillingCycle = 'monthly'): string {
    const cyclePrefix = cycle === 'annual' ? 'a' : 'm';
    const timestamp = Date.now();
    const randomHex = Math.random().toString(36).substring(2, 10);
    return `ga_${planId.toLowerCase()}_${cyclePrefix}_${timestamp}_${randomHex}`;
  }

  /**
   * Validates whether a reference string matches the expected Go-Agree format.
   */
  static isValidReference(reference: string): boolean {
    if (!reference || typeof reference !== 'string') return false;
    const regex = /^ga_[a-z0-9]+_[ma]_[0-9]+_[a-z0-9]+$/;
    return regex.test(reference);
  }
}
