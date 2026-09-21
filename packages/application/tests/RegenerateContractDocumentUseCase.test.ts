import {
  ContractNotFoundError,
  IncompleteQuestionnaireError,
  QuestionnaireDefinition,
} from '@go-agree/domain';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type ContractGenerationDTO, RegenerateContractDocumentUseCase } from '../src/index.js';

class MockContractRepo {
  public contracts = new Map<string, ContractGenerationDTO>();
  async getByIdAndUserId(id: string, userId: string) {
    const c = this.contracts.get(id);
    return c && c.userId === userId ? { ...c } : null;
  }
  async save(c: ContractGenerationDTO) {
    this.contracts.set(c.id, { ...c });
  }
}

class MockDynamicRepo {
  public dynamicQuestions: any[] = [];
  async getQuestionsByContractId() {
    return this.dynamicQuestions;
  }
}

class MockLlmPort {
  public lastInput: any = null;
  async draftContract(input: any) {
    this.lastInput = input;
    return {
      contractId: input.contractId,
      title: input.title,
      client: { name: 'Cliente', entityType: 'individual' as const },
      provider: { name: 'Proveedor', entityType: 'individual' as const },
      declarations: [],
      operativeClauses: [{ number: 1, title: 'Objeto', text: 'Objeto pactado' }],
      dynamicClauses: [],
      signatureBlocks: [],
    };
  }
}

class MockGenPort {
  async generateDocx() {
    return {
      format: 'docx' as const,
      content: Buffer.from('regenerated-docx'),
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      filename: 'contract.docx',
    };
  }
  async generatePdf() {
    return {
      format: 'pdf' as const,
      content: Buffer.from('regenerated-pdf'),
      mimeType: 'application/pdf',
      filename: 'contract.pdf',
    };
  }
}

class MockStoragePort {
  public saved: any[] = [];
  async saveDocument(params: any) {
    this.saved.push(params);
    return { storagePath: `path/${params.format}`, createdAt: new Date() };
  }
  async getDocument() {
    return null;
  }
  async getAvailableFormats() {
    return { formats: ['docx' as const, 'pdf' as const], lastGeneratedAt: new Date() };
  }
  async deleteDocuments() {}
}

