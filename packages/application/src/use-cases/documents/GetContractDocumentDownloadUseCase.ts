/**
 * @file GetContractDocumentDownloadUseCase.ts
 * @description Use case for verifying ownership and retrieving the compiled document
 * artifact (.docx or .pdf) from storage for client download streaming.
 */

import { ContractNotFoundError, DocumentNotFoundError } from '@go-agree/domain';
import type { ContractRepositoryPort } from '../../ports/ContractRepositoryPort.js';
import type { DocumentBuffer, DocumentFormat } from '../../ports/DocumentGeneratorPort.js';
import type { DocumentStoragePort } from '../../ports/DocumentStoragePort.js';
import type { LoggerPort } from '../../ports/LoggerPort.js';

export interface GetContractDocumentDownloadInput {
  contractId: string;
  userId: string;
  format: DocumentFormat;
}

export interface GetContractDocumentDownloadDependencies {
  contractRepository: ContractRepositoryPort;
  documentStorage: DocumentStoragePort;
  logger?: LoggerPort;
}

export class GetContractDocumentDownloadUseCase {
  constructor(private readonly deps: GetContractDocumentDownloadDependencies) {}

  async execute(input: GetContractDocumentDownloadInput): Promise<DocumentBuffer> {
    const { contractId, userId, format } = input;

    // 1. Assert contract exists and belongs to user
    const contract = await this.deps.contractRepository.getByIdAndUserId(contractId, userId);
    if (!contract) {
      throw new ContractNotFoundError(contractId);
    }

    // 2. Fetch document from storage
    const document = await this.deps.documentStorage.getDocument({
      contractId,
      userId,
      format,
    });

    if (!document) {
      this.deps.logger?.warn('Document not found in storage for download', {
        contractId,
        userId,
        format,
      });
      throw new DocumentNotFoundError(contractId, format);
    }

    return document;
  }
}
