import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '../../src/app/api/contracts/[id]/complete/route';
import {
  ContractNotFoundError,
  FreeQuotaExceededError,
  IncompleteQuestionnaireError,
} from '@go-agree/domain';

const {
  mockExecute,
  mockGetCurrentSession,
  mockRevalidatePath,
} = vi.hoisted(() => ({
  mockExecute: vi.fn(),
  mockGetCurrentSession: vi.fn(),
  mockRevalidatePath: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: (...args: any[]) => mockRevalidatePath(...args),
}));

vi.mock('@/lib/auth', () => ({
  getServerAuthAdapter: vi.fn().mockResolvedValue({
    getCurrentSession: mockGetCurrentSession,
  }),
}));

vi.mock('@/lib/document-generation', () => ({
  getGenerateContractDocumentUseCase: vi.fn().mockResolvedValue({
    execute: mockExecute,
  }),
}));

describe('POST /api/contracts/[id]/complete Route Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('completes an in_progress contract and generates document formats', async () => {
    mockGetCurrentSession.mockResolvedValue({ userId: 'user-123' });
    mockExecute.mockResolvedValue({
      contractId: 'contract-1',
      status: 'completed',
      availableFormats: ['docx', 'pdf'],
      regenerated: false,
    });

    const request = new Request('http://localhost:3000/api/contracts/contract-1/complete', {
      method: 'POST',
    });

    const response = await POST(request as any, { params: Promise.resolve({ id: 'contract-1' }) });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.status).toBe('completed');
    expect(json.availableFormats).toEqual(['docx', 'pdf']);
    expect(mockExecute).toHaveBeenCalledWith({
      contractId: 'contract-1',
      userId: 'user-123',
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard');
  });

  it('returns 400 INCOMPLETE_QUESTIONNAIRE when not all questions are answered', async () => {
    mockGetCurrentSession.mockResolvedValue({ userId: 'user-123' });
    mockExecute.mockRejectedValue(new IncompleteQuestionnaireError(['q1_party_legal_nature']));

    const request = new Request('http://localhost:3000/api/contracts/contract-1/complete', {
      method: 'POST',
    });

    const response = await POST(request as any, { params: Promise.resolve({ id: 'contract-1' }) });
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.code).toBe('INCOMPLETE_QUESTIONNAIRE');
  });

  it('returns 403 FREE_QUOTA_EXCEEDED when user has exhausted free quota on an in_progress contract', async () => {
    mockGetCurrentSession.mockResolvedValue({ userId: 'user-123' });
    mockExecute.mockRejectedValue(new FreeQuotaExceededError(3));

    const request = new Request('http://localhost:3000/api/contracts/contract-4/complete', {
      method: 'POST',
    });

    const response = await POST(request as any, { params: Promise.resolve({ id: 'contract-4' }) });
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.code).toBe('FREE_QUOTA_EXCEEDED');
  });

  it('returns 404 when contract does not exist', async () => {
    mockGetCurrentSession.mockResolvedValue({ userId: 'user-123' });
    mockExecute.mockRejectedValue(new ContractNotFoundError('non-existent'));

    const request = new Request('http://localhost:3000/api/contracts/non-existent/complete', {
      method: 'POST',
    });

    const response = await POST(request as any, {
      params: Promise.resolve({ id: 'non-existent' }),
    });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.code).toBe('CONTRACT_NOT_FOUND');
  });

  it('returns 401 when no authenticated session is present', async () => {
    mockGetCurrentSession.mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/contracts/contract-1/complete', {
      method: 'POST',
    });

    const response = await POST(request as any, { params: Promise.resolve({ id: 'contract-1' }) });
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.code).toBe('UNAUTHORIZED');
  });
});
