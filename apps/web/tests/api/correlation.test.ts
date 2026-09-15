import { createApiErrorResponse, withCorrelationContext } from '@/lib/api-error';
import { correlationStorage } from '@go-agree/infrastructure';
import { describe, expect, it } from 'vitest';

describe('Correlation ID & API Error Envelopes (User Story 4)', () => {
  it('createApiErrorResponse returns standard envelope with correlationId in body and header', async () => {
    const response = await withCorrelationContext(
      new Request('http://localhost:3000/api/test', {
        headers: { 'x-correlation-id': 'custom-corr-123' },
      }),
      async () => {
        return createApiErrorResponse('INVALID_INPUT', 'El campo es requerido', { status: 400 });
      }
    );

    expect(response.status).toBe(400);
    expect(response.headers.get('x-correlation-id')).toBe('custom-corr-123');

    const body = await response.json();
    expect(body).toEqual({
      code: 'INVALID_INPUT',
      message: 'El campo es requerido',
      correlationId: 'custom-corr-123',
    });
  });

  it('generates a valid fallback UUIDv7 with corr_ prefix when x-correlation-id is absent', async () => {
    const response = await withCorrelationContext(
      new Request('http://localhost:3000/api/test'),
      async () => {
        return createApiErrorResponse('INTERNAL_ERROR', 'Error inesperado', { status: 500 });
      }
    );

    expect(response.status).toBe(500);
    const headerId = response.headers.get('x-correlation-id');
    expect(headerId).toBeDefined();
    // Validates 'corr_' prefix and RFC 9562 UUIDv7 format (version 7 and variant 8, 9, a, or b)
    expect(headerId).toMatch(
      /^corr_[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );

    const body = await response.json();
    expect(body.correlationId).toBe(headerId);
  });

  it('populates and retrieves userId and contractId in ambient correlation storage with TypeId prefixes', async () => {
    await withCorrelationContext(
      new Request('http://localhost:3000/api/contracts/c-999', {
        headers: { 'x-correlation-id': 'corr-abc' },
      }),
      async () => {
        correlationStorage.setUserId('u-555');
        correlationStorage.setContractId('c-999');

        const context = correlationStorage.getContext();
        expect(context?.correlationId).toBe('corr-abc');
        expect(context?.userId).toBe('user_u-555');
        expect(context?.contractId).toBe('con_c-999');
      }
    );
  });
});
