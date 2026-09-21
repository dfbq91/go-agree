/**
 * @file RegenerateContractDocumentUseCase.ts
 * @description Use case for re-synthesizing contract clauses via LLM with updated answers,
 * recompiling .docx and .pdf document binaries, and overwriting existing storage artifacts
 * with ZERO quota deduction.
 */

import {
  ConditionRule,
  ContractNotFoundError,
  IncompleteQuestionnaireError,
  Question,
  QuestionOption,
  QuestionnaireDefinition,
  formatQuestionnaireTranscript,
} from '@go-agree/domain';
import type { ContractRepositoryPort } from '../../ports/ContractRepositoryPort.js';
import type { DocumentFormat, DocumentGeneratorPort } from '../../ports/DocumentGeneratorPort.js';
import type { DocumentStoragePort } from '../../ports/DocumentStoragePort.js';
import type { DynamicQuestionRepositoryPort } from '../../ports/DynamicQuestionRepositoryPort.js';
import type { LlmContractDraftingPort } from '../../ports/LlmContractDraftingPort.js';
import type { LoggerPort } from '../../ports/LoggerPort.js';
import type { SubscriptionRepositoryPort } from '../../ports/SubscriptionRepositoryPort.js';

export interface RegenerateContractDocumentInput {
  contractId: string;
  userId: string;
}

export interface RegenerateContractDocumentResult {
  contractId: string;
  availableFormats: DocumentFormat[];
  regeneratedAt: Date;
}

export interface RegenerateContractDocumentDependencies {
  contractRepository: ContractRepositoryPort;
  dynamicQuestionRepository?: DynamicQuestionRepositoryPort;
  llmContractDrafting: LlmContractDraftingPort;
  documentGenerator: DocumentGeneratorPort;
  documentStorage: DocumentStoragePort;
  subscriptionRepository?: SubscriptionRepositoryPort;
  logger?: LoggerPort;
}

export class RegenerateContractDocumentUseCase {
  constructor(private readonly deps: RegenerateContractDocumentDependencies) {}

  async execute(input: RegenerateContractDocumentInput): Promise<RegenerateContractDocumentResult> {
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

    // Check dynamic visible questions
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
      this.deps.logger?.warn('Contract regeneration blocked: unanswered questions', {
        contractId,
        userId,
        unansweredIds,
      });
      throw new IncompleteQuestionnaireError(unansweredIds);
    }

    // NOTE: ZERO quota deduction on regeneration!
    // We intentionally do NOT evaluate quota limits or increment free contract counts.

    // 3. Format questionnaire transcript with latest answers
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

    // 4. Invoke LLM Drafting Port to re-draft contract clauses
    this.deps.logger?.info('Invoking LLM to regenerate contract clauses', { contractId });
    const assembledContract = await this.deps.llmContractDrafting.draftContract({
      contractId,
      title: contract.title,
      transcript,
      answers: transcriptAnswers,
    });

    // 5. Recompile Word and PDF documents in parallel
    this.deps.logger?.info('Recompiling docx and pdf binaries', { contractId });
    const [docxBuffer, pdfBuffer] = await Promise.all([
      this.deps.documentGenerator.generateDocx(assembledContract),
      this.deps.documentGenerator.generatePdf(assembledContract),
    ]);

    // 6. Overwrite document artifacts via DocumentStoragePort (single version retained)
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

    // 7. Ensure contract status is completed if not already (do not bump updatedAt past document creation)
    if (contract.status !== 'completed') {
      contract.status = 'completed';
      contract.updatedAt = contract.updatedAt || now;
      await this.deps.contractRepository.save(contract);
    }

    this.deps.logger?.info('Contract document regeneration completed successfully', {
      contractId,
      userId,
    });

    return {
      contractId,
      availableFormats: ['docx', 'pdf'],
      regeneratedAt: now,
    };
  }
}
