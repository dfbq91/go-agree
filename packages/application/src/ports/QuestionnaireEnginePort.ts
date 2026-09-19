export type QuestionType = 'open_text' | 'single_choice' | 'multiple_choice';

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

export interface QuestionnaireEnginePort {
  getQuestionnaireDefinition(): Promise<QuestionnaireDefinitionDTO>;
  getVisibleQuestions(answers: Record<string, unknown>): QuestionDTO[];
  pruneObsoleteAnswers(answers: Record<string, unknown>): Record<string, unknown>;
}