describe('RegenerateContractDocumentUseCase (User Story 3 - Document Regeneration)', () => {
  let contractRepo: MockContractRepo;
  let dynamicRepo: MockDynamicRepo;
  let llmPort: MockLlmPort;
  let genPort: MockGenPort;
  let storagePort: MockStoragePort;
  let useCase: RegenerateContractDocumentUseCase;

  const standardQ = QuestionnaireDefinition.createStandard();
  const allAnswers: Record<string, unknown> = {};
  for (const q of standardQ.questions) {
    allAnswers[q.id] =
      q.type === 'single_choice' && q.options?.[0]
        ? q.options[0].value
        : 'Respuesta válida inicial';
  }

  beforeEach(() => {
    contractRepo = new MockContractRepo();
    dynamicRepo = new MockDynamicRepo();
    llmPort = new MockLlmPort();
    genPort = new MockGenPort();
    storagePort = new MockStoragePort();

    useCase = new RegenerateContractDocumentUseCase({
      contractRepository: contractRepo as any,
      dynamicQuestionRepository: dynamicRepo as any,
      llmContractDrafting: llmPort as any,
      documentGenerator: genPort as any,
      documentStorage: storagePort as any,
    });
  });

  it('throws ContractNotFoundError if contract does not exist or user does not own it', async () => {
    await expect(
      useCase.execute({ contractId: 'cnt_nonexistent', userId: 'usr_1' })
    ).rejects.toThrow(ContractNotFoundError);
  });

  it('throws IncompleteQuestionnaireError if modified answers leave required questions unanswered', async () => {
    contractRepo.contracts.set('cnt_completed_but_missing', {
      id: 'cnt_completed_but_missing',
      userId: 'usr_1',
      title: 'Contrato Faltante',
      status: 'completed',
      currentQuestionIndex: 11,
      answers: { q0_party_role: 'client' }, // Missing questions
      createdAt: new Date('2026-09-01T00:00:00Z'),
      updatedAt: new Date('2026-09-02T00:00:00Z'),
    });

    await expect(
      useCase.execute({ contractId: 'cnt_completed_but_missing', userId: 'usr_1' })
    ).rejects.toThrow(IncompleteQuestionnaireError);
  });

  it('re-synthesizes contract with updated answers and overwrites previous artifacts in storage', async () => {
    const updatedAnswers = {
      ...allAnswers,
      q2_description_conditions: 'Servicio de auditoría técnica avanzada modificado',
    };

    contractRepo.contracts.set('cnt_regenerate_1', {
      id: 'cnt_regenerate_1',
      userId: 'usr_1',
      title: 'Contrato de Auditoría',
      status: 'completed',
      currentQuestionIndex: 11,
      answers: updatedAnswers,
      createdAt: new Date('2026-09-01T00:00:00Z'),
      updatedAt: new Date('2026-09-02T12:00:00Z'),
    });

    const result = await useCase.execute({ contractId: 'cnt_regenerate_1', userId: 'usr_1' });

    expect(result.contractId).toBe('cnt_regenerate_1');
    expect(result.availableFormats).toEqual(['docx', 'pdf']);
    expect(result.regeneratedAt).toBeInstanceOf(Date);

    // Verify LLM received updated answers
    expect(llmPort.lastInput.answers.q2_description_conditions).toBe(
      'Servicio de auditoría técnica avanzada modificado'
    );
    expect(llmPort.lastInput.transcript).toContain(
      'Servicio de auditoría técnica avanzada modificado'
    );

    // Verify storage received both formats to overwrite
    expect(storagePort.saved).toHaveLength(2);
    expect(storagePort.saved[0].format).toBe('docx');
    expect(storagePort.saved[0].buffer.toString()).toBe('regenerated-docx');
    expect(storagePort.saved[1].format).toBe('pdf');
    expect(storagePort.saved[1].buffer.toString()).toBe('regenerated-pdf');

    // Verify contract stays completed and updatedAt is refreshed
    const updatedContract = await contractRepo.getByIdAndUserId('cnt_regenerate_1', 'usr_1');
    expect(updatedContract?.status).toBe('completed');
    expect(updatedContract?.updatedAt.getTime()).toBeGreaterThanOrEqual(
      new Date('2026-09-02T12:00:00Z').getTime()
    );
    // Verify document regeneration timestamp is >= contract updatedAt (ensuring isRegenerationPending is false)
    expect(result.regeneratedAt.getTime()).toBeGreaterThanOrEqual(
      updatedContract!.updatedAt.getTime()
    );
  });

  it('never deducts quota credits on regeneration even if a subscriptionRepository is present and free quota is exhausted', async () => {
    const mockSubRepo = {
      getByUserId: vi.fn().mockResolvedValue({
        userId: 'usr_1',
        planType: 'free',
        status: 'active',
        freeContractsUsed: 3, // Exhausted quota
      }),
      incrementFreeContractCount: vi.fn(),
    };

    const useCaseWithSub = new RegenerateContractDocumentUseCase({
      contractRepository: contractRepo as any,
      dynamicQuestionRepository: dynamicRepo as any,
      llmContractDrafting: llmPort as any,
      documentGenerator: genPort as any,
      documentStorage: storagePort as any,
      subscriptionRepository: mockSubRepo as any,
    });

    contractRepo.contracts.set('cnt_quota_free', {
      id: 'cnt_quota_free',
      userId: 'usr_1',
      title: 'Contrato Quota Free',
      status: 'completed',
      currentQuestionIndex: 11,
      answers: allAnswers,
      createdAt: new Date('2026-09-01T00:00:00Z'),
      updatedAt: new Date('2026-09-02T00:00:00Z'),
    });

    const result = await useCaseWithSub.execute({ contractId: 'cnt_quota_free', userId: 'usr_1' });
    expect(result.contractId).toBe('cnt_quota_free');
    expect(mockSubRepo.incrementFreeContractCount).not.toHaveBeenCalled();
  });
});
