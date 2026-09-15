import { describe, expect, it } from 'vitest';
import { ConditionRule } from '../src/value-objects/ConditionRule.js';

describe('ConditionRule Operator Evaluations', () => {
  it('evaluates equals and not_equals operators', () => {
    const ruleEquals = new ConditionRule({
      dependsOnQuestionId: 'q4_modality',
      operator: 'equals',
      expectedValue: 'recurring',
    });

    expect(ruleEquals.evaluate({ q4_modality: 'recurring' })).toBe(true);
    expect(ruleEquals.evaluate({ q4_modality: 'one_time' })).toBe(false);
    expect(ruleEquals.evaluate({})).toBe(false);

    const ruleNotEquals = new ConditionRule({
      dependsOnQuestionId: 'q4_modality',
      operator: 'not_equals',
      expectedValue: 'one_time',
    });

    expect(ruleNotEquals.evaluate({ q4_modality: 'recurring' })).toBe(true);
    expect(ruleNotEquals.evaluate({ q4_modality: 'one_time' })).toBe(false);
  });

  it('evaluates greater_than operator with numbers and numeric strings', () => {
    const ruleGt = new ConditionRule({
      dependsOnQuestionId: 'contract_duration_months',
      operator: 'greater_than',
      expectedValue: 12,
    });

    expect(ruleGt.evaluate({ contract_duration_months: 24 })).toBe(true);
    expect(ruleGt.evaluate({ contract_duration_months: '18' })).toBe(true);
    expect(ruleGt.evaluate({ contract_duration_months: 12 })).toBe(false);
    expect(ruleGt.evaluate({ contract_duration_months: 6 })).toBe(false);
    expect(ruleGt.evaluate({ contract_duration_months: 'invalid' })).toBe(false);
  });

  it('evaluates contains and in operators', () => {
    const ruleContains = new ConditionRule({
      dependsOnQuestionId: 'q5_profile',
      operator: 'contains',
      expectedValue: 'uses_vehicles',
    });

    expect(ruleContains.evaluate({ q5_profile: ['employs_people', 'uses_vehicles'] })).toBe(true);
    expect(ruleContains.evaluate({ q5_profile: ['employs_people'] })).toBe(false);

    const ruleIn = new ConditionRule({
      dependsOnQuestionId: 'q11_dispute',
      operator: 'in',
      expectedValue: ['arbitration', 'amicable_settlement'],
    });

    expect(ruleIn.evaluate({ q11_dispute: 'arbitration' })).toBe(true);
    expect(ruleIn.evaluate({ q11_dispute: 'ordinary_courts' })).toBe(false);
  });
});
