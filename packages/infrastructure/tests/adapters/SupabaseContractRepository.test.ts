import { describe, expect, it, vi } from 'vitest';
import { SupabaseContractRepository } from '../../src/adapters/storage/SupabaseContractRepository';

describe('SupabaseContractRepository (Tenant Isolation & RLS)', () => {
  it('queries contract_generations scoped to the specific user_id', async () => {
    const mockData = [
      {
        id: 'c-1',
        user_id: 'user-1',
        title: 'Acuerdo Confidencial',
        status: 'in_progress',
        current_question_index: 1,
        updated_at: new Date().toISOString(),
      },
    ];

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      }),
    };

    const repo = new SupabaseContractRepository(mockSupabase as any);
    const contracts = await repo.listByUserId('user-1');

    expect(mockSupabase.from).toHaveBeenCalledWith('contract_generations');
    expect(contracts).toHaveLength(1);
    expect(contracts[0].id).toBe('c-1');
    expect(contracts[0].userId).toBe('user-1');
  });

  it('returns null when contract does not belong to the user or does not exist', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi
                .fn()
                .mockResolvedValue({ data: null, error: { message: 'Row not found' } }),
            }),
          }),
        }),
      }),
    };

    const repo = new SupabaseContractRepository(mockSupabase as any);
    const result = await repo.getByIdAndUserId('c-other', 'user-1');

    expect(result).toBeNull();
  });

  it('creates and returns new contract generation record', async () => {
    const newRecord = {
      id: 'c-new',
      user_id: 'user-1',
      title: 'Nuevo Contrato',
      status: 'in_progress',
      current_question_index: 0,
      answers: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: newRecord, error: null }),
          }),
        }),
      }),
    };

    const repo = new SupabaseContractRepository(mockSupabase as any);
    const created = await repo.create({
      id: 'c-new',
      userId: 'user-1',
      title: 'Nuevo Contrato',
      status: 'in_progress',
      currentQuestionIndex: 0,
      answers: {},
    });

    expect(created.id).toBe('c-new');
    expect(created.userId).toBe('user-1');
    expect(created.status).toBe('in_progress');
  });

  describe('listDashboardItemsByUserId isRegenerationPending evaluation', () => {
    it('sets isRegenerationPending to false when contract updatedAt is within the 2000ms threshold', async () => {
      const baseTime = new Date('2026-09-26T12:00:00.000Z');
      const docCreatedAt = new Date(baseTime.getTime());
      // 500ms skew (simulating database trigger or generation latency)
      const contractUpdatedAt = new Date(baseTime.getTime() + 500);

      const contractRow = {
        id: '11111111-1111-1111-1111-111111111111',
        user_id: 'user-1',
        title: 'Contrato Prueba',
        status: 'completed',
        current_question_index: 11,
        answers: { q0_party_role: 'client' },
        created_at: baseTime.toISOString(),
        updated_at: contractUpdatedAt.toISOString(),
      };

      const docRows = [
        {
          contract_id: '11111111-1111-1111-1111-111111111111',
          file_format: 'pdf',
          created_at: docCreatedAt.toISOString(),
        },
        {
          contract_id: '11111111-1111-1111-1111-111111111111',
          file_format: 'docx',
          created_at: docCreatedAt.toISOString(),
        },
      ];

      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === 'contract_generations') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({ data: [contractRow], error: null }),
                }),
              }),
            };
          }
          if (table === 'contract_documents') {
            return {
              select: vi.fn().mockReturnValue({
                in: vi.fn().mockResolvedValue({ data: docRows, error: null }),
              }),
            };
          }
          return {};
        }),
      };

      const repo = new SupabaseContractRepository(mockSupabase as any);
      const items = await repo.listDashboardItemsByUserId('user-1');

      expect(items).toHaveLength(1);
      expect(items[0].isRegenerationPending).toBe(false);
      expect(items[0].hasGeneratedDocument).toBe(true);
    });

    it('sets isRegenerationPending to true when contract updatedAt is more than 2000ms after document creation', async () => {
      const baseTime = new Date('2026-09-26T12:00:00.000Z');
      const docCreatedAt = new Date(baseTime.getTime());
      // 5000ms later (simulating user editing answers after generation)
      const contractUpdatedAt = new Date(baseTime.getTime() + 5000);

      const contractRow = {
        id: '11111111-1111-1111-1111-111111111111',
        user_id: 'user-1',
        title: 'Contrato Prueba',
        status: 'completed',
        current_question_index: 11,
        answers: { q0_party_role: 'client' },
        created_at: baseTime.toISOString(),
        updated_at: contractUpdatedAt.toISOString(),
      };

      const docRows = [
        {
          contract_id: '11111111-1111-1111-1111-111111111111',
          file_format: 'pdf',
          created_at: docCreatedAt.toISOString(),
        },
      ];

      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === 'contract_generations') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({ data: [contractRow], error: null }),
                }),
              }),
            };
          }
          if (table === 'contract_documents') {
            return {
              select: vi.fn().mockReturnValue({
                in: vi.fn().mockResolvedValue({ data: docRows, error: null }),
              }),
            };
          }
          return {};
        }),
      };

      const repo = new SupabaseContractRepository(mockSupabase as any);
      const items = await repo.listDashboardItemsByUserId('user-1');

      expect(items).toHaveLength(1);
      expect(items[0].isRegenerationPending).toBe(true);
    });
  });
});
