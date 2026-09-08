import type {
  ContractRepositoryPort,
  ContractGenerationDTO,
  ContractGenerationSummaryDTO,
} from '../../ports/ContractRepositoryPort.js';

export class ListUserContractsUseCase {
  constructor(private readonly contractRepo: ContractRepositoryPort) {}

  async execute(userId: string): Promise<ContractGenerationSummaryDTO[]> {
    return this.contractRepo.listByUserId(userId);
  }
}

export class GetContractByIdUseCase {
  constructor(private readonly contractRepo: ContractRepositoryPort) {}

  async execute(id: string, userId: string): Promise<ContractGenerationDTO> {
    const contract = await this.contractRepo.getByIdAndUserId(id, userId);
    if (!contract) {
      throw new Error('Contract not found or access denied');
    }
    return contract;
  }
}

export class CreateContractUseCase {
  constructor(private readonly contractRepo: ContractRepositoryPort) {}

  async execute(params: { userId: string; title: string }): Promise<ContractGenerationDTO> {
    const id = `contract-${Date.now()}`;
    return this.contractRepo.create({
      id,
      userId: params.userId,
      title: params.title,
      status: 'in_progress',
      currentQuestionIndex: 0,
      answers: {},
    });
  }
}
