import { describe, it, expect, beforeEach } from 'vitest';
import {
  CountryPricingRegistry,
  COLOMBIA_PRICING_PLAN,
  validatePricingPlanConfig,
  type PricingPlanConfig,
} from '../src/entities/PricingConfig.js';
import { PricingCalculatorService } from '../src/services/PricingCalculatorService.js';

describe('PricingConfig & CountryPricingRegistry Domain Tests', () => {
  beforeEach(() => {
    CountryPricingRegistry.resetToDefaults();
  });

  describe('Invariants & Validation', () => {
    it('validates the default Colombia plan successfully', () => {
      expect(() => validatePricingPlanConfig(COLOMBIA_PRICING_PLAN)).not.toThrow();
      expect(COLOMBIA_PRICING_PLAN.countryCode).toBe('CO');
      expect(COLOMBIA_PRICING_PLAN.currency.code).toBe('COP');
      expect(COLOMBIA_PRICING_PLAN.monthlyPrice).toBe(49000);
      expect(COLOMBIA_PRICING_PLAN.annualMonthlyPrice).toBe(39000);
      expect(COLOMBIA_PRICING_PLAN.annualTotal).toBe(468000);
      expect(COLOMBIA_PRICING_PLAN.freeContractsIncluded).toBe(3);
      expect(COLOMBIA_PRICING_PLAN.features.length).toBeGreaterThanOrEqual(3);
    });

    it('rejects plan with missing or empty id', () => {
      const invalid = { ...COLOMBIA_PRICING_PLAN, id: '' };
      expect(() => validatePricingPlanConfig(invalid)).toThrow(
        'Pricing plan must have a valid id'
      );
    });

    it('rejects plan where annual monthly price is not cheaper than monthly price', () => {
      const invalid = {
        ...COLOMBIA_PRICING_PLAN,
        monthlyPrice: 40000,
        annualMonthlyPrice: 50000,
      };
      expect(() => validatePricingPlanConfig(invalid)).toThrow(
        'Annual monthly price must be less than monthly price'
      );
    });

    it('rejects plan where annual total does not equal annualMonthlyPrice * 12', () => {
      const invalid = {
        ...COLOMBIA_PRICING_PLAN,
        annualMonthlyPrice: 39000,
        annualTotal: 400000, // Should be 468000
      };
      expect(() => validatePricingPlanConfig(invalid)).toThrow(
        'Annual total must equal annualMonthlyPrice * 12'
      );
    });

    it('rejects negative free contracts included', () => {
      const invalid = { ...COLOMBIA_PRICING_PLAN, freeContractsIncluded: -1 };
      expect(() => validatePricingPlanConfig(invalid)).toThrow(
        'Free contracts included cannot be negative'
      );
    });

    it('rejects plan with fewer than 3 features', () => {
      const invalid = { ...COLOMBIA_PRICING_PLAN, features: ['One', 'Two'] };
      expect(() => validatePricingPlanConfig(invalid)).toThrow(
        'Pricing plan must have at least 3 features listed'
      );
    });
  });

  describe('CountryPricingRegistry', () => {
    it('returns Colombia plan by default when no country code is provided', () => {
      const plan = CountryPricingRegistry.getPlanForCountry();
      expect(plan.countryCode).toBe('CO');
      expect(plan.currency.code).toBe('COP');
      expect(plan.monthlyPrice).toBe(49000);
    });

    it('returns Colombia plan when given case-insensitive code "co"', () => {
      const plan = CountryPricingRegistry.getPlanForCountry('co');
      expect(plan.countryCode).toBe('CO');
      expect(plan.monthlyPrice).toBe(49000);
    });

    it('gracefully falls back to Colombia when given an unknown country code', () => {
      const plan = CountryPricingRegistry.getPlanForCountry('UNKNOWN');
      expect(plan.countryCode).toBe('CO');
      expect(plan.monthlyPrice).toBe(49000);
    });

    it('allows registering and resolving a new country plan (multi-country extensibility)', () => {
      const mexicoPlan: PricingPlanConfig = {
        id: 'pro-mx',
        name: 'Plan Pro México',
        tagline: 'Acceso para personas y empresas en México',
        countryCode: 'MX',
        currency: {
          symbol: '$',
          code: 'MXN',
          position: 'prefix',
        },
        monthlyPrice: 299,
        annualMonthlyPrice: 239,
        annualTotal: 2868,
        annualDiscountPercent: 20,
        freeContractsIncluded: 3,
        features: [
          'Generación ilimitada de contratos legales',
          'Cuestionario guiado pregunta a pregunta',
          'Descarga directa en formato Word y PDF',
        ],
        cta: {
          label: 'Comenzar ahora',
          href: '/register',
        },
      };

      CountryPricingRegistry.registerPlan('MX', mexicoPlan);

      expect(CountryPricingRegistry.getSupportedCountries()).toContain('MX');
      const retrieved = CountryPricingRegistry.getPlanForCountry('MX');
      expect(retrieved.countryCode).toBe('MX');
      expect(retrieved.currency.code).toBe('MXN');
      expect(retrieved.monthlyPrice).toBe(299);
      expect(retrieved.annualTotal).toBe(2868);
    });
  });

  describe('PricingCalculatorService', () => {
    it('calculates annual savings accurately for Colombia plan', () => {
      const savings = PricingCalculatorService.calculateAnnualSavings(
        COLOMBIA_PRICING_PLAN
      );
      // (49000 * 12) - 468000 = 588000 - 468000 = 120000
      expect(savings).toBe(120000);
    });

    it('formats price according to Spanish currency formatting standards', () => {
      const formatted = PricingCalculatorService.formatPrice(
        49000,
        COLOMBIA_PRICING_PLAN.currency
      );
      // In es-CO, 49000 is formatted with dot separator: 49.000 (or non-breaking space depending on env)
      expect(formatted).toMatch(/\$\s*49[.,]000\s*COP/);
    });

    it('provides display price details for monthly billing cycle', () => {
      const details = PricingCalculatorService.getDisplayPrice(
        COLOMBIA_PRICING_PLAN,
        'monthly'
      );
      expect(details.amount).toBe(49000);
      expect(details.periodLabel).toBe('/ mes');
      expect(details.savingsText).toBeUndefined();
      expect(details.billingSummary).toContain('Facturación mensual');
    });

    it('provides display price details for annual billing cycle with savings highlight', () => {
      const details = PricingCalculatorService.getDisplayPrice(
        COLOMBIA_PRICING_PLAN,
        'annual'
      );
      expect(details.amount).toBe(39000);
      expect(details.periodLabel).toBe('/ mes');
      expect(details.savingsText).toBe('Ahorra 20%');
      expect(details.billingSummary).toMatch(/468[.,]000/);
    });
  });
});
