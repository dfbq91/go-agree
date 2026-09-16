import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DELETE } from '../../src/app/api/contracts/[id]/route';

const { mockGetByIdAndUserId, mockDeleteByIdAndUserId, mockGetCurrentSession } = vi.hoisted(() => ({
  mockGetByIdAndUserId: vi.fn(),
  mockDeleteByIdAndUserId: vi.fn(),
  mockGetCurrentSession: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  getServerAuthAdapter: vi.fn().mockResolvedValue({
    getCurrentSession: mockGetCurrentSession,
  }),
}));

vi.mock('@/lib/contracts', () => ({
  getServerContractRepository: vi.fn().mockResolvedValue({
    getByIdAndUserId: mockGetByIdAndUserId,
    deleteByIdAndUserId: mockDeleteByIdAndUserId,
  }),
}));

describe('DELETE /api/contracts/[id] Route Handler (User Story 4)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when no session is present', async () => {
    mockGetCurrentSession.mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/contracts/c-del/route', {
      method: 'DELETE',
    });
    const response = await DELETE(request, { params: Promise.resolve({ id: 'c-del' }) });

    expect(response.status).toBe(401);
  });

  it('returns 404 when contract does not exist or user is not owner', async () => {
    mockGetCurrentSession.mockResolvedValue({ userId: 'u-123' });
    mockGetByIdAndUserId.mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/contracts/c-not-found/route', {
      method: 'DELETE',
    });
    const response = await DELETE(request, { params: Promise.resolve({ id: 'c-not-found' }) });

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.code).toBe('NOT_FOUND');
  });

  it('returns 200 and calls delete when user is authorized owner', async () => {
    mockGetCurrentSession.mockResolvedValue({ userId: 'u-123' });
    mockGetByIdAndUserId.mockResolvedValue({
      id: 'c-del',
      userId: 'u-123',
      title: 'Contrato a Eliminar',
      status: 'in_progress',
      currentQuestionIndex: 1,
      answers: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockDeleteByIdAndUserId.mockResolvedValue(undefined);

    const request = new Request('http://localhost:3000/api/contracts/c-del/route', {
      method: 'DELETE',
    });
    const response = await DELETE(request, { params: Promise.resolve({ id: 'c-del' }) });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.contractId).toBe('c-del');
    expect(mockDeleteByIdAndUserId).toHaveBeenCalledWith('c-del', 'u-123');
  });
});
