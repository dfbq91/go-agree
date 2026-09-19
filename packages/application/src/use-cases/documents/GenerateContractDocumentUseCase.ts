/**
 * @file GenerateContractDocumentUseCase.ts
 * @description Use case for validating 100% questionnaire completeness, quota,
 * drafting legal clauses via LLM, and compiling .docx and .pdf document artifacts.
 */

import {
  ConditionRule,
  ContractNotFoundError,
  FreeQuotaExceededError,
  IncompleteQuestionnaireError,
  Question,
  QuestionOption,
  QuestionnaireDefinition,
  formatQuestionnaireTranscript,
  getFreeContractLimit,
} from '@go-agree/domain';
import type { ContractRepositoryPort } from '../../ports/ContractRepositoryPort.js';
import type { DocumentFormat, DocumentGeneratorPort } from '../../ports/DocumentGeneratorPort.js';
import type { DocumentStoragePort } from '../../ports/DocumentStoragePort.js';
import type { DynamicQuestionRepositoryPort } from '../../ports/DynamicQuestionRepositoryPort.js';
import type { LlmContractDraftingPort } from '../../ports/LlmContractDraftingPort.js';
import type { LoggerPort } from '../../ports/LoggerPort.js';
import type { SubscriptionRepositoryPort } from '../../ports/SubscriptionRepositoryPort.js';

export interface GenerateContractDocumentInput {
  contractId: string;
  userId: string;
}

export interface GenerateContractDocumentResult {
  contractId: string;
  availableFormats: DocumentFormat[];
  generatedAt: Date;
}

export interface GenerateContractDocumentDependencies {
  contractRepository: ContractRepositoryPort;
  dynamicQuestionRepository?: DynamicQuestionRepositoryPort;
  llmContractDrafting: LlmContractDraftingPort;
  documentGenerator: DocumentGeneratorPort;
  documentStorage: DocumentStoragePort;
  subscriptionRepository?: SubscriptionRepositoryPort;
  logger?: LoggerPort;
}

export class GenerateContractDocumentUseCase {
  constructor(private readonly deps: GenerateContractDocumentDependencies) {}

  async execute(input: GenerateContractDocumentInput): Promise<GenerateContractDocumentResult> {
    const { contractId, userId } = input;

    // 1. Fetch contract and assert ownership
    const contract = await this.deps.contractRepository.getByIdAndUserId(contractId, userId);
    if (!contract) {
      throw new ContractNotFoundError(contractId);
    }

    // 2. Enforce 100% Questionnaire Completeness
    const standardDef = QuestionnaireDefinition.createStandard();
    const dynamicQuestions = this.deps.dynamicQuestionRepository
      ? await this.deps.dynamicQuestionRepository.getQuestionsByContractId(contractId, userId)
      : [];

    const answers = contract.answers || {};
    const unansweredIds: string[] = [];

    // Check standard visible questions
    for (const q of standardDef.questions) {
      if (q.isVisible(answers)) {
        const val = answers[q.id];
        const validation = q.validate(val);
        if (!validation.isValid) {
          unansweredIds.push(q.id);
        }
      }
    }

    // Check dynamic questions
    for (const dyn of dynamicQuestions) {
      const qKey = dyn.questionKey || dyn.id;
      const questionEntity = new Question({
        id: qKey,
        order: dyn.orderIndex,
        prompt: dyn.prompt,
        type: dyn.type,
        isRequired: dyn.isRequired,
        helpText: dyn.helpText,
        tooltip: dyn.tooltip,
        options: dyn.options?.map((opt) => new QuestionOption(opt)),
        condition: dyn.condition ? new ConditionRule(dyn.condition) : undefined,
      });

      if (questionEntity.isVisible(answers)) {
        const val = answers[qKey] ?? answers[dyn.id];
        const validation = questionEntity.validate(val);
        if (!validation.isValid) {
          unansweredIds.push(qKey);
        }
      }
    }

    if (unansweredIds.length > 0) {
      this.deps.logger?.warn('Contract generation blocked: unanswered questions', {
        contractId,
        userId,
        unansweredIds,
      });
      throw new IncompleteQuestionnaireError(unansweredIds);
    }

    // 3. Quota Evaluation (if subscription repository is provided and contract is not already completed)
    const wasCompletedBefore = contract.status === 'completed';
    let isUserActivePro = false;

    if (this.deps.subscriptionRepository && !wasCompletedBefore) {
      const subscription = await this.deps.subscriptionRepository.getByUserId(userId);
      const isExpired =
        subscription.planType === 'pro' &&
        subscription.expiresAt !== null &&
        new Date(subscription.expiresAt).getTime() <= Date.now();

      isUserActivePro =
        subscription.planType === 'pro' && subscription.status === 'active' && !isExpired;

      if (!isUserActivePro) {
        const freeLimit = getFreeContractLimit();
        if (subscription.freeContractsUsed >= freeLimit) {
          this.deps.logger?.warn('Contract generation blocked: Free quota exceeded', {
            userId,
            contractId,
            freeContractsUsed: subscription.freeContractsUsed,
            freeLimit,
          });
          throw new FreeQuotaExceededError(freeLimit);
        }
      }
    }

    // 4. Format questionnaire transcript
    const transcriptAnswers = { ...answers };
    for (const dyn of dynamicQuestions) {
      const qKey = dyn.questionKey || dyn.id;
      if (transcriptAnswers[qKey] === undefined && transcriptAnswers[dyn.id] !== undefined) {
        transcriptAnswers[qKey] = transcriptAnswers[dyn.id];
      }
    }

    const transcript = formatQuestionnaireTranscript({
      title: contract.title,
      standardQuestions: standardDef.questions,
      dynamicQuestions: dynamicQuestions.map((d) => ({
        id: d.questionKey || d.id,
        prompt: d.prompt,
      })),
      answers: transcriptAnswers,
    });

    // 5. Invoke LLM Drafting Port
    this.deps.logger?.info('Invoking LLM to draft contract clauses', { contractId });
    const assembledContract = await this.deps.llmContractDrafting.draftContract({
      contractId,
      title: contract.title,
      transcript,
      answers: transcriptAnswers,
    });

    // 6. Compile Word and PDF documents in parallel
    this.deps.logger?.info('Compiling docx and pdf binaries', { contractId });
    const [docxBuffer, pdfBuffer] = await Promise.all([
      this.deps.documentGenerator.generateDocx(assembledContract),
      this.deps.documentGenerator.generatePdf(assembledContract),
    ]);

    // 7. Persist document artifacts via DocumentStoragePort
    const now = new Date();
    await Promise.all([
      this.deps.documentStorage.saveDocument({
        contractId,
        userId,
        format: 'docx',
        buffer: docxBuffer.content,
      }),
      this.deps.documentStorage.saveDocument({
        contractId,
        userId,
        format: 'pdf',
        buffer: pdfBuffer.content,
      }),
    ]);

    // 8. Update contract status to completed and save
    contract.status = 'completed';
    contract.updatedAt = now;
    await this.deps.contractRepository.save(contract);

    // 9. Increment free contract quota usage if applicable (only for non-Pro users on initial completion)
    if (this.deps.subscriptionRepository && !wasCompletedBefore && !isUserActivePro) {
      await this.deps.subscriptionRepository.incrementFreeContractCount(userId);
    }

    this.deps.logger?.info('Contract document generation completed successfully', {
      contractId,
      userId,
    });

    return {
      contractId,
      availableFormats: ['docx', 'pdf'],
      generatedAt: now,
    };
  }
}
