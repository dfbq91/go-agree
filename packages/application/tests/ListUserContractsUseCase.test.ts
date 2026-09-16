import { describe, expect, it, vi } from 'vitest';
import type {
  ContractDashboardItemDTO,
  ContractRepositoryPort,
} from '../src/ports/ContractRepositoryPort.js';
import { ListUserContractsUseCase } from '../src/use-cases/contracts/ContractUseCases.js';

describe('ListUserContractsUseCase', () => {
  it('should call listDashboardItemsByUserId and return items sorted by updatedAt descending', async () => {
    const mockItems: ContractDashboardItemDTO[] = [
      {
        id: 'con_1',
        userId: 'user_1',
        title: 'Mi Contrato 1',
        status: 'in_progress',
        currentQuestionIndex: 2,
        questionsAnsweredCount: 3,
        hasGeneratedDocument: false,
        availableFormats: [],
        createdAt: new Date('2026-09-01T10:00:00Z'),
        updatedAt: new Date('2026-09-10T12:00:00Z'),
      },
      {
        id: 'con_2',
        userId: 'user_1',
        title: 'Mi Contrato 2',
        status: 'completed',
        currentQuestionIndex: 12,
        questionsAnsweredCount: 12,
        hasGeneratedDocument: true,
        availableFormats: ['pdf', 'docx'],
        createdAt: new Date('2026-09-05T10:00:00Z'),
        updatedAt: new Date('2026-09-15T15:00:00Z'),
      },
    ];

    const mockRepo: ContractRepositoryPort = {
      listByUserId: vi.fn(),
      listDashboardItemsByUserId: vi.fn().mockResolvedValue(mockItems),
      getByIdAndUserId: vi.fn(),
      save: vi.fn(),
      create: vi.fn(),
      deleteByIdAndUserId: vi.fn(),
    };

    const useCase = new ListUserContractsUseCase(mockRepo);
    const result = await useCase.execute('user_1');

    expect(mockRepo.listDashboardItemsByUserId).toHaveBeenCalledWith('user_1');
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('con_2');
    expect(result[1].id).toBe('con_1');
  });
});
