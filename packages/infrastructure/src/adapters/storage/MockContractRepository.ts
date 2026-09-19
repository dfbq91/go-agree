import type {
  CompleteQuestionnaireInput,
  ContractDashboardItemDTO,
  ContractGenerationDTO,
  ContractGenerationSummaryDTO,
  ContractProgressPort,
  ContractRepositoryPort,
  DocumentFormat,
  UpdateProgressInput,
  UpdateTitleInput,
} from '@go-agree/application';
import {
  ContractNotFoundError,
  EmptyTitleError,
  UnauthorizedContractAccessError,
  calculateAnsweredQuestionsCount,
} from '@go-agree/domain';

export class MockContractRepository implements ContractRepositoryPort, ContractProgressPort {
  private contracts: Map<string, ContractGenerationDTO> = new Map();
  private documents: Map<string, DocumentFormat[]> = new Map();

  addMockDocument(contractId: string, format: DocumentFormat): void {
    const existing = this.documents.get(contractId) || [];
    if (!existing.includes(format)) {
      this.documents.set(contractId, [...existing, format]);
    }
  }

  async listDashboardItemsByUserId(userId: string): Promise<ContractDashboardItemDTO[]> {
    const list: ContractDashboardItemDTO[] = [];
    for (const contract of this.contracts.values()) {
      if (contract.userId === userId) {
        const formats = this.documents.get(contract.id) || [];
        const answeredCount = calculateAnsweredQuestionsCount(contract.answers);

        list.push({
          id: contract.id,
          userId: contract.userId,
          title: contract.title,
          status: contract.status,
          currentQuestionIndex: contract.currentQuestionIndex,
          questionsAnsweredCount: answeredCount,
          hasGeneratedDocument: formats.length > 0,
          availableFormats: formats,
          isRegenerationPending: false,
          createdAt: contract.createdAt,
          updatedAt: contract.updatedAt,
        });
      }
    }
    return list.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async deleteByIdAndUserId(id: string, userId: string): Promise<void> {
    const contract = this.contracts.get(id);
    if (!contract || contract.userId !== userId) {
      throw new ContractNotFoundError(id);
    }
    this.contracts.delete(id);
    this.documents.delete(id);
  }

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
    return { ...contract, answers: { ...contract.answers } };
  }

  async getContractById(contractId: string, userId: string): Promise<ContractGenerationDTO | null> {
    return this.getByIdAndUserId(contractId, userId);
  }

  async save(contract: ContractGenerationDTO): Promise<void> {
    this.contracts.set(contract.id, {
      ...contract,
      answers: { ...contract.answers },
      updatedAt: new Date(),
    });
  }

  async create(
    contract: Omit<ContractGenerationDTO, 'createdAt' | 'updatedAt'>
  ): Promise<ContractGenerationDTO> {
    const now = new Date();
    const created: ContractGenerationDTO = {
      ...contract,
      answers: { ...contract.answers },
      createdAt: now,
      updatedAt: now,
    };
    this.contracts.set(contract.id, created);
    return { ...created, answers: { ...created.answers } };
  }

  async updateProgress(input: UpdateProgressInput): Promise<ContractGenerationDTO> {
    const contract = this.contracts.get(input.contractId);
    if (!contract) {
      throw new ContractNotFoundError(input.contractId);
    }
    if (contract.userId !== input.userId) {
      throw new UnauthorizedContractAccessError(input.contractId, input.userId);
    }

    const updated: ContractGenerationDTO = {
      ...contract,
      currentQuestionIndex: input.questionIndex,
      answers: { ...contract.answers, ...input.answers },
      updatedAt: new Date(),
    };

    this.contracts.set(input.contractId, updated);
    return { ...updated, answers: { ...updated.answers } };
  }

  async updateTitle(input: UpdateTitleInput): Promise<ContractGenerationDTO> {
    if (!input.title || input.title.trim().length === 0) {
      throw new EmptyTitleError();
    }

    const contract = this.contracts.get(input.contractId);
    if (!contract) {
      throw new ContractNotFoundError(input.contractId);
    }
    if (contract.userId !== input.userId) {
      throw new UnauthorizedContractAccessError(input.contractId, input.userId);
    }

    const updated: ContractGenerationDTO = {
      ...contract,
      title: input.title.trim(),
      updatedAt: new Date(),
    };

    this.contracts.set(input.contractId, updated);
    return { ...updated, answers: { ...updated.answers } };
  }

  async completeQuestionnaire(input: CompleteQuestionnaireInput): Promise<ContractGenerationDTO> {
    const contract = this.contracts.get(input.contractId);
    if (!contract) {
      throw new ContractNotFoundError(input.contractId);
    }
    if (contract.userId !== input.userId) {
      throw new UnauthorizedContractAccessError(input.contractId, input.userId);
    }

    const updated: ContractGenerationDTO = {
      ...contract,
      status: 'completed',
      updatedAt: new Date(),
    };

    this.contracts.set(input.contractId, updated);
    return { ...updated, answers: { ...updated.answers } };
  }

  async getNextDefaultTitle(userId: string): Promise<string> {
    let count = 0;
    for (const contract of this.contracts.values()) {
      if (contract.userId === userId) {
        count++;
      }
    }
    return `Mi Contrato ${count + 1}`;
  }
}
