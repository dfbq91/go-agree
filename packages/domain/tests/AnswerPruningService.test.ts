import { describe, it, expect } from 'vitest';
import { AnswerPruningService } from '../src/services/AnswerPruningService.js';
import { QuestionnaireDefinition } from '../src/entities/QuestionnaireDefinition.js';

describe('AnswerPruningService', () => {
  const questionnaire = QuestionnaireDefinition.createStandard();
  const pruningService = new AnswerPruningService(questionnaire);

  it('prunes obsolete child answers when parent question answer changes', () => {
    // Originally recurring with duration > 12m and price adjustment selected
    const originalAnswers: Record<string, unknown> = {
      q0_party_role: 'client',
      q1_legal_personality: 'legal_entity',
      q2_description_conditions: 'Estándares de seguridad',
      q3_domicile: 'Edificio Central, Medellín',
      q4_breach_impact: 'Parálisis operativa',
      q5_modality: 'recurring',
      q5b_recurring_duration: '>12',
      q7_price_adjustment: 'cpi',
    };

    // User navigates back and switches to one_time
    const updatedAnswers = {
      ...originalAnswers,
      q5_modality: 'one_time',
      q5a_delivery_timeframe: '15 días',
    };

    const pruned = pruningService.prune(updatedAnswers);

    expect(pruned.q5_modality).toBe('one_time');
    expect(pruned.q5a_delivery_timeframe).toBe('15 días');
    expect(pruned.q0_party_role).toBe('client');

    // Obsolete child answers must be stripped
    expect(pruned.q5b_recurring_duration).toBeUndefined();
    expect(pruned.q7_price_adjustment).toBeUndefined();
  });

  it('prunes automatic renewal notice when switched to fixed_term', () => {
    const originalAnswers: Record<string, unknown> = {
      q9_renewal: 'automatic_renewal',
      q9a_renewal_notice: '30 días',
    };

    const updatedAnswers = {
      ...originalAnswers,
      q9_renewal: 'fixed_term',
    };

    const pruned = pruningService.prune(updatedAnswers);

    expect(pruned.q9_renewal).toBe('fixed_term');
    expect(pruned.q9a_renewal_notice).toBeUndefined();
  });

  it('prunes all client answers when switching role to contractor', () => {
    const originalAnswers: Record<string, unknown> = {
      q0_party_role: 'client',
      q1_legal_personality: 'individual',
      q2_description_conditions: 'Servicio de diseño',
      q3_domicile: 'Cali',
    };

    const updatedAnswers = {
      ...originalAnswers,
      q0_party_role: 'contractor',
    };

    const pruned = pruningService.prune(updatedAnswers);

    expect(pruned.q0_party_role).toBe('contractor');
    expect(pruned.q1_legal_personality).toBeUndefined();
    expect(pruned.q2_description_conditions).toBeUndefined();
    expect(pruned.q3_domicile).toBeUndefined();
  });
});
