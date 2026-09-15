/**
 * Application Port Contract: QuestionnairePort & ContractRepositoryPort
 *
 * Location in Architecture: packages/application/src/ports/QuestionnairePort.ts
 * Implemented by: packages/infrastructure/src/adapters/storage/SupabaseContractRepository.ts
 *
 * Inward Dependency Rule:
 * packages/domain <-- packages/application (defines Ports) <-- packages/infrastructure (implements Ports)
 */

export type QuestionType = 'open_text' | 'single_choice' | 'multiple_choice' | 'checkbox';
export type ContractStatus = 'in_progress' | 'completed';

export interface QuestionOptionDTO {
  id: string;
  label: string;
  value: string;
  tooltip?: string;
}

export interface ConditionRuleDTO {
  dependsOnQuestionId: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'contains' | 'in';
  expectedValue: unknown;
}

export interface QuestionDTO {
  id: string;
  order: number;
  prompt: string;
  type: QuestionType;
  isRequired: boolean;
  helpText?: string;
  tooltip?: string;
  options?: QuestionOptionDTO[];
  condition?: ConditionRuleDTO;
}

export interface QuestionnaireDefinitionDTO {
  id: string;
  version: string;
  questions: QuestionDTO[];
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

export interface UpdateProgressInput {
  contractId: string;
  userId: string;
  questionIndex: number;
  answers: Record<string, unknown>;
}

export interface UpdateTitleInput {
  contractId: string;
  userId: string;
  title: string;
}

export interface CompleteQuestionnaireInput {
  contractId: string;
  userId: string;
}

/**
 * Domain-specific typed errors (Principle I: Explicit typed domain errors)
 */
export class QuestionnaireDomainError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'QuestionnaireDomainError';
  }
}

export class ContractNotFoundError extends QuestionnaireDomainError {
  constructor(contractId: string) {
    super(`Contract generation with ID ${contractId} not found`, 'CONTRACT_NOT_FOUND');
  }
}

export class UnauthorizedContractAccessError extends QuestionnaireDomainError {
  constructor(contractId: string, userId: string) {
    super(
      `User ${userId} does not have permission to access contract ${contractId}`,
      'UNAUTHORIZED_ACCESS'
    );
  }
}

export class InvalidAnswerError extends QuestionnaireDomainError {
  constructor(questionId: string, reason: string) {
    super(`Invalid answer for question ${questionId}: ${reason}`, 'INVALID_ANSWER');
  }
}

export class EmptyTitleError extends QuestionnaireDomainError {
  constructor() {
    super('Contract title cannot be empty or whitespace only', 'EMPTY_TITLE');
  }
}

/**
 * Core QuestionnaireEnginePort Interface
 */
export interface QuestionnaireEnginePort {
  /**
   * Retrieves the canonical questionnaire definition.
   */
  getQuestionnaireDefinition(): Promise<QuestionnaireDefinitionDTO>;

  /**
   * Evaluates the subset of questions currently visible based on provided answers.
   */
  getVisibleQuestions(answers: Record<string, unknown>): QuestionDTO[];

  /**
   * Prunes answers to child questions whose visibility condition no longer holds.
   */
  pruneObsoleteAnswers(answers: Record<string, unknown>): Record<string, unknown>;
}

/**
 * Core ContractProgressPort Interface (Implemented by Storage Adapter)
 */
export interface ContractProgressPort {
  /**
   * Retrieves a contract generation record by ID, verifying user ownership.
   */
  getContractById(contractId: string, userId: string): Promise<ContractGenerationDTO | null>;

  /**
   * Incremental autosave: updates current question pointer and merges answers.
   * Enforces user ownership and prunes obsolete answers.
   */
  updateProgress(input: UpdateProgressInput): Promise<ContractGenerationDTO>;

  /**
   * Updates contract display title.
   * Throws EmptyTitleError if blank.
   */
  updateTitle(input: UpdateTitleInput): Promise<ContractGenerationDTO>;

  /**
   * Marks standard questionnaire as completed, transitioning status to 'completed'.
   */
  completeQuestionnaire(input: CompleteQuestionnaireInput): Promise<ContractGenerationDTO>;

  /**
   * Computes default title for a new contract generation ("Mi Contrato N").
   */
  getNextDefaultTitle(userId: string): Promise<string>;
}
