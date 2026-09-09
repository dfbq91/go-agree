import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { QuestionnaireContainer } from '../../src/components/questionnaire/QuestionnaireContainer';

describe('Autosave and Resumption Integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('resumes directly at initialQuestionIndex with populated previous answers', () => {
    render(
      <QuestionnaireContainer
        contractId="contract-123"
        initialTitle="Mi Contrato 1"
        initialQuestionIndex={1}
        initialAnswers={{
          q0_party_role: 'client',
        }}
      />
    );

    // Should display Question 1 (legal personality)
    expect(
      screen.getByRole('heading', { name: '¿Eres persona natural o persona jurídica?' })
    ).toBeDefined();
    expect(screen.getByRole('button', { name: /Anterior/i })).toBeDefined();
  });

  it('debounces text input autosave by 400ms and triggers onSaveProgress', async () => {
    const onSaveProgress = vi.fn().mockResolvedValue(undefined);

    render(
      <QuestionnaireContainer
        contractId="contract-123"
        initialTitle="Mi Contrato 1"
        initialQuestionIndex={2}
        initialAnswers={{
          q0_party_role: 'client',
          q1_legal_personality: 'individual',
        }}
        onSaveProgress={onSaveProgress}
      />
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Desarrollo de software' } });

    // Immediately before 400ms, should not have saved text yet
    expect(onSaveProgress).not.toHaveBeenCalled();

    // Advance 400ms
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(onSaveProgress).toHaveBeenCalledWith(2, {
      q0_party_role: 'client',
      q1_legal_personality: 'individual',
      q2_description_conditions: 'Desarrollo de software',
    });
  });

  it('triggers immediate autosave on choice selection', () => {
    const onSaveProgress = vi.fn().mockResolvedValue(undefined);

    render(
      <QuestionnaireContainer
        contractId="contract-123"
        initialTitle="Mi Contrato 1"
        initialQuestionIndex={0}
        initialAnswers={{}}
        onSaveProgress={onSaveProgress}
      />
    );

    const radio = screen.getByLabelText('Contratante');
    fireEvent.click(radio);

    expect(onSaveProgress).toHaveBeenCalledWith(0, {
      q0_party_role: 'client',
    });
  });
});
