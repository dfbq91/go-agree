import type { ContractProgressPort, ContractGenerationDTO } from '../../ports/ContractProgressPort.js';

export interface CompleteQuestionnaireRequest {
  contractId: string;
  userId: string;
}

export class CompleteQuestionnaireUseCase {
  constructor(private readonly contractProgressPort: ContractProgressPort) {}

  async execute(request: CompleteQuestionnaireRequest): Promise<ContractGenerationDTO> {
    return this.contractProgressPort.completeQuestionnaire(request);
  }
}
