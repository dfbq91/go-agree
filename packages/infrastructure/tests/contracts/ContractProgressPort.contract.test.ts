import { EmptyTitleError } from '@go-agree/domain';
import { beforeEach, describe, expect, it } from 'vitest';
import { MockContractRepository } from '../../src/adapters/storage/MockContractRepository.js';

describe('ContractProgressPort Contract Tests (MockContractRepository)', () => {
  let repo: MockContractRepository;

  beforeEach(async () => {
    repo = new MockContractRepository();
    await repo.create({
      id: 'contract-123',
      userId: 'user-abc',
      title: 'Mi Contrato 1',
      status: 'in_progress',
      currentQuestionIndex: 0,
      answers: { q0_description: 'Servicio' },
    });
  });

  it('retrieves contract by id and userId', async () => {
    const found = await repo.getContractById('contract-123', 'user-abc');
    expect(found).not.toBeNull();
    expect(found?.id).toBe('contract-123');

    const wrongUser = await repo.getContractById('contract-123', 'other-user');
    expect(wrongUser).toBeNull();
  });

  it('updates progress index and merges answers', async () => {
    const updated = await repo.updateProgress({
      contractId: 'contract-123',
      userId: 'user-abc',
      questionIndex: 2,
      answers: { q1_legal_personality: 'individual' },
    });

    expect(updated.currentQuestionIndex).toBe(2);
    expect(updated.answers).toEqual({
      q0_description: 'Servicio',
      q1_legal_personality: 'individual',
    });
  });

  it('updates title and rejects empty title', async () => {
    const updated = await repo.updateTitle({
      contractId: 'contract-123',
      userId: 'user-abc',
      title: 'Nuevo Titulo',
    });
    expect(updated.title).toBe('Nuevo Titulo');

    await expect(
      repo.updateTitle({
        contractId: 'contract-123',
        userId: 'user-abc',
        title: '   ',
      })
    ).rejects.toBeInstanceOf(EmptyTitleError);
  });

  it('marks questionnaire completed', async () => {
    const completed = await repo.completeQuestionnaire({
      contractId: 'contract-123',
      userId: 'user-abc',
    });
    expect(completed.status).toBe('completed');
  });

  it('calculates next default title sequentially', async () => {
    const title1 = await repo.getNextDefaultTitle('user-abc');
    expect(title1).toBe('Mi Contrato 2'); // 1 already exists
  });
});
