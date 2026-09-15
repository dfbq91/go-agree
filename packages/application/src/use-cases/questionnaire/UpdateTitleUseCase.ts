import type {
  ContractGenerationDTO,
  ContractProgressPort,
} from '../../ports/ContractProgressPort.js';

export interface UpdateTitleRequest {
  contractId: string;
  userId: string;
  title: string;
}

export class UpdateTitleUseCase {
  constructor(private readonly contractProgressPort: ContractProgressPort) {}

  async execute(request: UpdateTitleRequest): Promise<ContractGenerationDTO> {
    return this.contractProgressPort.updateTitle(request);
  }
}
