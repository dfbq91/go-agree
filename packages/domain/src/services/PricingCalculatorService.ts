/**
 * @file PricingCalculatorService.ts
 * @description Pure domain service for calculating pricing totals, discounts, and formatted currency outputs.
 */

import {
  type BillingCycle,
  type CountryCode,
  type CurrencyConfig,
  type PricingPlanConfig,
  getLocaleForCountry,
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
  static formatPrice(amount: number, currency: CurrencyConfig, countryCode?: CountryCode): string {
    const locale = getLocaleForCountry(countryCode);
    const hasDecimals = amount % 1 !== 0;
    const formattedNumber = new Intl.NumberFormat(locale, {
      maximumFractionDigits: hasDecimals ? 2 : 0,
      minimumFractionDigits: hasDecimals ? 2 : 0,
    }).format(amount);

    if (currency.position === 'prefix') {
      return `${currency.symbol} ${formattedNumber} ${currency.code}`;
    }
    return `${formattedNumber} ${currency.symbol} ${currency.code}`;
  }

  /**
   * Returns presentation details for the plan based on the active billing cycle.
   */
  static getDisplayPrice(plan: PricingPlanConfig, cycle: BillingCycle): DisplayPriceDetails {
    if (cycle === 'monthly') {
      const formatted = PricingCalculatorService.formatPrice(
        plan.monthlyPrice,
        plan.currency,
        plan.countryCode
      );
      return {
        amount: plan.monthlyPrice,
        formatted,
        periodLabel: '/ mes',
        billingSummary: 'Facturación mensual sin permanencia',
      };
    }

    const formatted = PricingCalculatorService.formatPrice(
      plan.annualMonthlyPrice,
      plan.currency,
      plan.countryCode
    );
    const totalAnnualFormatted = PricingCalculatorService.formatPrice(
      plan.annualTotal,
      plan.currency,
      plan.countryCode
    );
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
