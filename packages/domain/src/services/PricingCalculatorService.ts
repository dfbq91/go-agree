/**
 * @file PricingCalculatorService.ts
 * @description Pure domain service for calculating pricing totals, discounts, and formatted currency outputs.
 */

import type {
  BillingCycle,
  CurrencyConfig,
  PricingPlanConfig,
} from '../entities/PricingConfig.js';

export interface DisplayPriceDetails {
  readonly amount: number;
  readonly formatted: string;
  readonly periodLabel: string;
  readonly savingsText?: string;
  readonly totalAnnualFormatted?: string;
  readonly billingSummary: string;
}

export class PricingCalculatorService {
  /**
   * Calculates total monetary savings over a full year when selecting annual billing.
   */
  static calculateAnnualSavings(plan: PricingPlanConfig): number {
    const fullMonthlyCost = plan.monthlyPrice * 12;
    return Math.max(0, fullMonthlyCost - plan.annualTotal);
  }

  /**
   * Formats a monetary number into a localized string with thousands separator and currency code.
   * Example for COP: 49000 -> "$ 49.000 COP"
   */
  static formatPrice(amount: number, currency: CurrencyConfig): string {
    const formattedNumber = new Intl.NumberFormat('es-CO', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(amount);

    if (currency.position === 'prefix') {
      return `${currency.symbol} ${formattedNumber} ${currency.code}`;
    }
    return `${formattedNumber} ${currency.symbol} ${currency.code}`;
  }

  /**
   * Returns presentation details for the plan based on the active billing cycle.
   */
  static getDisplayPrice(
    plan: PricingPlanConfig,
    cycle: BillingCycle
  ): DisplayPriceDetails {
    if (cycle === 'monthly') {
      const formatted = this.formatPrice(plan.monthlyPrice, plan.currency);
      return {
        amount: plan.monthlyPrice,
        formatted,
        periodLabel: '/ mes',
        billingSummary: 'Facturación mensual sin permanencia',
      };
    }

    const formatted = this.formatPrice(plan.annualMonthlyPrice, plan.currency);
    const totalAnnualFormatted = this.formatPrice(plan.annualTotal, plan.currency);
    return {
      amount: plan.annualMonthlyPrice,
      formatted,
      periodLabel: '/ mes',
      savingsText: `Ahorra ${plan.annualDiscountPercent}%`,
      totalAnnualFormatted,
      billingSummary: `Facturado anualmente a ${totalAnnualFormatted} / año`,
    };
  }
}
