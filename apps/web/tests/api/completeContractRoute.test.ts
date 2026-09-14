import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '../../src/app/api/contracts/[id]/complete/route';

const mockGetContractById = vi.fn();
const mockCompleteQuestionnaire = vi.fn();
const mockGetByUserId = vi.fn();
const mockIncrementFreeContractCount = vi.fn();
const mockRevalidatePath = vi.fn();

vi.mock('next/cache', () => ({
  revalidatePath: (...args: any[]) => mockRevalidatePath(...args),
}));

vi.mock('@/lib/auth', () => ({
  getServerAuthAdapter: () => ({
    getCurrentSession: vi.fn().mockResolvedValue({ userId: 'user-123' }),
  }),
}));

vi.mock('@/lib/contracts', () => ({
  getServerContractRepository: () => ({
    getContractById: mockGetContractById,
    completeQuestionnaire: mockCompleteQuestionnaire,
  }),
}));

vi.mock('@/lib/subscription', () => ({
  getServerSubscriptionRepository: () => ({
    getByUserId: mockGetByUserId,
    incrementFreeContractCount: mockIncrementFreeContractCount,
  }),
}));

describe('POST /api/contracts/[id]/complete Route Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('completes an in_progress contract and consumes 1 quota credit', async () => {
    mockGetContractById.mockResolvedValue({
      id: 'contract-1',
      userId: 'user-123',
      title: 'Mi Contrato 1',
      status: 'in_progress',
      currentQuestionIndex: 11,
      answers: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockGetByUserId.mockResolvedValue({
      id: 'sub-1',
      userId: 'user-123',
      planType: 'free',
      status: 'active',
      freeContractsUsed: 1,
      startedAt: new Date().toISOString(),
      expiresAt: null,
      currentPeriodBillingCycle: null,
      lastPaymentTransactionId: null,
    });

    mockIncrementFreeContractCount.mockResolvedValue(2);

    mockCompleteQuestionnaire.mockResolvedValue({
      id: 'contract-1',
      userId: 'user-123',
      title: 'Mi Contrato 1',
      status: 'completed',
      currentQuestionIndex: 11,
      answers: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const request = new Request('http://localhost:3000/api/contracts/contract-1/complete', {
      method: 'POST',
    });

    const response = await POST(request as any, { params: { id: 'contract-1' } });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.status).toBe('completed');
    expect(mockIncrementFreeContractCount).toHaveBeenCalledWith('user-123');
    expect(mockCompleteQuestionnaire).toHaveBeenCalledWith({
      contractId: 'contract-1',
      userId: 'user-123',
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard');
  });

  it('is idempotent: does NOT consume quota if contract is already completed', async () => {
    mockGetContractById.mockResolvedValue({
      id: 'contract-1',
      userId: 'user-123',
      title: 'Mi Contrato 1',
      status: 'completed',
      currentQuestionIndex: 11,
      answers: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const request = new Request('http://localhost:3000/api/contracts/contract-1/complete', {
      method: 'POST',
    });

    const response = await POST(request as any, { params: { id: 'contract-1' } });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.status).toBe('completed');
    // Crucial: Quota MUST NOT be incremented
    expect(mockIncrementFreeContractCount).not.toHaveBeenCalled();
    expect(mockGetByUserId).not.toHaveBeenCalled();
    expect(mockCompleteQuestionnaire).not.toHaveBeenCalled();
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard');
  });

  it('returns 403 FREE_QUOTA_EXCEEDED when user has exhausted free quota on an in_progress contract', async () => {
    mockGetContractById.mockResolvedValue({
      id: 'contract-4',
      userId: 'user-123',
      title: 'Mi Contrato 4',
      status: 'in_progress',
      currentQuestionIndex: 11,
      answers: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockGetByUserId.mockResolvedValue({
      id: 'sub-1',
      userId: 'user-123',
      planType: 'free',
      status: 'active',
      freeContractsUsed: 3,
      startedAt: new Date().toISOString(),
      expiresAt: null,
      currentPeriodBillingCycle: null,
      lastPaymentTransactionId: null,
    });

    const request = new Request('http://localhost:3000/api/contracts/contract-4/complete', {
      method: 'POST',
    });

    const response = await POST(request as any, { params: { id: 'contract-4' } });
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.code).toBe('FREE_QUOTA_EXCEEDED');
    expect(mockIncrementFreeContractCount).not.toHaveBeenCalled();
    expect(mockCompleteQuestionnaire).not.toHaveBeenCalled();
  });

  it('returns 404 when contract does not exist', async () => {
    mockGetContractById.mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/contracts/non-existent/complete', {
      method: 'POST',
    });

    const response = await POST(request as any, { params: { id: 'non-existent' } });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.code).toBe('CONTRACT_NOT_FOUND');
    expect(mockIncrementFreeContractCount).not.toHaveBeenCalled();
  });
});
