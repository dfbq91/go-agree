/**
 * @file document-generation-port.contract.ts
 * @description Application and Domain Port Contracts for Document Generation, Assembly, and Download.
 */

export type DocumentFormat = 'pdf' | 'docx';

export interface DocumentBuffer {
  format: DocumentFormat;
  content: Buffer | Uint8Array;
  mimeType: string;
  filename: string;
}

export interface ContractPartyDTO {
  name: string;
  entityType: 'individual' | 'legal_entity';
  idNumber?: string;
  address?: string;
  details?: string;
}

export interface ContractClauseDTO {
  number: number;
  title: string;
  text: string;
}

export interface SignatureBlockDTO {
  role: 'client' | 'provider';
  partyName: string;
  idNumber?: string;
  representativeName?: string;
}

export interface AssembledContractDTO {
  contractId: string;
  title: string;
  client: ContractPartyDTO;
  provider: ContractPartyDTO;
  declarations: string[];
  operativeClauses: ContractClauseDTO[];
  dynamicClauses: ContractClauseDTO[];
  signatureBlocks: SignatureBlockDTO[];
}

/**
 * Port for compiling structured contract representation into binary files (.docx and .pdf).
 */
export interface DraftContractInput {
  contractId: string;
  title: string;
  transcript: string;
  answers: Record<string, unknown>;
}

/**
 * Port for calling the LLM to draft the complete legal contract clauses in structured JSON format.
 */
export interface LlmContractDraftingPort {
  draftContract(input: DraftContractInput): Promise<AssembledContractDTO>;
}

/**
 * Port for compiling structured contract representation into binary files (.docx and .pdf).
 */
export interface DocumentGeneratorPort {
  generateDocx(contract: AssembledContractDTO): Promise<DocumentBuffer>;
  generatePdf(contract: AssembledContractDTO): Promise<DocumentBuffer>;
}

/**
 * Port for persisting, checking, and retrieving compiled document artifacts.
 */
export interface DocumentStoragePort {
  saveDocument(params: {
    contractId: string;
    userId: string;
    format: DocumentFormat;
    buffer: Buffer | Uint8Array;
  }): Promise<{ storagePath: string; createdAt: Date }>;

  getDocument(params: {
    contractId: string;
    userId: string;
    format: DocumentFormat;
  }): Promise<DocumentBuffer | null>;

  getAvailableFormats(params: {
    contractId: string;
    userId: string;
  }): Promise<{ formats: DocumentFormat[]; lastGeneratedAt: Date | null }>;

  deleteDocuments(params: {
    contractId: string;
    userId: string;
  }): Promise<void>;
}

/**
 * Use case input/output contracts
 */
export interface GenerateDocumentInput {
  contractId: string;
  userId: string;
}

export interface GenerateDocumentResult {
  contractId: string;
  availableFormats: DocumentFormat[];
  generatedAt: Date;
}

export interface RegenerateDocumentInput {
  contractId: string;
  userId: string;
}

export interface DownloadDocumentInput {
  contractId: string;
  userId: string;
  format: DocumentFormat;
}

export interface DownloadDocumentResult {
  content: Buffer | Uint8Array;
  mimeType: string;
  filename: string;
}
