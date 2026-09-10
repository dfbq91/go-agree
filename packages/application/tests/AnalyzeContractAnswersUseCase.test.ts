import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    AnalyzeContractAnswersUseCase,
    type ContractRepositoryPort,
    type DynamicQuestionRepositoryPort,
    type LlmQuestionAnalysisPort,
    type QuestionDTO
} from '../src/index.js';

describe('AnalyzeContractAnswersUseCase (Idempotency & Orchestration)', () => {
  let useCase: AnalyzeContractAnswersUseCase;
  let mockContractRepo: Partial<ContractRepositoryPort>;
  let mockDynamicQuestionRepo: Partial<DynamicQuestionRepositoryPort>;
  let mockLlmPort: Partial<LlmQuestionAnalysisPort>;

  const sampleContract = {
    id: 'contract-123',
    userId: 'user-abc',
    title: 'Mi Contrato',
    status: 'in_progress' as const,
    currentQuestionIndex: 5,
    answers: {
      q0_party_role: 'client',
      q1_legal_personality: 'individual',
      q2_description_conditions: 'Desarrollo web',
      q3_domicile: 'Bogotá',
      q4_breach_impact: 'Pérdida de clientes',
      q5_modality: 'recurring',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const sampleGeneratedQuestions: QuestionDTO[] = [
    {
      id: 'dyn_1',
      order: 10,
      prompt: '¿Cuáles son los hitos de entrega?',
      type: 'open_text',
      isRequired: true,
      helpText: 'Define entregables específicos.',
    },
  ];

  beforeEach(() => {
    mockContractRepo = {
      getByIdAndUserId: vi.fn().mockResolvedValue(sampleContract),
    };

    mockDynamicQuestionRepo = {
      getSnapshot: vi.fn().mockResolvedValue(null),
      saveQuestions: vi.fn().mockImplementation(async (input) => {
        return input.questions.map((q: any, i: number) => ({
          id: `saved-${i}`,
          contractId: input.contractId,
          userId: input.userId,
          ...q,
          createdAt: new Date(),
        }));
      }),
      deleteQuestionsByStage: vi.fn().mockResolvedValue(undefined),
      getQuestionsByContractId: vi.fn().mockResolvedValue([]),
    };

    mockLlmPort = {
      generateQuestions: vi.fn().mockResolvedValue({
        questions: sampleGeneratedQuestions,
      }),
    };

    useCase = new AnalyzeContractAnswersUseCase(
      mockContractRepo as ContractRepositoryPort,
      mockDynamicQuestionRepo as DynamicQuestionRepositoryPort,
      mockLlmPort as LlmQuestionAnalysisPort
    );
  });

  it('generates and saves questions on the first analysis run', async () => {
    const result = await useCase.execute({
      contractId: 'contract-123',
      userId: 'user-abc',
      stage: 1,
    });

    expect(result.status).toBe('generated');
    expect(mockLlmPort.generateQuestions).toHaveBeenCalledTimes(1);
    expect(mockDynamicQuestionRepo.saveQuestions).toHaveBeenCalledTimes(1);
  });

  it('skips LLM call when answers have NOT changed since last snapshot', async () => {
    // Simulamos que ya existía un snapshot con las mismas respuestas
    mockDynamicQuestionRepo.getSnapshot = vi.fn().mockResolvedValue({
      q0_party_role: 'client',
      q1_legal_personality: 'individual',
      q2_description_conditions: 'Desarrollo web',
      q3_domicile: 'Bogotá',
      q4_breach_impact: 'Pérdida de clientes',
      q5_modality: 'recurring',
    });

    const result = await useCase.execute({
      contractId: 'contract-123',
      userId: 'user-abc',
      stage: 1,
    });

    expect(result.status).toBe('skipped');
    expect(result.reason).toBe('unmodified_answers');
    // VERIFICACIÓN CLAVE: No debe llamar al LLM
    expect(mockLlmPort.generateQuestions).not.toHaveBeenCalled();
  });

  it('regenerates questions and replaces previous ones if answers changed', async () => {
    // Snapshot anterior con respuesta vieja ("Pintura de oficina")
    mockDynamicQuestionRepo.getSnapshot = vi.fn().mockResolvedValue({
      q0_party_role: 'client',
      q2_description_conditions: 'Pintura de oficina',
    });

    const result = await useCase.execute({
      contractId: 'contract-123',
      userId: 'user-abc',
      stage: 1,
    });

    expect(result.status).toBe('generated');
    // Debe borrar las preguntas anteriores de esa etapa
    expect(mockDynamicQuestionRepo.deleteQuestionsByStage).toHaveBeenCalledWith(
      'contract-123',
      'user-abc',
      1
    );
    // Debe llamar al LLM con la nueva información
    expect(mockLlmPort.generateQuestions).toHaveBeenCalledTimes(1);
  });

  it('throws error if contract does not exist or does not belong to user', async () => {
    mockContractRepo.getByIdAndUserId = vi.fn().mockResolvedValue(null);

    await expect(
      useCase.execute({
        contractId: 'other-id',
        userId: 'user-abc',
      })
    ).rejects.toThrow();
  });
});
