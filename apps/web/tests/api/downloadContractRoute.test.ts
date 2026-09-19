import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from '../../src/app/api/contracts/[id]/download/route';

const { mockGetByIdAndUserId, mockGetCurrentSession } = vi.hoisted(() => ({
  mockGetByIdAndUserId: vi.fn(),
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
  }),
}));

vi.mock('@/lib/document-generation', () => ({
  getGetContractDocumentDownloadUseCase: vi.fn().mockResolvedValue({
    execute: vi.fn().mockImplementation(async ({ format, contractId }) => {
      if (format === 'pdf') {
        return {
          filename: `contrato-${contractId}.pdf`,
          mimeType: 'application/pdf',
          content: Buffer.from('%PDF-1.4 mock pdf'),
        };
      }
      return {
        filename: `contrato-${contractId}.docx`,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        content: Buffer.from('mock docx content'),
      };
    }),
  }),
}));

describe('GET /api/contracts/[id]/download Route Handler (User Story 3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when no session is present', async () => {
    mockGetCurrentSession.mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/contracts/c-1/download?format=pdf');
    const response = await GET(request, { params: Promise.resolve({ id: 'c-1' }) });

    expect(response.status).toBe(401);
  });

  it('returns 400 when invalid format is provided', async () => {
    mockGetCurrentSession.mockResolvedValue({ userId: 'u-123' });

    const request = new Request('http://localhost:3000/api/contracts/c-1/download?format=invalid');
    const response = await GET(request, { params: Promise.resolve({ id: 'c-1' }) });

    expect(response.status).toBe(400);
  });

  it('returns 404 when contract is not found or not owned by user', async () => {
    mockGetCurrentSession.mockResolvedValue({ userId: 'u-123' });
    mockGetByIdAndUserId.mockResolvedValue(null);

    const request = new Request(
      'http://localhost:3000/api/contracts/c-not-found/download?format=pdf'
    );
    const response = await GET(request, { params: Promise.resolve({ id: 'c-not-found' }) });

    expect(response.status).toBe(404);
  });

  it('returns 400 when contract is in_progress without document', async () => {
    mockGetCurrentSession.mockResolvedValue({ userId: 'u-123' });
    mockGetByIdAndUserId.mockResolvedValue({
      id: 'c-draft',
      userId: 'u-123',
      title: 'Borrador',
      status: 'in_progress',
      currentQuestionIndex: 2,
      answers: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const request = new Request('http://localhost:3000/api/contracts/c-draft/download?format=pdf');
    const response = await GET(request, { params: Promise.resolve({ id: 'c-draft' }) });

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.code).toBe('BAD_REQUEST');
    expect(body.message).toBeDefined();
  });

  it('returns 200 with application/pdf header when requesting PDF for completed contract', async () => {
    mockGetCurrentSession.mockResolvedValue({ userId: 'u-123' });
    mockGetByIdAndUserId.mockResolvedValue({
      id: 'c-completed',
      userId: 'u-123',
      title: 'Acuerdo Firmado',
      status: 'completed',
      currentQuestionIndex: 12,
      answers: { partyA: 'Empresa A' },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const request = new Request(
      'http://localhost:3000/api/contracts/c-completed/download?format=pdf'
    );
    const response = await GET(request, { params: Promise.resolve({ id: 'c-completed' }) });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('application/pdf');
    expect(response.headers.get('content-disposition')).toContain('attachment');
    expect(response.headers.get('content-disposition')).toContain('contrato-c-completed.pdf');
  });

  it('returns 200 with docx header when requesting Word for completed contract', async () => {
    mockGetCurrentSession.mockResolvedValue({ userId: 'u-123' });
    mockGetByIdAndUserId.mockResolvedValue({
      id: 'c-completed',
      userId: 'u-123',
      title: 'Acuerdo Firmado',
      status: 'completed',
      currentQuestionIndex: 12,
      answers: { partyA: 'Empresa A' },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const request = new Request(
      'http://localhost:3000/api/contracts/c-completed/download?format=docx'
    );
    const response = await GET(request, { params: Promise.resolve({ id: 'c-completed' }) });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    expect(response.headers.get('content-disposition')).toContain('attachment');
    expect(response.headers.get('content-disposition')).toContain('contrato-c-completed.docx');
  });
});
