/**
 * Contract Dashboard Port Interfaces & DTO Specifications
 * Specification: specs/006-contract-dashboard/spec.md
 */

export type ContractStatus = 'in_progress' | 'completed';
export type DocumentFormat = 'pdf' | 'docx';

export interface ContractDashboardItemDTO {
  id: string;
  userId: string;
  title: string;
  status: ContractStatus;
  currentQuestionIndex: number;
  questionsAnsweredCount: number;
  hasGeneratedDocument: boolean;
  availableFormats: DocumentFormat[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractGenerationDTO {
  id: string;
  userId: string;
  title: string;
  status: ContractStatus;
  currentQuestionIndex: number;
  answers: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractDocumentDTO {
  id: string;
  contractId: string;
  userId: string;
  fileFormat: DocumentFormat;
  storagePath: string;
  createdAt: Date;
}

/**
 * Port interface for contract repository operations related to dashboard
 */
export interface ContractDashboardRepositoryPort {
  /**
   * Returns all contract dashboard items for an authenticated user,
   * sorted by updatedAt descending.
   */
  listDashboardItemsByUserId(userId: string): Promise<ContractDashboardItemDTO[]>;

  /**
   * Retrieves a single contract generation by id ensuring tenant isolation.
   */
  getByIdAndUserId(id: string, userId: string): Promise<ContractGenerationDTO | null>;

  /**
   * Deletes a contract generation and cascades to dynamic questions & documents.
   */
  deleteByIdAndUserId(id: string, userId: string): Promise<void>;

  /**
   * Updates a contract's title.
   */
  updateTitle(contractId: string, userId: string, title: string): Promise<ContractGenerationDTO>;
}

/**
 * Port interface for contract document access and download
 */
export interface ContractDocumentRepositoryPort {
  /**
   * Gets document artifacts associated with a contract generation.
   */
  getDocumentsByContractId(contractId: string, userId: string): Promise<ContractDocumentDTO[]>;

  /**
   * Gets download stream or signed URL for a specific document format.
   */
  getDocumentDownloadUrl(
    contractId: string,
    userId: string,
    format: DocumentFormat
  ): Promise<string | null>;
}
