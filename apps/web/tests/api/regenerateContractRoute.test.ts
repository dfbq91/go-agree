import {
  ContractNotFoundError,
  IncompleteQuestionnaireError,
  UnauthorizedContractAccessError,
} from '@go-agree/domain';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '../../src/app/api/contracts/[id]/regenerate/route';

const { mockExecute, mockGetCurrentSession, mockRevalidatePath } = vi.hoisted(() => ({
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
  getRegenerateContractDocumentUseCase: vi.fn().mockResolvedValue({
    execute: mockExecute,
  }),
}));

describe('POST /api/contracts/[id]/regenerate Route Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('regenerates document for completed contract with modified answers', async () => {
    mockGetCurrentSession.mockResolvedValue({ userId: 'user-123' });
    const regeneratedDate = new Date();
    mockExecute.mockResolvedValue({
      contractId: 'contract-1',
      status: 'completed',
      availableFormats: ['docx', 'pdf'],
      regeneratedAt: regeneratedDate,
    });

    const request = new Request('http://localhost:3000/api/contracts/contract-1/regenerate', {
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
    expect(mockRevalidatePath).toHaveBeenCalledWith('/questionnaire?id=contract-1');
  });

  it('returns 400 INCOMPLETE_QUESTIONNAIRE when not all questions are answered', async () => {
    mockGetCurrentSession.mockResolvedValue({ userId: 'user-123' });
    mockExecute.mockRejectedValue(new IncompleteQuestionnaireError(['q2_description_conditions']));

    const request = new Request('http://localhost:3000/api/contracts/contract-1/regenerate', {
      method: 'POST',
    });

    const response = await POST(request as any, { params: Promise.resolve({ id: 'contract-1' }) });
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.code).toBe('INCOMPLETE_QUESTIONNAIRE');
  });

  it('returns 404 when contract does not exist', async () => {
    mockGetCurrentSession.mockResolvedValue({ userId: 'user-123' });
    mockExecute.mockRejectedValue(new ContractNotFoundError('non-existent'));

    const request = new Request('http://localhost:3000/api/contracts/non-existent/regenerate', {
      method: 'POST',
    });

    const response = await POST(request as any, {
      params: Promise.resolve({ id: 'non-existent' }),
    });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.code).toBe('CONTRACT_NOT_FOUND');
  });

  it('returns 403 when user is unauthorized to access contract', async () => {
    mockGetCurrentSession.mockResolvedValue({ userId: 'user-wrong' });
    mockExecute.mockRejectedValue(new UnauthorizedContractAccessError('contract-1', 'user-wrong'));

    const request = new Request('http://localhost:3000/api/contracts/contract-1/regenerate', {
      method: 'POST',
    });

    const response = await POST(request as any, { params: Promise.resolve({ id: 'contract-1' }) });
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.code).toBe('UNAUTHORIZED_ACCESS');
  });

  it('returns 401 when no authenticated session is present', async () => {
    mockGetCurrentSession.mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/contracts/contract-1/regenerate', {
      method: 'POST',
    });

    const response = await POST(request as any, { params: Promise.resolve({ id: 'contract-1' }) });
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.code).toBe('UNAUTHORIZED');
  });
});
