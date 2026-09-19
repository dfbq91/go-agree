import type { DocumentFormat } from './DocumentGeneratorPort.js';

export interface ContractGenerationDTO {
  id: string;
  userId: string;
  title: string;
  status: 'in_progress' | 'completed';
  currentQuestionIndex: number;
  answers: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractGenerationSummaryDTO {
  id: string;
  userId: string;
  title: string;
  status: 'in_progress' | 'completed';
  currentQuestionIndex: number;
  updatedAt: Date;
}

export interface ContractDashboardItemDTO {
  id: string;
  userId: string;
  title: string;
  status: 'in_progress' | 'completed';
  currentQuestionIndex: number;
  questionsAnsweredCount: number;
  hasGeneratedDocument: boolean;
  availableFormats: DocumentFormat[];
  isRegenerationPending?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractRepositoryPort {
  listByUserId(userId: string): Promise<ContractGenerationSummaryDTO[]>;
  listDashboardItemsByUserId(userId: string): Promise<ContractDashboardItemDTO[]>;
  getByIdAndUserId(id: string, userId: string): Promise<ContractGenerationDTO | null>;
  save(contract: ContractGenerationDTO): Promise<void>;
  create(
    contract: Omit<ContractGenerationDTO, 'createdAt' | 'updatedAt'>
  ): Promise<ContractGenerationDTO>;
  deleteByIdAndUserId(id: string, userId: string): Promise<void>;
}
