import type {
  DynamicQuestionDTO,
  DynamicQuestionRepositoryPort,
  SaveDynamicQuestionsInput,
} from '@go-agree/application';

const generateId = (): string => {
  if (typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `dyn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

export class MockDynamicQuestionRepository implements DynamicQuestionRepositoryPort {
  private questions: DynamicQuestionDTO[] = [];
  private snapshots: Map<string, Record<string, unknown>> = new Map();

  async saveQuestions(input: SaveDynamicQuestionsInput): Promise<DynamicQuestionDTO[]> {
    // Guardar el snapshot
    const snapshotKey = `${input.contractId}:${input.userId}:${input.stage}`;
    this.snapshots.set(snapshotKey, { ...input.answersSnapshot });

    // Crear y almacenar las preguntas
    const now = new Date();
    const created: DynamicQuestionDTO[] = input.questions.map((q) => ({
      id: generateId(),
      contractId: input.contractId,
      userId: input.userId,
      stage: q.stage,
      questionKey: q.questionKey,
      prompt: q.prompt,
      type: q.type,
      orderIndex: q.orderIndex,
      isRequired: q.isRequired,
      helpText: q.helpText,
      tooltip: q.tooltip,
      options: q.options,
      condition: q.condition,
      createdAt: now,
    }));

    this.questions.push(...created);
    return created;
  }

  async getQuestionsByContractId(contractId: string, userId: string): Promise<DynamicQuestionDTO[]> {
    return this.questions
      .filter((q) => q.contractId === contractId && q.userId === userId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async getSnapshot(contractId: string, userId: string, stage: number): Promise<Record<string, unknown> | null> {
    const snapshotKey = `${contractId}:${userId}:${stage}`;
    return this.snapshots.get(snapshotKey) || null;
  }

  async deleteQuestionsByStage(contractId: string, userId: string, stage: number): Promise<void> {
    this.questions = this.questions.filter(
      (q) => !(q.contractId === contractId && q.userId === userId && q.stage === stage)
    );
  }
}
