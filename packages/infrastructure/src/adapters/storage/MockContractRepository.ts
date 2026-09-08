import type {
  ContractRepositoryPort,
  ContractGenerationDTO,
  ContractGenerationSummaryDTO,
} from '@go-agree/application';

export class MockContractRepository implements ContractRepositoryPort {
  private contracts: Map<string, ContractGenerationDTO> = new Map();

  async listByUserId(userId: string): Promise<ContractGenerationSummaryDTO[]> {
    const list: ContractGenerationSummaryDTO[] = [];
    for (const contract of this.contracts.values()) {
      if (contract.userId === userId) {
        list.push({
          id: contract.id,
          userId: contract.userId,
          title: contract.title,
          status: contract.status,
          currentQuestionIndex: contract.currentQuestionIndex,
          updatedAt: contract.updatedAt,
        });
      }
    }
    return list.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async getByIdAndUserId(id: string, userId: string): Promise<ContractGenerationDTO | null> {
    const contract = this.contracts.get(id);
    if (!contract || contract.userId !== userId) {
      return null;
    }
    return contract;
  }

  async save(contract: ContractGenerationDTO): Promise<void> {
    this.contracts.set(contract.id, {
      ...contract,
      updatedAt: new Date(),
    });
  }

  async create(
    contract: Omit<ContractGenerationDTO, 'createdAt' | 'updatedAt'>
  ): Promise<ContractGenerationDTO> {
    const now = new Date();
    const created: ContractGenerationDTO = {
      ...contract,
      createdAt: now,
      updatedAt: now,
    };
    this.contracts.set(contract.id, created);
    return created;
  }
}
