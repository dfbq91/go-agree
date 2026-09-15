import type { ContractRepositoryPort } from '../../ports/ContractRepositoryPort.js';
import type {
  DynamicQuestionDTO,
  DynamicQuestionRepositoryPort,
} from '../../ports/DynamicQuestionRepositoryPort.js';
import type { LlmQuestionAnalysisPort } from '../../ports/LlmQuestionAnalysisPort.js';

export interface AnalyzeContractAnswersInput {
  contractId: string;
  userId: string;
  stage?: number;
}

export type AnalysisResultStatus = 'generated' | 'skipped';

export interface AnalyzeContractAnswersResult {
  status: AnalysisResultStatus;
  reason?: 'unmodified_answers';
  questions?: DynamicQuestionDTO[];
}

export class AnalyzeContractAnswersUseCase {
  constructor(
    private readonly contractRepo: ContractRepositoryPort,
    private readonly dynamicQuestionRepo: DynamicQuestionRepositoryPort,
    private readonly llmPort: LlmQuestionAnalysisPort
  ) {}

  async execute(input: AnalyzeContractAnswersInput): Promise<AnalyzeContractAnswersResult> {
    const stage = input.stage ?? 1;

    // 1. Obtener el contrato y verificar propiedad
    const contract = await this.contractRepo.getByIdAndUserId(input.contractId, input.userId);
    if (!contract) {
      throw new Error(`Contract ${input.contractId} not found or unauthorized`);
    }

    const currentAnswers = contract.answers || {};

    // 2. Consultar si ya existe un snapshot de respuestas para esta etapa
    const existingSnapshot = await this.dynamicQuestionRepo.getSnapshot(
      input.contractId,
      input.userId,
      stage
    );

    if (existingSnapshot) {
      const isUnmodified = this.areAnswersEqual(existingSnapshot, currentAnswers);
      if (isUnmodified) {
        return {
          status: 'skipped',
          reason: 'unmodified_answers',
        };
      }

      // Si las respuestas cambiaron, borramos las preguntas viejas de esta etapa para regenerar
      await this.dynamicQuestionRepo.deleteQuestionsByStage(input.contractId, input.userId, stage);
    }

    // 3. Llamar al LLM para generar exactamente 5 preguntas
    const llmResult = await this.llmPort.generateQuestions({
      answers: currentAnswers,
      stage,
    });

    // 4. Guardar las preguntas y el nuevo snapshot en la base de datos
    const questionsToSave = llmResult.questions.map((q, idx) => ({
      stage,
      questionKey: q.id,
      prompt: q.prompt,
      type: q.type,
      orderIndex: 20 + idx, // Posicionadas después de las preguntas estándar
      isRequired: q.isRequired,
      helpText: q.helpText,
      tooltip: q.tooltip,
      options: q.options,
      condition: q.condition,
    }));

    const saved = await this.dynamicQuestionRepo.saveQuestions({
      contractId: input.contractId,
      userId: input.userId,
      stage,
      answersSnapshot: currentAnswers,
      questions: questionsToSave,
    });

    return {
      status: 'generated',
      questions: saved,
    };
  }

  private areAnswersEqual(
    snapshot: Record<string, unknown>,
    current: Record<string, unknown>
  ): boolean {
    // Comparamos los campos clave del cuestionario inicial
    const keyFields = [
      'q0_party_role',
      'q1_legal_personality',
      'q2_description_conditions',
      'q3_domicile',
      'q4_breach_impact',
      'q5_modality',
      'q5a_delivery_timeframe',
      'q5b_recurring_duration',
    ];

    for (const key of keyFields) {
      const snapVal = JSON.stringify(snapshot[key] ?? null);
      const currVal = JSON.stringify(current[key] ?? null);
      if (snapVal !== currVal) {
        return false;
      }
    }
    return true;
  }
}
