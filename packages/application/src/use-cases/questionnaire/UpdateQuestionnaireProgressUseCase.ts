import { InvalidAnswerError } from '@go-agree/domain';
import type {
  ContractGenerationDTO,
  ContractProgressPort,
} from '../../ports/ContractProgressPort.js';
import type { QuestionnaireEnginePort } from '../../ports/QuestionnaireEnginePort.js';

export interface UpdateQuestionnaireProgressRequest {
  contractId: string;
  userId: string;
  questionIndex: number;
  answers: Record<string, unknown>;
}

export class UpdateQuestionnaireProgressUseCase {
  constructor(
    private readonly contractProgressPort: ContractProgressPort,
    private readonly enginePort?: QuestionnaireEnginePort
  ) {}

  async execute(request: UpdateQuestionnaireProgressRequest): Promise<ContractGenerationDTO> {
    const q0 = request.answers.q0_party_role ?? request.answers.q0_description;
    if (q0 !== undefined && (typeof q0 !== 'string' || q0.trim().length === 0)) {
      throw new InvalidAnswerError('q0_party_role', 'La primera pregunta es requerida.');
    }

    if (request.questionIndex > 0 && (!q0 || (typeof q0 === 'string' && q0.trim().length === 0))) {
      const existing = await this.contractProgressPort.getContractById(
        request.contractId,
        request.userId
      );
      const existingQ0 = existing?.answers?.q0_party_role ?? existing?.answers?.q0_description;
      if (!existingQ0 || (typeof existingQ0 === 'string' && existingQ0.trim().length === 0)) {
        throw new InvalidAnswerError('q0_party_role', 'La primera pregunta es requerida.');
      }
    }

    const answersToSave = this.enginePort
      ? this.enginePort.pruneObsoleteAnswers(request.answers)
      : request.answers;

    return this.contractProgressPort.updateProgress({
      ...request,
      answers: answersToSave,
    });
  }
}
