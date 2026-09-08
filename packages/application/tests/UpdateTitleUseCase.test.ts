import { describe, it, expect, beforeEach } from 'vitest';
import { UpdateTitleUseCase } from '../src/use-cases/questionnaire/UpdateTitleUseCase.js';
import { EmptyTitleError, ContractNotFoundError } from '@go-agree/domain';
import type { ContractProgressPort, ContractGenerationDTO } from '../src/ports/ContractProgressPort.js';

class MockPort implements ContractProgressPort {
  contract: ContractGenerationDTO | null = null;

  async getContractById(): Promise<any> { return this.contract; }
  async updateProgress(): Promise<any> { return this.contract; }
  async completeQuestionnaire(): Promise<any> { return this.contract; }
  async getNextDefaultTitle(): Promise<string> { return 'Mi Contrato 1'; }

  async updateTitle(input: any): Promise<ContractGenerationDTO> {
    if (!input.title || input.title.trim().length === 0) {
      throw new EmptyTitleError();
    }
    if (!this.contract || this.contract.id !== input.contractId) {
      throw new ContractNotFoundError(input.contractId);
    }
    this.contract.title = input.title.trim();
    return this.contract;
  }
}

describe('UpdateTitleUseCase', () => {
  let port: MockPort;
  let useCase: UpdateTitleUseCase;

  beforeEach(() => {
    port = new MockPort();
    useCase = new UpdateTitleUseCase(port);
    port.contract = {
      id: 'contract-1',
      userId: 'user-1',
      title: 'Mi Contrato 1',
      status: 'in_progress',
      currentQuestionIndex: 0,
      answers: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  it('updates title successfully', async () => {
    const updated = await useCase.execute({
      contractId: 'contract-1',
      userId: 'user-1',
      title: 'Nuevo Titulo',
    });

    expect(updated.title).toBe('Nuevo Titulo');
  });

  it('throws EmptyTitleError on blank title', async () => {
    await expect(
      useCase.execute({
        contractId: 'contract-1',
        userId: 'user-1',
        title: '   ',
      })
    ).rejects.toBeInstanceOf(EmptyTitleError);
  });
});
