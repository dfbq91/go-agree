import type { ContractGenerationDTO } from './ContractRepositoryPort.js';

export type { ContractGenerationDTO };
export type ContractStatus = 'in_progress' | 'completed';

export interface UpdateProgressInput {
  contractId: string;
  userId: string;
  questionIndex: number;
  answers: Record<string, unknown>;
}

export interface UpdateTitleInput {
  contractId: string;
  userId: string;
  title: string;
}

export interface CompleteQuestionnaireInput {
  contractId: string;
  userId: string;
}

export interface ContractProgressPort {
  getContractById(contractId: string, userId: string): Promise<ContractGenerationDTO | null>;
  updateProgress(input: UpdateProgressInput): Promise<ContractGenerationDTO>;
  updateTitle(input: UpdateTitleInput): Promise<ContractGenerationDTO>;
  completeQuestionnaire(input: CompleteQuestionnaireInput): Promise<ContractGenerationDTO>;
  getNextDefaultTitle(userId: string): Promise<string>;
}
