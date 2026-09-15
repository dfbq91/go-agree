import { ContractNotFoundError, UnauthorizedContractAccessError } from '@go-agree/domain';
import { beforeEach, describe, expect, it } from 'vitest';
import type {
  ContractGenerationDTO,
  ContractProgressPort,
} from '../src/ports/ContractProgressPort.js';
import { UpdateQuestionnaireProgressUseCase } from '../src/use-cases/questionnaire/UpdateQuestionnaireProgressUseCase.js';

class InMemoryProgressPort implements ContractProgressPort {
  contracts = new Map<string, ContractGenerationDTO>();

  async getContractById(contractId: string, userId: string): Promise<ContractGenerationDTO | null> {
    const c = this.contracts.get(contractId);
    if (!c || c.userId !== userId) return null;
    return c;
  }

  async updateProgress(input: any): Promise<ContractGenerationDTO> {
    const c = this.contracts.get(input.contractId);
    if (!c) throw new ContractNotFoundError(input.contractId);
    if (c.userId !== input.userId)
      throw new UnauthorizedContractAccessError(input.contractId, input.userId);

    const updated = {
      ...c,
      currentQuestionIndex: input.questionIndex,
      answers: { ...c.answers, ...input.answers },
      updatedAt: new Date(),
    };
    this.contracts.set(input.contractId, updated);
    return updated;
  }

  async updateTitle(): Promise<any> {
    throw new Error('Not implemented');
  }
  async completeQuestionnaire(): Promise<any> {
    throw new Error('Not implemented');
  }
  async getNextDefaultTitle(): Promise<string> {
    return 'Mi Contrato 1';
  }
}

describe('UpdateQuestionnaireProgressUseCase', () => {
  let port: InMemoryProgressPort;
  let useCase: UpdateQuestionnaireProgressUseCase;

  beforeEach(() => {
    port = new InMemoryProgressPort();
    useCase = new UpdateQuestionnaireProgressUseCase(port);

    port.contracts.set('contract-1', {
      id: 'contract-1',
      userId: 'user-1',
      title: 'Mi Contrato 1',
      status: 'in_progress',
      currentQuestionIndex: 0,
      answers: { q0_description: 'Software' },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it('updates progress index and merges new answers', async () => {
    const result = await useCase.execute({
      contractId: 'contract-1',
      userId: 'user-1',
      questionIndex: 1,
      answers: { q1_legal_personality: 'individual' },
    });

    expect(result.currentQuestionIndex).toBe(1);
    expect(result.answers).toEqual({
      q0_description: 'Software',
      q1_legal_personality: 'individual',
    });
  });

  it('throws ContractNotFoundError if contract does not exist', async () => {
    await expect(
      useCase.execute({
        contractId: 'non-existent',
        userId: 'user-1',
        questionIndex: 1,
        answers: { q0_description: 'Software' },
      })
    ).rejects.toBeInstanceOf(ContractNotFoundError);
  });

  it('throws UnauthorizedContractAccessError if user is not the owner', async () => {
    await expect(
      useCase.execute({
        contractId: 'contract-1',
        userId: 'other-user',
        questionIndex: 1,
        answers: { q0_description: 'Software' },
      })
    ).rejects.toBeInstanceOf(UnauthorizedContractAccessError);
  });

  it('throws InvalidAnswerError if question 0 is empty when advancing beyond question 0', async () => {
    port.contracts.set('contract-empty', {
      id: 'contract-empty',
      userId: 'user-1',
      title: 'Mi Contrato 1',
      status: 'in_progress',
      currentQuestionIndex: 0,
      answers: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      useCase.execute({
        contractId: 'contract-empty',
        userId: 'user-1',
        questionIndex: 1,
        answers: {},
      })
    ).rejects.toThrow('La primera pregunta es requerida.');
  });
});
