/**
 * API Error Response Contract
 * Clean Architecture Boundary: Presentation / HTTP Interfaces
 *
 * Defines the standardized error envelope returned by all Next.js API route handlers.
 */

export interface ApiErrorResponsePayload {
  code: string;
  message: string;
  correlationId: string;
  details?: unknown;
}

export interface ApiErrorResponseOptions {
  status: number;
  headers?: Record<string, string>;
}
