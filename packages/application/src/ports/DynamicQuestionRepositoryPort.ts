import type { ConditionRuleDTO, QuestionOptionDTO, QuestionType } from './QuestionnaireEnginePort.js';

export interface DynamicQuestionDTO {
  id: string;
  contractId: string;
  userId: string;
  stage: number;
  questionKey: string;
  prompt: string;
  type: QuestionType;
  orderIndex: number;
  isRequired: boolean;
  helpText?: string;
  tooltip?: string;
  options?: QuestionOptionDTO[];
  condition?: ConditionRuleDTO;
  createdAt: Date;
}

export interface SaveDynamicQuestionsInput {
  contractId: string;
  userId: string;
  stage: number;
  answersSnapshot: Record<string, unknown>;
  questions: Array<{
    stage: number;
    questionKey: string;
    prompt: string;
    type: QuestionType;
    orderIndex: number;
    isRequired: boolean;
    helpText?: string;
    tooltip?: string;
    options?: QuestionOptionDTO[];
    condition?: ConditionRuleDTO;
  }>;
}

export interface DynamicQuestionRepositoryPort {
  saveQuestions(input: SaveDynamicQuestionsInput): Promise<DynamicQuestionDTO[]>;
  getQuestionsByContractId(contractId: string, userId: string): Promise<DynamicQuestionDTO[]>;
  getSnapshot(contractId: string, userId: string, stage: number): Promise<Record<string, unknown> | null>;
  deleteQuestionsByStage(contractId: string, userId: string, stage: number): Promise<void>;
}
