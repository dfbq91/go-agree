import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ContractRepositoryPort } from '../src/ports/ContractRepositoryPort.js';
import { DeleteContractUseCase } from '../src/use-cases/contracts/DeleteContractUseCase.js';

describe('DeleteContractUseCase (Tenant Isolation & Safety)', () => {
  let mockRepo: ContractRepositoryPort;
  let useCase: DeleteContractUseCase;

  beforeEach(() => {
    mockRepo = {
      listByUserId: vi.fn(),
      listDashboardItemsByUserId: vi.fn(),
      getByIdAndUserId: vi.fn(),
      save: vi.fn(),
      create: vi.fn(),
      deleteByIdAndUserId: vi.fn(),
    };
    useCase = new DeleteContractUseCase(mockRepo);
  });

  it('throws an error if contract is not found or user is not the owner', async () => {
    vi.mocked(mockRepo.getByIdAndUserId).mockResolvedValue(null);

    await expect(
      useCase.execute({ contractId: 'c-999', userId: 'user-unauthorized' })
    ).rejects.toThrow('Contract not found or access denied');

    expect(mockRepo.getByIdAndUserId).toHaveBeenCalledWith('c-999', 'user-unauthorized');
    expect(mockRepo.deleteByIdAndUserId).not.toHaveBeenCalled();
  });

  it('deletes the contract when user is the verified owner', async () => {
    vi.mocked(mockRepo.getByIdAndUserId).mockResolvedValue({
      id: 'c-100',
      userId: 'user-owner',
      title: 'Contrato de Arriendo',
      status: 'in_progress',
      currentQuestionIndex: 1,
      answers: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await useCase.execute({ contractId: 'c-100', userId: 'user-owner' });

    expect(mockRepo.getByIdAndUserId).toHaveBeenCalledWith('c-100', 'user-owner');
    expect(mockRepo.deleteByIdAndUserId).toHaveBeenCalledWith('c-100', 'user-owner');
  });
});
