/**
 * @file pricing-port.contract.ts
 * @description Contract definitions for Pricing Domain Entities, Country Pricing Registry, and Calculation Services.
 */

export type CountryCode = 'CO' | 'MX' | 'ES' | 'US' | string;

export type BillingCycle = 'monthly' | 'annual';

export interface CurrencyConfig {
  readonly symbol: string;
  readonly code: string;
  readonly position: 'prefix' | 'suffix';
}

export interface PricingPlanConfig {
  readonly id: string;
  readonly name: string;
  readonly tagline: string;
  readonly countryCode: CountryCode;
  readonly currency: CurrencyConfig;
  readonly monthlyPrice: number;
  readonly annualMonthlyPrice: number;
  readonly annualTotal: number;
  readonly annualDiscountPercent: number;
  readonly freeContractsIncluded: number;
  readonly features: readonly string[];
  readonly cta: {
    readonly label: string;
    readonly href: string;
  };
}

export interface CountryPricingRegistry {
  readonly defaultCountry: CountryCode;
  readonly plansByCountry: Readonly<Record<CountryCode, PricingPlanConfig>>;
  getPlanForCountry(countryCode?: CountryCode): PricingPlanConfig;
}

export interface PricingCalculatorPort {
  calculateAnnualSavings(plan: PricingPlanConfig): number;
  formatPrice(amount: number, currency: CurrencyConfig): string;
  getDisplayPrice(
    plan: PricingPlanConfig,
    cycle: BillingCycle
  ): {
    amount: number;
    formatted: string;
    periodLabel: string;
    subtext?: string;
  };
}
