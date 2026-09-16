import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  ContractDashboardItemDTO,
  ContractGenerationDTO,
  ContractRepositoryPort,
} from '../src/ports/ContractRepositoryPort';
import {
  CreateContractUseCase,
  GetContractByIdUseCase,
  ListUserContractsUseCase,
} from '../src/use-cases/contracts/ContractUseCases';

describe('Contract Application Use Cases (Tenant Isolation)', () => {
  let mockRepository: ContractRepositoryPort;

  beforeEach(() => {
    mockRepository = {
      listByUserId: vi.fn(),
      listDashboardItemsByUserId: vi.fn(),
      getByIdAndUserId: vi.fn(),
      save: vi.fn(),
      create: vi.fn(),
      deleteByIdAndUserId: vi.fn(),
    };
  });

  describe('ListUserContractsUseCase', () => {
    it('returns only contracts owned by the requesting user', async () => {
      const now = new Date();
      const mockItems: ContractDashboardItemDTO[] = [
        {
          id: 'contract-1',
          userId: 'user-123',
          title: 'NDA Estándar',
          status: 'in_progress',
          currentQuestionIndex: 2,
          questionsAnsweredCount: 2,
          hasGeneratedDocument: false,
          availableFormats: [],
          createdAt: now,
          updatedAt: now,
        },
      ];

      vi.mocked(mockRepository.listDashboardItemsByUserId).mockResolvedValue(mockItems);
      const useCase = new ListUserContractsUseCase(mockRepository);

      const result = await useCase.execute('user-123');

      expect(mockRepository.listDashboardItemsByUserId).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockItems);
    });
  });

  describe('GetContractByIdUseCase', () => {
    it('returns contract details when owned by the user', async () => {
      const mockContract: ContractGenerationDTO = {
        id: 'contract-1',
        userId: 'user-123',
        title: 'NDA Estándar',
        status: 'in_progress',
        currentQuestionIndex: 2,
        answers: { key: 'value' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockRepository.getByIdAndUserId).mockResolvedValue(mockContract);
      const useCase = new GetContractByIdUseCase(mockRepository);

      const result = await useCase.execute('contract-1', 'user-123');

      expect(mockRepository.getByIdAndUserId).toHaveBeenCalledWith('contract-1', 'user-123');
      expect(result).toEqual(mockContract);
    });

    it('throws error if contract does not exist or belongs to another user', async () => {
      vi.mocked(mockRepository.getByIdAndUserId).mockResolvedValue(null);
      const useCase = new GetContractByIdUseCase(mockRepository);

      await expect(useCase.execute('contract-1', 'unauthorized-user')).rejects.toThrow(
        'Contract not found or access denied'
      );
    });
  });

  describe('CreateContractUseCase', () => {
    it('creates and associates a new contract with the current user', async () => {
      const createdContract: ContractGenerationDTO = {
        id: 'new-contract-id',
        userId: 'user-123',
        title: 'Nuevo Acuerdo',
        status: 'in_progress',
        currentQuestionIndex: 0,
        answers: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockRepository.create).mockResolvedValue(createdContract);
      const useCase = new CreateContractUseCase(mockRepository);

      const result = await useCase.execute({
        userId: 'user-123',
        title: 'Nuevo Acuerdo',
      });

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          title: 'Nuevo Acuerdo',
        })
      );
      expect(result).toEqual(createdContract);
    });
  });
});
