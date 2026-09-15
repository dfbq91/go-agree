import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '../../src/app/api/contracts/[id]/analyze/route';

const { mockExecute } = vi.hoisted(() => ({
  mockExecute: vi.fn(),
}));

// Mocks para simular sesión y casos de uso
vi.mock('@/lib/auth', () => ({
  getServerAuthAdapter: vi.fn().mockResolvedValue({
    getCurrentSession: vi.fn().mockResolvedValue({ userId: 'user-123' }),
  }),
}));

vi.mock('@/lib/analysis', () => ({
  getAnalyzeContractUseCase: vi.fn().mockResolvedValue({
    execute: mockExecute,
  }),
}));

describe('POST /api/contracts/[id]/analyze Route Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('triggers analysis and returns 200 OK with analysis result', async () => {
    mockExecute.mockResolvedValue({
      status: 'generated',
      questions: [{ id: 'dyn_1', prompt: 'Hitos' }],
    });

    const request = new Request('http://localhost:3000/api/contracts/contract-123/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: 1 }),
    });

    const response = await POST(request as any, {
      params: Promise.resolve({ id: 'contract-123' }),
    });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.status).toBe('generated');
    expect(json.questions).toEqual([{ id: 'dyn_1', prompt: 'Hitos' }]);
    expect(mockExecute).toHaveBeenCalledWith({
      contractId: 'contract-123',
      userId: 'user-123',
      stage: 1,
    });
  });

  it('returns 500 when analysis use case fails', async () => {
    mockExecute.mockRejectedValue(new Error('LLM Quota Exceeded'));

    const request = new Request('http://localhost:3000/api/contracts/contract-123/analyze', {
      method: 'POST',
    });

    const response = await POST(request as any, {
      params: Promise.resolve({ id: 'contract-123' }),
    });
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.code).toBe('ANALYSIS_ERROR');
    expect(json.correlationId).toBeDefined();
  });
});
