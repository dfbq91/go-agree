import type { QuestionDTO } from './QuestionnaireEnginePort.js';

export interface GenerateQuestionsInput {
  answers: Record<string, unknown>;
  stage?: number;
}

export interface GenerateQuestionsOutput {
  questions: QuestionDTO[];
}

export interface LlmQuestionAnalysisPort {
  generateQuestions(input: GenerateQuestionsInput): Promise<GenerateQuestionsOutput>;
}
