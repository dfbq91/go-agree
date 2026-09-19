import { beforeEach, describe, expect, it } from 'vitest';
import {
  GenerateContractDocumentUseCase,
  type ContractGenerationDTO,
} from '../src/index.js';
import {
  ContractNotFoundError,
  IncompleteQuestionnaireError,
  QuestionnaireDefinition,
} from '@go-agree/domain';

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
      content: Buffer.from('docx'),
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      filename: 'contract.docx',
    };
  }
  async generatePdf() {
    return {
      format: 'pdf' as const,
      content: Buffer.from('pdf'),
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

describe('GenerateContractDocumentUseCase', () => {
  let contractRepo: MockContractRepo;
  let dynamicRepo: MockDynamicRepo;
  let llmPort: MockLlmPort;
  let genPort: MockGenPort;
  let storagePort: MockStoragePort;
  let useCase: GenerateContractDocumentUseCase;

  const standardQ = QuestionnaireDefinition.createStandard();
  const allAnswers: Record<string, unknown> = {};
  for (const q of standardQ.questions) {
    allAnswers[q.id] = q.type === 'single_choice' && q.options?.[0] ? q.options[0].value : 'Respuesta válida';
  }

  beforeEach(() => {
    contractRepo = new MockContractRepo();
    dynamicRepo = new MockDynamicRepo();
    llmPort = new MockLlmPort();
    genPort = new MockGenPort();
    storagePort = new MockStoragePort();

    useCase = new GenerateContractDocumentUseCase({
      contractRepository: contractRepo as any,
      dynamicQuestionRepository: dynamicRepo as any,
      llmContractDrafting: llmPort as any,
      documentGenerator: genPort as any,
      documentStorage: storagePort as any,
    });
  });

  it('throws ContractNotFoundError if contract does not exist', async () => {
    await expect(
      useCase.execute({ contractId: 'cnt_nonexistent', userId: 'usr_1' })
    ).rejects.toThrow(ContractNotFoundError);
  });

  it('throws IncompleteQuestionnaireError if any required question is missing', async () => {
    contractRepo.contracts.set('cnt_incomplete', {
      id: 'cnt_incomplete',
      userId: 'usr_1',
      title: 'Contrato Incompleto',
      status: 'in_progress',
      currentQuestionIndex: 1,
      answers: { q0_party_role: 'client' }, // Missing subsequent questions
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      useCase.execute({ contractId: 'cnt_incomplete', userId: 'usr_1' })
    ).rejects.toThrow(IncompleteQuestionnaireError);
  });

  it('drafts and generates both docx and pdf files when questionnaire is 100% complete', async () => {
    contractRepo.contracts.set('cnt_complete', {
      id: 'cnt_complete',
      userId: 'usr_1',
      title: 'Contrato Completo',
      status: 'in_progress',
      currentQuestionIndex: 11,
      answers: allAnswers,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute({ contractId: 'cnt_complete', userId: 'usr_1' });

    expect(result.contractId).toBe('cnt_complete');
    expect(result.availableFormats).toContain('docx');
    expect(result.availableFormats).toContain('pdf');

    expect(storagePort.saved).toHaveLength(2);
    const updatedContract = await contractRepo.getByIdAndUserId('cnt_complete', 'usr_1');
    expect(updatedContract?.status).toBe('completed');
  });

  it('validates dynamic questions keyed by questionKey and passes answers to transcript', async () => {
    dynamicRepo.dynamicQuestions = [
      {
        id: 'ebb18a38-e24b-4c6d-8320-8032fd46ace6',
        contractId: 'cnt_dynamic_complete',
        userId: 'usr_1',
        stage: 1,
        questionKey: 'dyn_payment_terms',
        prompt: '¿Cuáles son los términos de pago pactados?',
        type: 'open_text',
        orderIndex: 20,
        isRequired: true,
        createdAt: new Date(),
      },
    ];

    contractRepo.contracts.set('cnt_dynamic_complete', {
      id: 'cnt_dynamic_complete',
      userId: 'usr_1',
      title: 'Contrato con Pregunta Dinámica',
      status: 'in_progress',
      currentQuestionIndex: 12,
      answers: {
        ...allAnswers,
        dyn_payment_terms: '50% anticipo, 50% contra entrega',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute({
      contractId: 'cnt_dynamic_complete',
      userId: 'usr_1',
    });

    expect(result.contractId).toBe('cnt_dynamic_complete');
    expect(result.availableFormats).toContain('docx');
    expect(result.availableFormats).toContain('pdf');

    // Verify transcript received the dynamic question answer
    expect(llmPort.lastInput).toBeDefined();
    expect(llmPort.lastInput.transcript).toContain('--- PREGUNTAS DE PROFUNDIZACIÓN Y RIESGOS ---');
    expect(llmPort.lastInput.transcript).toContain('[dyn_payment_terms]');
    expect(llmPort.lastInput.transcript).toContain('50% anticipo, 50% contra entrega');
  });

  it('throws IncompleteQuestionnaireError listing questionKey when dynamic question is unanswered', async () => {
    dynamicRepo.dynamicQuestions = [
      {
        id: 'ebb18a38-e24b-4c6d-8320-8032fd46ace6',
        contractId: 'cnt_dynamic_incomplete',
        userId: 'usr_1',
        stage: 1,
        questionKey: 'dyn_confidentiality_duration',
        prompt: '¿Cuál es la duración de la confidencialidad?',
        type: 'open_text',
        orderIndex: 20,
        isRequired: true,
        createdAt: new Date(),
      },
    ];

    contractRepo.contracts.set('cnt_dynamic_incomplete', {
      id: 'cnt_dynamic_incomplete',
      userId: 'usr_1',
      title: 'Contrato Incompleto Dinámico',
      status: 'in_progress',
      currentQuestionIndex: 12,
      answers: allAnswers, // Missing dyn_confidentiality_duration
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      useCase.execute({ contractId: 'cnt_dynamic_incomplete', userId: 'usr_1' })
    ).rejects.toThrow(IncompleteQuestionnaireError);

    try {
      await useCase.execute({ contractId: 'cnt_dynamic_incomplete', userId: 'usr_1' });
    } catch (err: any) {
      expect(err.message).toContain('dyn_confidentiality_duration');
      expect(err.message).not.toContain('ebb18a38-e24b-4c6d-8320-8032fd46ace6');
    }
  });
});
