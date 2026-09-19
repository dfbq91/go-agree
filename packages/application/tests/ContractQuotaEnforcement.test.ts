import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  GenerateContractDocumentUseCase,
  RegenerateContractDocumentUseCase,
  type ContractGenerationDTO,
  type SubscriptionRepositoryPort,
  type UserSubscriptionDTO,
} from '../src/index.js';
import {
  FreeQuotaExceededError,
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

class MockSubscriptionRepo implements SubscriptionRepositoryPort {
  public subscriptions = new Map<string, UserSubscriptionDTO>();
  public incrementCalls: string[] = [];

  async getByUserId(userId: string): Promise<UserSubscriptionDTO> {
    const existing = this.subscriptions.get(userId);
    if (existing) return existing;
    return {
      id: `sub_${userId}`,
      userId,
      planType: 'free',
      status: 'active',
      freeContractsUsed: 0,
      startedAt: new Date().toISOString(),
      expiresAt: null,
      currentPeriodBillingCycle: null,
      lastPaymentTransactionId: null,
    };
  }

  async save(sub: UserSubscriptionDTO): Promise<void> {
    this.subscriptions.set(sub.userId, sub);
  }

  async incrementFreeContractCount(userId: string): Promise<number> {
    this.incrementCalls.push(userId);
    const sub = await this.getByUserId(userId);
    const updated: UserSubscriptionDTO = {
      ...sub,
      freeContractsUsed: sub.freeContractsUsed + 1,
    };
    this.subscriptions.set(userId, updated);
    return updated.freeContractsUsed;
  }

  async activateProPlan(userId: string): Promise<void> {
    const sub = await this.getByUserId(userId);
    this.subscriptions.set(userId, {
      ...sub,
      planType: 'pro',
      status: 'active',
    });
  }

  async expireSubscriptions(): Promise<number> {
    return 0;
  }
}

describe('Contract Quota Enforcement and Exemption (US4)', () => {
  let contractRepo: MockContractRepo;
  let dynamicRepo: MockDynamicRepo;
  let llmPort: MockLlmPort;
  let genPort: MockGenPort;
  let storagePort: MockStoragePort;
  let subscriptionRepo: MockSubscriptionRepo;

  const originalEnv = { ...process.env };

  const standardQ = QuestionnaireDefinition.createStandard();
  const allAnswers: Record<string, unknown> = {};
  for (const q of standardQ.questions) {
    allAnswers[q.id] =
      q.type === 'single_choice' && q.options?.[0] ? q.options[0].value : 'Respuesta completa';
  }

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_FREE_CONTRACTS_LIMIT = undefined;
    process.env.FREE_CONTRACTS_LIMIT = undefined;

    contractRepo = new MockContractRepo();
    dynamicRepo = new MockDynamicRepo();
    llmPort = new MockLlmPort();
    genPort = new MockGenPort();
    storagePort = new MockStoragePort();
    subscriptionRepo = new MockSubscriptionRepo();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('GenerateContractDocumentUseCase - Quota Evaluation', () => {
    it('allows document generation and increments free contract count when Free user is under limit', async () => {
      subscriptionRepo.subscriptions.set('user-1', {
        id: 'sub_1',
        userId: 'user-1',
        planType: 'free',
        status: 'active',
        freeContractsUsed: 1, // Limit is 3
        startedAt: new Date().toISOString(),
        expiresAt: null,
        currentPeriodBillingCycle: null,
        lastPaymentTransactionId: null,
      });

      contractRepo.contracts.set('contract-1', {
        id: 'contract-1',
        userId: 'user-1',
        title: 'Mi Contrato 2',
        status: 'in_progress',
        currentQuestionIndex: 11,
        answers: allAnswers,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const useCase = new GenerateContractDocumentUseCase({
        contractRepository: contractRepo as any,
        dynamicQuestionRepository: dynamicRepo as any,
        llmContractDrafting: llmPort as any,
        documentGenerator: genPort as any,
        documentStorage: storagePort as any,
        subscriptionRepository: subscriptionRepo,
      });

      const result = await useCase.execute({
        contractId: 'contract-1',
        userId: 'user-1',
      });

      expect(result.contractId).toBe('contract-1');
      expect(result.availableFormats).toEqual(['docx', 'pdf']);
      expect(subscriptionRepo.incrementCalls).toEqual(['user-1']);

      const savedContract = contractRepo.contracts.get('contract-1');
      expect(savedContract?.status).toBe('completed');
    });

    it('throws FreeQuotaExceededError when Free user has reached or exceeded default limit of 3', async () => {
      subscriptionRepo.subscriptions.set('user-exhausted', {
        id: 'sub_exhausted',
        userId: 'user-exhausted',
        planType: 'free',
        status: 'active',
        freeContractsUsed: 3, // Exhausted
        startedAt: new Date().toISOString(),
        expiresAt: null,
        currentPeriodBillingCycle: null,
        lastPaymentTransactionId: null,
      });

      contractRepo.contracts.set('contract-exhausted', {
        id: 'contract-exhausted',
        userId: 'user-exhausted',
        title: 'Mi Contrato 4',
        status: 'in_progress',
        currentQuestionIndex: 11,
        answers: allAnswers,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const useCase = new GenerateContractDocumentUseCase({
        contractRepository: contractRepo as any,
        dynamicQuestionRepository: dynamicRepo as any,
        llmContractDrafting: llmPort as any,
        documentGenerator: genPort as any,
        documentStorage: storagePort as any,
        subscriptionRepository: subscriptionRepo,
      });

      await expect(
        useCase.execute({
          contractId: 'contract-exhausted',
          userId: 'user-exhausted',
        })
      ).rejects.toThrow(FreeQuotaExceededError);

      // Verify no quota was incremented and no documents were saved
      expect(subscriptionRepo.incrementCalls).toHaveLength(0);
      expect(storagePort.saved).toHaveLength(0);

      const contract = contractRepo.contracts.get('contract-exhausted');
      expect(contract?.status).toBe('in_progress');
    });

    it('respects dynamic free quota limit configured via environment variable', async () => {
      // Set limit to 2 via environment variable
      process.env.FREE_CONTRACTS_LIMIT = '2';

      subscriptionRepo.subscriptions.set('user-limit-2', {
        id: 'sub_2',
        userId: 'user-limit-2',
        planType: 'free',
        status: 'active',
        freeContractsUsed: 2, // At limit 2
        startedAt: new Date().toISOString(),
        expiresAt: null,
        currentPeriodBillingCycle: null,
        lastPaymentTransactionId: null,
      });

      contractRepo.contracts.set('contract-limit-2', {
        id: 'contract-limit-2',
        userId: 'user-limit-2',
        title: 'Mi Contrato 3',
        status: 'in_progress',
        currentQuestionIndex: 11,
        answers: allAnswers,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const useCase = new GenerateContractDocumentUseCase({
        contractRepository: contractRepo as any,
        dynamicQuestionRepository: dynamicRepo as any,
        llmContractDrafting: llmPort as any,
        documentGenerator: genPort as any,
        documentStorage: storagePort as any,
        subscriptionRepository: subscriptionRepo,
      });

      try {
        await useCase.execute({
          contractId: 'contract-limit-2',
          userId: 'user-limit-2',
        });
        expect.fail('Should have thrown FreeQuotaExceededError');
      } catch (err: any) {
        expect(err).toBeInstanceOf(FreeQuotaExceededError);
        expect(err.limit).toBe(2);
      }
    });

    it('allows unlimited document generation for active Pro users without deducting free credits', async () => {
      subscriptionRepo.subscriptions.set('user-pro', {
        id: 'sub_pro',
        userId: 'user-pro',
        planType: 'pro',
        status: 'active',
        freeContractsUsed: 10, // Far exceeds free limit
        startedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        currentPeriodBillingCycle: 'monthly',
        lastPaymentTransactionId: 'tx-123',
      });

      contractRepo.contracts.set('contract-pro', {
        id: 'contract-pro',
        userId: 'user-pro',
        title: 'Contrato Pro',
        status: 'in_progress',
        currentQuestionIndex: 11,
        answers: allAnswers,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const useCase = new GenerateContractDocumentUseCase({
        contractRepository: contractRepo as any,
        dynamicQuestionRepository: dynamicRepo as any,
        llmContractDrafting: llmPort as any,
        documentGenerator: genPort as any,
        documentStorage: storagePort as any,
        subscriptionRepository: subscriptionRepo,
      });

      const result = await useCase.execute({
        contractId: 'contract-pro',
        userId: 'user-pro',
      });

      expect(result.contractId).toBe('contract-pro');
      expect(result.availableFormats).toEqual(['docx', 'pdf']);
      // Pro users do not consume free quota
      expect(subscriptionRepo.incrementCalls).toHaveLength(0);
    });

    it('enforces free quota if Pro subscription has expired', async () => {
      subscriptionRepo.subscriptions.set('user-expired-pro', {
        id: 'sub_expired_pro',
        userId: 'user-expired-pro',
        planType: 'pro',
        status: 'active',
        freeContractsUsed: 3, // Limit reached
        startedAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
        expiresAt: new Date(Date.now() - 1000).toISOString(), // Expired in the past
        currentPeriodBillingCycle: 'monthly',
        lastPaymentTransactionId: 'tx-old',
      });

      contractRepo.contracts.set('contract-expired-pro', {
        id: 'contract-expired-pro',
        userId: 'user-expired-pro',
        title: 'Contrato Pro Expirado',
        status: 'in_progress',
        currentQuestionIndex: 11,
        answers: allAnswers,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const useCase = new GenerateContractDocumentUseCase({
        contractRepository: contractRepo as any,
        dynamicQuestionRepository: dynamicRepo as any,
        llmContractDrafting: llmPort as any,
        documentGenerator: genPort as any,
        documentStorage: storagePort as any,
        subscriptionRepository: subscriptionRepo,
      });

      await expect(
        useCase.execute({
          contractId: 'contract-expired-pro',
          userId: 'user-expired-pro',
        })
      ).rejects.toThrow(FreeQuotaExceededError);

      expect(subscriptionRepo.incrementCalls).toHaveLength(0);
    });
  });

  describe('RegenerateContractDocumentUseCase - Quota Exemption', () => {
    it('always permits regeneration and never deducts quota even if Free user has exhausted limit', async () => {
      subscriptionRepo.subscriptions.set('user-exhausted', {
        id: 'sub_exhausted',
        userId: 'user-exhausted',
        planType: 'free',
        status: 'active',
        freeContractsUsed: 5, // Well beyond limit of 3
        startedAt: new Date().toISOString(),
        expiresAt: null,
        currentPeriodBillingCycle: null,
        lastPaymentTransactionId: null,
      });

      contractRepo.contracts.set('contract-completed', {
        id: 'contract-completed',
        userId: 'user-exhausted',
        title: 'Contrato Ya Generado',
        status: 'completed',
        currentQuestionIndex: 11,
        answers: {
          ...allAnswers,
          q2_description_conditions: 'Nuevas condiciones modificadas',
        },
        createdAt: new Date(Date.now() - 3600 * 1000),
        updatedAt: new Date(Date.now() - 1800 * 1000),
      });

      const regenerateUseCase = new RegenerateContractDocumentUseCase({
        contractRepository: contractRepo as any,
        dynamicQuestionRepository: dynamicRepo as any,
        llmContractDrafting: llmPort as any,
        documentGenerator: genPort as any,
        documentStorage: storagePort as any,
        subscriptionRepository: subscriptionRepo,
      });

      const result = await regenerateUseCase.execute({
        contractId: 'contract-completed',
        userId: 'user-exhausted',
      });

      expect(result.contractId).toBe('contract-completed');
      expect(result.availableFormats).toEqual(['docx', 'pdf']);
      // Zero quota penalty: incrementFreeContractCount must never be invoked
      expect(subscriptionRepo.incrementCalls).toHaveLength(0);
      expect(storagePort.saved).toHaveLength(2);
    });
  });
});
