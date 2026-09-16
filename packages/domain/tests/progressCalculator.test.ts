import { describe, expect, it } from 'vitest';
import { calculateAnsweredQuestionsCount } from '../src/utils/progressCalculator.js';

describe('calculateAnsweredQuestionsCount', () => {
  it('should return 0 when answers object is empty or undefined', () => {
    expect(calculateAnsweredQuestionsCount({})).toBe(0);
    expect(calculateAnsweredQuestionsCount(undefined as any)).toBe(0);
  });

  it('should count only non-empty, non-null, defined answers', () => {
    const answers = {
      q0_description: 'Servicio de desarrollo',
      q1_legal_personality: 'individual',
      q2_delivery: '',
      q3_location: null,
      q4_modality: undefined,
      q5_service_profile: ['personnel'],
    };

    expect(calculateAnsweredQuestionsCount(answers)).toBe(3);
  });

  it('should count arrays only when they have at least one element', () => {
    const answers = {
      q1: ['option1'],
      q2: [],
      q3: 'valid',
    };

    expect(calculateAnsweredQuestionsCount(answers)).toBe(2);
  });
});
