import { describe, it, expect } from 'vitest';
import { QuestionnaireDefinition } from '../src/entities/QuestionnaireDefinition.js';
import { Question } from '../src/entities/Question.js';

describe('QuestionnaireDefinition', () => {
  it('initializes standard questionnaire with all standard questions', () => {
    const questionnaire = QuestionnaireDefinition.createStandard();
    expect(questionnaire.id).toBe('standard_questionnaire_v1');
    expect(questionnaire.version).toBe('1.0.0');
    expect(questionnaire.questions.length).toBeGreaterThanOrEqual(12);

    const q0 = questionnaire.questions.find((q) => q.id === 'q0_description');
    expect(q0).toBeDefined();
    expect(q0?.prompt).toBe('Describe el bien o servicio que necesitas');
    expect(q0?.isRequired).toBe(true);
  });

  it('evaluates visible questions correctly based on answers', () => {
    const questionnaire = QuestionnaireDefinition.createStandard();
    const emptyAnswers = {};
    const initialVisible = questionnaire.getVisibleQuestions(emptyAnswers);

    // Conditional questions should not be visible initially
    expect(initialVisible.some((q) => q.id === 'q4a_delivery_timeframe')).toBe(false);
    expect(initialVisible.some((q) => q.id === 'q4b_recurring_duration')).toBe(false);
    expect(initialVisible.some((q) => q.id === 'q7_price_adjustment')).toBe(false);
    expect(initialVisible.some((q) => q.id === 'q9a_renewal_notice')).toBe(false);

    // With one_time modality
    const oneTimeAnswers = { q4_modality: 'one_time' };
    const oneTimeVisible = questionnaire.getVisibleQuestions(oneTimeAnswers);
    expect(oneTimeVisible.some((q) => q.id === 'q4a_delivery_timeframe')).toBe(true);
    expect(oneTimeVisible.some((q) => q.id === 'q4b_recurring_duration')).toBe(false);

    // With recurring modality > 12m
    const recurringAnswers = { q4_modality: 'recurring', q4b_recurring_duration: '>12' };
    const recurringVisible = questionnaire.getVisibleQuestions(recurringAnswers);
    expect(recurringVisible.some((q) => q.id === 'q4a_delivery_timeframe')).toBe(false);
    expect(recurringVisible.some((q) => q.id === 'q4b_recurring_duration')).toBe(true);
    expect(recurringVisible.some((q) => q.id === 'q7_price_adjustment')).toBe(true);
  });

  it('navigates next and previous sequentially among visible questions', () => {
    const questionnaire = QuestionnaireDefinition.createStandard();
    const answers = { q4_modality: 'one_time' };
    const visible = questionnaire.getVisibleQuestions(answers);

    const first = visible[0];
    const second = questionnaire.getNextQuestion(first.id, answers);
    expect(second?.id).toBe(visible[1].id);

    const prev = questionnaire.getPreviousQuestion(second!.id, answers);
    expect(prev?.id).toBe(first.id);

    const noPrevForFirst = questionnaire.getPreviousQuestion(first.id, answers);
    expect(noPrevForFirst).toBeNull();
  });

  it('validates required and open_text length constraints', () => {
    const q = new Question({
      id: 'test_q',
      order: 1,
      prompt: 'Test Prompt',
      type: 'open_text',
      isRequired: true,
    });

    expect(q.validate(undefined).isValid).toBe(false);
    expect(q.validate('').isValid).toBe(false);
    expect(q.validate('   ').isValid).toBe(false);
    expect(q.validate('Valid text').isValid).toBe(true);

    const longText = 'a'.repeat(2001);
    expect(q.validate(longText).isValid).toBe(false);
    expect(q.validate(longText).error).toContain('2000');
  });

  it('validates custom value specification for choice options with other / especificar', () => {
    const questionnaire = QuestionnaireDefinition.createStandard();
    const q8 = questionnaire.questions.find((q) => q.id === 'q8_termination_notice')!;
    expect(q8).toBeDefined();

    // Regular option should be valid without customValue
    expect(q8.validate('days_30').isValid).toBe(true);

    // "other" option without custom value should fail validation
    expect(q8.validate('other').isValid).toBe(false);
    expect(q8.validate({ selection: 'other', customValue: '' }).isValid).toBe(false);
    expect(q8.validate({ selection: 'other', customValue: '   ' }).isValid).toBe(false);

    // "other" option with custom value should pass validation
    expect(q8.validate({ selection: 'other', customValue: '45 días calendario' }).isValid).toBe(true);
    expect(q8.validate('other: 45 días calendario').isValid).toBe(true);
  });
});
