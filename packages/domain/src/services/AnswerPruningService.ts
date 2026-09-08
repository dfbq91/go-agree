import type { QuestionnaireDefinition } from '../entities/QuestionnaireDefinition.js';

export class AnswerPruningService {
  constructor(private readonly questionnaire: QuestionnaireDefinition) {}

  prune(answers: Record<string, unknown>): Record<string, unknown> {
    return this.questionnaire.pruneObsoleteAnswers(answers);
  }
}
