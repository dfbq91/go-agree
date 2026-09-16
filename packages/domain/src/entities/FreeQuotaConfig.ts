/**
 * @file FreeQuotaConfig.ts
 * @description Configuration and resolver for free contracts quota limit.
 * Reads from environment variables (NEXT_PUBLIC_FREE_CONTRACTS_LIMIT, FREE_CONTRACTS_LIMIT, etc.)
 * with default fallback to 3.
 */

export const DEFAULT_FREE_CONTRACT_LIMIT = 3;

/**
 * Resolves the number of free contracts allowed per user account.
 * Prioritizes environment variables with fallback to DEFAULT_FREE_CONTRACT_LIMIT (3).
 */
export function getFreeContractLimit(): number {
  if (typeof process !== 'undefined' && process.env) {
    const raw = process.env.NEXT_PUBLIC_FREE_CONTRACTS_LIMIT;

    if (raw !== undefined && raw !== null && raw !== '') {
      const parsed = Number(raw);
      if (!Number.isNaN(parsed) && parsed >= 0) {
        return Math.floor(parsed);
      }
    }
  }

  return DEFAULT_FREE_CONTRACT_LIMIT;
}
