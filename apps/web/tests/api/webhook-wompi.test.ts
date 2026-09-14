import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../../src/app/api/webhooks/wompi/route';
import { PaymentTamperError } from '@go-agree/domain';

const mockExecute = vi.fn();

vi.mock('@/lib/subscription', () => ({
  getServerSubscriptionRepository: vi.fn(),
}));

vi.mock('@/lib/payments', () => ({
  getServerPaymentRepository: vi.fn(),
  getPaymentGatewayResolver: () => ({
    resolve: vi.fn(),
  }),
}));

vi.mock('@go-agree/application', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@go-agree/application')>();
  return {
    ...actual,
    ProcessPaymentWebhookUseCase: vi.fn().mockImplementation(() => ({
      execute: mockExecute,
    })),
  };
});

describe('POST /api/webhooks/wompi Route Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('receives webhook payload, executes use case, and responds 200 OK within 1.5s', async () => {
    mockExecute.mockResolvedValue({
      status: 'processed',
      message: 'Plan Pro activado exitosamente',
      planActivated: true,
    });

    const bodyPayload = {
      event: 'transaction.updated',
      data: {
        transaction: {
          id: 'wompi_tx_123',
          status: 'APPROVED',
          reference: 'ga_pro_m_1726156800000_1234',
        },
      },
    };

    const request = new Request('http://localhost:3000/api/webhooks/wompi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyPayload),
    });

    const startTime = Date.now();
    const response = await POST(request as any);
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(1500); // Responds under 1.5 seconds
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.received).toBe(true);
    expect(mockExecute).toHaveBeenCalledOnce();
  });

  it('returns 400 when checksum fails cryptographic verification', async () => {
    mockExecute.mockRejectedValue(new PaymentTamperError('Firma inválida'));

    const request = new Request('http://localhost:3000/api/webhooks/wompi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invalid: true }),
    });

    const response = await POST(request as any);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.code).toBe('CHECKSUM_VERIFICATION_FAILED');
  });
});
