import type {
  ContractGenerationDTO,
  ContractProgressPort,
} from '../../ports/ContractProgressPort.js';
import type { LoggerPort } from '../../ports/LoggerPort.js';

export interface CompleteQuestionnaireRequest {
  contractId: string;
  userId: string;
}

export class CompleteQuestionnaireUseCase {
  constructor(
    private readonly contractProgressPort: ContractProgressPort,
    private readonly logger?: LoggerPort
  ) {}

  async execute(request: CompleteQuestionnaireRequest): Promise<ContractGenerationDTO> {
    const result = await this.contractProgressPort.completeQuestionnaire(request);
    this.logger?.info('Contract marked as completed', {
      contractId: request.contractId,
      userId: request.userId,
    });
    return result;
  }
}
