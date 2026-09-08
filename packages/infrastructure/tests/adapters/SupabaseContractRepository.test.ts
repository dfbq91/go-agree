import { describe, it, expect, vi } from 'vitest';
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
              single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Row not found' } }),
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
});
