/**
 * Correlation Context Contract
 * Clean Architecture Boundary: Infrastructure / Application
 *
 * Defines the contract for request-scoped correlation and context tracking.
 */

export interface CorrelationContext {
  readonly correlationId: string;
  userId?: string | null;
  contractId?: string | null;
  readonly startTime: number;
}

export interface CorrelationContextPort {
  /**
   * Retrieves the current ambient correlation context from AsyncLocalStorage.
   * Returns undefined if called outside a request lifecycle.
   */
  getContext(): CorrelationContext | undefined;

  /**
   * Returns the active correlation ID, or generates a fallback UUID if none active.
   */
  getCorrelationId(): string;

  /**
   * Attaches an authenticated user ID to the active request context.
   */
  setUserId(userId: string): void;

  /**
   * Attaches an active contract ID to the active request context.
   */
  setContractId(contractId: string): void;

  /**
   * Runs an asynchronous callback within an isolated correlation context.
   */
  runWithContext<T>(context: CorrelationContext, fn: () => Promise<T>): Promise<T>;
}
