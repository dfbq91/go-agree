/**
 * @file PricingConfig.ts
 * @description Domain entity and registry for Pricing configuration, supporting multi-country and multi-currency pricing models.
 */

import { getFreeContractLimit } from './FreeQuotaConfig.js';

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

export function validatePricingPlanConfig(plan: PricingPlanConfig): void {
  if (!plan.id || plan.id.trim() === '') {
    throw new Error('Pricing plan must have a valid id');
  }
  if (!plan.name || plan.name.trim() === '') {
    throw new Error('Pricing plan must have a valid name');
  }
  if (plan.monthlyPrice <= 0) {
    throw new Error('Monthly price must be greater than zero');
  }
  if (plan.annualMonthlyPrice <= 0) {
    throw new Error('Annual monthly price must be greater than zero');
  }
  if (plan.annualMonthlyPrice >= plan.monthlyPrice) {
    throw new Error('Annual monthly price must be less than monthly price');
  }
  if (plan.annualTotal !== plan.annualMonthlyPrice * 12) {
    throw new Error('Annual total must equal annualMonthlyPrice * 12');
  }
  if (plan.freeContractsIncluded < 0) {
    throw new Error('Free contracts included cannot be negative');
  }
  if (!plan.features || plan.features.length < 3) {
    throw new Error('Pricing plan must have at least 3 features listed');
  }
}

export const COLOMBIA_PRICING_PLAN: PricingPlanConfig = {
  id: 'pro',
  name: 'Plan Pro',
  tagline: 'Acceso ilimitado para personas y empresas',
  countryCode: 'CO',
  currency: {
    symbol: '$',
    code: 'COP',
    position: 'prefix',
  },
  monthlyPrice: 49000,
  annualMonthlyPrice: 39000,
  annualTotal: 468000,
  annualDiscountPercent: 20,
  freeContractsIncluded: getFreeContractLimit(),
  features: [
    'Generación ilimitada de contratos legales',
    'Cuestionario guiado pregunta a pregunta',
    'Análisis inteligente para preguntas de alcance específico',
    'Descarga directa en formato Word (.docx) y PDF',
    'Autoguardado incremental y reanudación de borradores',
    'Historial de contratos creados y acceso permanente',
  ],
  cta: {
    label: 'Comenzar ahora',
    href: '/register',
  },
};

export class CountryPricingRegistry {
  private static readonly defaultCountry: CountryCode = 'CO';
  private static readonly plans: Map<CountryCode, PricingPlanConfig> = new Map([
    ['CO', COLOMBIA_PRICING_PLAN],
  ]);

  /** It allows, in run time, to register new pricing plans for specific countries */
  static registerPlan(countryCode: CountryCode, plan: PricingPlanConfig): void {
    validatePricingPlanConfig(plan);
    CountryPricingRegistry.plans.set(countryCode.toUpperCase(), plan);
  }

  static getPlanForCountry(countryCode?: CountryCode): PricingPlanConfig {
    const raw = !countryCode
      ? CountryPricingRegistry.plans.get(CountryPricingRegistry.defaultCountry)!
      : (CountryPricingRegistry.plans.get(countryCode.toUpperCase()) ??
        CountryPricingRegistry.plans.get(CountryPricingRegistry.defaultCountry)!);

    if (raw.id === 'pro') {
      return {
        ...raw,
        freeContractsIncluded: getFreeContractLimit(),
      };
    }
    return raw;
  }

  static getSupportedCountries(): CountryCode[] {
    return Array.from(CountryPricingRegistry.plans.keys());
  }

  static resetToDefaults(): void {
    CountryPricingRegistry.plans.clear();
    CountryPricingRegistry.plans.set('CO', COLOMBIA_PRICING_PLAN);
  }
}

export function getLocaleForCountry(countryCode?: CountryCode): string {
  if (!countryCode) return 'es-CO';
  const map: Record<string, string> = {
    CO: 'es-CO',
    MX: 'es-MX',
    ES: 'es-ES',
    US: 'en-US',
    CL: 'es-CL',
    PE: 'es-PE',
    AR: 'es-AR',
  };
  return map[countryCode.toUpperCase()] || 'es-CO';
}
