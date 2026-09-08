import { describe, it, expect } from 'vitest';
import { QuestionnaireDefinition } from '../src/entities/QuestionnaireDefinition.js';

describe('Bidirectional Navigation & Answer Modification', () => {
  const questionnaire = QuestionnaireDefinition.createStandard();

  it('skips non-matching conditional questions in both forward and backward traversal', () => {
    // With recurring modality
    const recurringAnswers: Record<string, unknown> = {
      q0_description: 'Servicio recurrente',
      q1_legal_personality: 'individual',
      q2_delivery_conditions: 'Condiciones',
      q3_location: 'Bogotá',
      q4_modality: 'recurring',
    };

    const q4 = questionnaire.questions.find((q) => q.id === 'q4_modality')!;
    const nextAfterQ4 = questionnaire.getNextQuestion(q4.id, recurringAnswers);

    // Q4a should be skipped; next must be Q4b
    expect(nextAfterQ4?.id).toBe('q4b_recurring_duration');

    // Stepping backwards from Q4b must return to Q4
    const prevFromQ4b = questionnaire.getPreviousQuestion(nextAfterQ4!.id, recurringAnswers);
    expect(prevFromQ4b?.id).toBe('q4_modality');
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
      q0_description: 'Descripción inicial',
      q1_legal_personality: 'individual',
      q2_delivery_conditions: 'Condición A',
      q3_location: 'Calle 100 # 15-20',
    };

    // User navigates back and modifies Q3 location
    const updatedAnswers = {
      ...answers,
      q3_location: 'Carrera 7 # 72-10',
    };

    expect(updatedAnswers.q0_description).toBe('Descripción inicial');
    expect(updatedAnswers.q1_legal_personality).toBe('individual');
    expect(updatedAnswers.q2_delivery_conditions).toBe('Condición A');
    expect(updatedAnswers.q3_location).toBe('Carrera 7 # 72-10');
  });
});
