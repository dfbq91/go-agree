import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_FREE_CONTRACT_LIMIT,
  getFreeContractLimit,
} from '../src/entities/FreeQuotaConfig.js';
import { CountryPricingRegistry } from '../src/entities/PricingConfig.js';
import { UserSubscription } from '../src/entities/UserSubscription.js';
import { UserId } from '../src/value-objects/UserId.js';

describe('FreeQuotaConfig & Environment Variable Integration', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.NEXT_PUBLIC_FREE_CONTRACTS_LIMIT = undefined;
    process.env.NEXT_PUBLIC_FREE_CONTRACT_LIMIT = undefined;
    process.env.FREE_CONTRACTS_LIMIT = undefined;
    process.env.FREE_CONTRACT_LIMIT = undefined;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('defaults to 3 when no environment variables are defined', () => {
    expect(getFreeContractLimit()).toBe(3);
    expect(DEFAULT_FREE_CONTRACT_LIMIT).toBe(3);
  });

  it('resolves NEXT_PUBLIC_FREE_CONTRACTS_LIMIT when provided', () => {
    process.env.NEXT_PUBLIC_FREE_CONTRACTS_LIMIT = '5';
    expect(getFreeContractLimit()).toBe(5);
  });

  it('resolves NEXT_PUBLIC_FREE_CONTRACT_LIMIT as alternate public variable', () => {
    process.env.NEXT_PUBLIC_FREE_CONTRACT_LIMIT = '7';
    expect(getFreeContractLimit()).toBe(7);
  });

  it('resolves FREE_CONTRACTS_LIMIT as server-side environment variable', () => {
    process.env.FREE_CONTRACTS_LIMIT = '10';
    expect(getFreeContractLimit()).toBe(10);
  });

  it('resolves FREE_CONTRACT_LIMIT as alternate server variable', () => {
    process.env.FREE_CONTRACT_LIMIT = '4';
    expect(getFreeContractLimit()).toBe(4);
  });

  it('respects precedence order: NEXT_PUBLIC_FREE_CONTRACTS_LIMIT > others', () => {
    process.env.NEXT_PUBLIC_FREE_CONTRACTS_LIMIT = '8';
    process.env.NEXT_PUBLIC_FREE_CONTRACT_LIMIT = '6';
    process.env.FREE_CONTRACTS_LIMIT = '4';
    expect(getFreeContractLimit()).toBe(8);
  });

  it('handles edge case: 0 free contracts allowed', () => {
    process.env.NEXT_PUBLIC_FREE_CONTRACTS_LIMIT = '0';
    expect(getFreeContractLimit()).toBe(0);
  });

  it('gracefully falls back to 3 on invalid non-numeric inputs', () => {
    process.env.NEXT_PUBLIC_FREE_CONTRACTS_LIMIT = 'invalid_number';
    expect(getFreeContractLimit()).toBe(3);

    process.env.NEXT_PUBLIC_FREE_CONTRACTS_LIMIT = '';
    expect(getFreeContractLimit()).toBe(3);
  });

  it('gracefully falls back to 3 on negative values', () => {
    process.env.NEXT_PUBLIC_FREE_CONTRACTS_LIMIT = '-5';
    expect(getFreeContractLimit()).toBe(3);
  });

  it('integrates dynamically with UserSubscription.createDefaultFree', () => {
    process.env.NEXT_PUBLIC_FREE_CONTRACTS_LIMIT = '5';
    const userId = new UserId('usr_12345678-1234-1234-1234-123456789012');
    const sub = UserSubscription.createDefaultFree(userId);

    expect(sub.freeContractsLimit).toBe(5);
    expect(sub.remainingFreeQuota()).toBe(5);
    expect(sub.canGenerateContract()).toBe(true);
  });

  it('integrates dynamically with CountryPricingRegistry.getPlanForCountry', () => {
    process.env.NEXT_PUBLIC_FREE_CONTRACTS_LIMIT = '6';
    const plan = CountryPricingRegistry.getPlanForCountry('CO');
    expect(plan.freeContractsIncluded).toBe(6);
  });
});
