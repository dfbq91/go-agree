import { beforeEach, describe, expect, it } from 'vitest';
import {
  GetContractDocumentDownloadUseCase,
  type ContractGenerationDTO,
} from '../src/index.js';
import {
  ContractNotFoundError,
  DocumentNotFoundError,
} from '@go-agree/domain';

class MockContractRepo {
  public contracts = new Map<string, ContractGenerationDTO>();
  async getByIdAndUserId(id: string, userId: string) {
    const c = this.contracts.get(id);
    return c && c.userId === userId ? { ...c } : null;
  }
}

class MockStorageRepo {
  public docs = new Map<string, any>();
  async getDocument(params: any) {
    const key = `${params.contractId}_${params.format}`;
    return this.docs.get(key) || null;
  }
}

describe('GetContractDocumentDownloadUseCase', () => {
  let contractRepo: MockContractRepo;
  let storageRepo: MockStorageRepo;
  let useCase: GetContractDocumentDownloadUseCase;

  beforeEach(() => {
    contractRepo = new MockContractRepo();
    storageRepo = new MockStorageRepo();
    useCase = new GetContractDocumentDownloadUseCase({
      contractRepository: contractRepo as any,
      documentStorage: storageRepo as any,
    });

    contractRepo.contracts.set('cnt_1', {
      id: 'cnt_1',
      userId: 'usr_1',
      title: 'Mi Contrato',
      status: 'completed',
      currentQuestionIndex: 11,
      answers: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it('throws ContractNotFoundError if contract does not exist or user does not own it', async () => {
    await expect(
      useCase.execute({ contractId: 'cnt_other', userId: 'usr_1', format: 'pdf' })
    ).rejects.toThrow(ContractNotFoundError);
  });

  it('throws DocumentNotFoundError if requested format has not been generated', async () => {
    await expect(
      useCase.execute({ contractId: 'cnt_1', userId: 'usr_1', format: 'docx' })
    ).rejects.toThrow(DocumentNotFoundError);
  });

  it('returns document buffer and metadata when document exists', async () => {
    storageRepo.docs.set('cnt_1_pdf', {
      format: 'pdf',
      content: Buffer.from('pdf-bytes'),
      mimeType: 'application/pdf',
      filename: 'Mi_Contrato.pdf',
    });

    const result = await useCase.execute({
      contractId: 'cnt_1',
      userId: 'usr_1',
      format: 'pdf',
    });

    expect(result.filename).toBe('Mi_Contrato.pdf');
    expect(result.mimeType).toBe('application/pdf');
    expect(result.content.toString()).toBe('pdf-bytes');
  });
});
