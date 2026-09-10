import type { SaveDynamicQuestionsInput } from '@go-agree/application';
import { beforeEach, describe, expect, it } from 'vitest';
import { MockDynamicQuestionRepository } from '../../src/adapters/storage/MockDynamicQuestionRepository.js';

describe('DynamicQuestionRepositoryPort Contract Tests (MockDynamicQuestionRepository)', () => {
  let repo: MockDynamicQuestionRepository;

  beforeEach(() => {
    repo = new MockDynamicQuestionRepository();
  });

  it('saves dynamic questions and records the answers snapshot', async () => {
    const input: SaveDynamicQuestionsInput = {
      contractId: 'contract-123',
      userId: 'user-abc',
      stage: 1,
      answersSnapshot: { q0_party_role: 'client', q2_description_conditions: 'Software' },
      questions: [
        {
          stage: 1,
          questionKey: 'dyn_payment_terms',
          prompt: '¿Cómo se realizarán los pagos?',
          type: 'single_choice',
          orderIndex: 20,
          isRequired: true,
          helpText: 'Define los hitos de pago.',
          options: [
            { id: 'opt_1', label: '50% anticipo, 50% entrega', value: '50_50' },
            { id: 'opt_other', label: 'Otro (especificar)', value: 'other' },
          ],
        },
      ],
    };

    const saved = await repo.saveQuestions(input);

    expect(saved).toHaveLength(1);
    expect(saved[0].id).toBeDefined();
    expect(saved[0].questionKey).toBe('dyn_payment_terms');
    expect(saved[0].stage).toBe(1);

    // Verificar que el snapshot quedó registrado
    const snapshot = await repo.getSnapshot('contract-123', 'user-abc', 1);
    expect(snapshot).toEqual({ q0_party_role: 'client', q2_description_conditions: 'Software' });
  });

  it('isolates dynamic questions by userId and contractId', async () => {
    await repo.saveQuestions({
      contractId: 'contract-123',
      userId: 'user-abc',
      stage: 1,
      answersSnapshot: {},
      questions: [
        {
          stage: 1,
          questionKey: 'dyn_1',
          prompt: 'Pregunta 1',
          type: 'open_text',
          orderIndex: 20,
          isRequired: true,
        },
      ],
    });

    // Mismo contrato pero otro usuario: no debe ver nada
    const wrongUser = await repo.getQuestionsByContractId('contract-123', 'other-user');
    expect(wrongUser).toHaveLength(0);

    // Mismo usuario pero otro contrato: no debe ver nada
    const wrongContract = await repo.getQuestionsByContractId('other-contract', 'user-abc');
    expect(wrongContract).toHaveLength(0);

    // Usuario y contrato correctos:
    const correct = await repo.getQuestionsByContractId('contract-123', 'user-abc');
    expect(correct).toHaveLength(1);
  });

  it('deletes previous questions of a specific stage when regenerating', async () => {
    await repo.saveQuestions({
      contractId: 'contract-123',
      userId: 'user-abc',
      stage: 1,
      answersSnapshot: {},
      questions: [
        {
          stage: 1,
          questionKey: 'dyn_old',
          prompt: 'Pregunta Vieja',
          type: 'open_text',
          orderIndex: 20,
          isRequired: true,
        },
      ],
    });

    await repo.deleteQuestionsByStage('contract-123', 'user-abc', 1);

    const questions = await repo.getQuestionsByContractId('contract-123', 'user-abc');
    expect(questions).toHaveLength(0);
  });
});
