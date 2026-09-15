import { describe, expect, it } from 'vitest';
import { QuestionnaireDefinition } from '../src/entities/QuestionnaireDefinition.js';

describe('Bidirectional Navigation & Answer Modification', () => {
  const questionnaire = QuestionnaireDefinition.createStandard();

  it('skips non-matching conditional questions in both forward and backward traversal', () => {
    // With recurring modality
    const recurringAnswers: Record<string, unknown> = {
      q0_party_role: 'client',
      q1_legal_personality: 'individual',
      q2_description_conditions: 'Condiciones',
      q3_domicile: 'Bogotá',
      q4_breach_impact: 'Impacto',
      q5_modality: 'recurring',
    };

    const q5 = questionnaire.questions.find((q) => q.id === 'q5_modality')!;
    const nextAfterQ5 = questionnaire.getNextQuestion(q5.id, recurringAnswers);

    // Q5a should be skipped; next must be Q5b
    expect(nextAfterQ5?.id).toBe('q5b_recurring_duration');

    // Stepping backwards from Q5b must return to Q5
    const prevFromQ5b = questionnaire.getPreviousQuestion(nextAfterQ5?.id, recurringAnswers);
    expect(prevFromQ5b?.id).toBe('q5_modality');
  });

  it('returns null when trying to step previous from the first question', () => {
    const emptyAnswers = {};
    const visible = questionnaire.getVisibleQuestions(emptyAnswers);
    const first = visible[0];
    const prev = questionnaire.getPreviousQuestion(first.id, emptyAnswers);
    expect(prev).toBeNull();
  });

  it('preserves non-dependent answers when modifying a previous answer', () => {
    const answers: Record<string, unknown> = {
      q0_party_role: 'client',
      q1_legal_personality: 'individual',
      q2_description_conditions: 'Condición A',
      q3_domicile: 'Calle 100 # 15-20',
    };

    // User navigates back and modifies Q3 domicile
    const updatedAnswers = {
      ...answers,
      q3_domicile: 'Carrera 7 # 72-10',
    };

    expect(updatedAnswers.q0_party_role).toBe('client');
    expect(updatedAnswers.q1_legal_personality).toBe('individual');
    expect(updatedAnswers.q2_description_conditions).toBe('Condición A');
    expect(updatedAnswers.q3_domicile).toBe('Carrera 7 # 72-10');
  });
});
