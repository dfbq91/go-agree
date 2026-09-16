import type { ContractRepositoryPort } from '../../ports/ContractRepositoryPort.js';

export interface DeleteContractRequest {
  contractId: string;
  userId: string;
}

export class DeleteContractUseCase {
  constructor(private readonly contractRepo: ContractRepositoryPort) {}

  async execute(request: DeleteContractRequest): Promise<void> {
    const contract = await this.contractRepo.getByIdAndUserId(request.contractId, request.userId);
    if (!contract) {
      throw new Error('Contract not found or access denied');
    }

    await this.contractRepo.deleteByIdAndUserId(request.contractId, request.userId);
  }
}
