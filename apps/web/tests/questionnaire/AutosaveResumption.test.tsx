import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

  it('does NOT trigger onSaveProgress while typing or selecting choices', async () => {
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

    // 1. Select a radio choice
    const radio = screen.getByLabelText('Contratante');
    fireEvent.click(radio);

    // 2. Advance timers (por si hubiera algún debounce)
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onSaveProgress).not.toHaveBeenCalled();
  });

  it('triggers onSaveProgress ONLY when clicking the Siguiente button', async () => {
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
    expect(onSaveProgress).not.toHaveBeenCalled();

    const nextButton = screen.getByRole('button', { name: /Siguiente/i });
    await act(async () => {
      fireEvent.click(nextButton);
    });

    expect(onSaveProgress).toHaveBeenCalledTimes(1);
    expect(onSaveProgress).toHaveBeenCalledWith(1, {
      q0_party_role: 'client',
    });
  });

  it('prevents advancing and displays error when onSaveProgress fails', async () => {
    const onSaveProgress = vi.fn().mockRejectedValue(new Error('Network error'));

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

    const nextButton = screen.getByRole('button', { name: /Siguiente/i });
    await act(async () => {
      fireEvent.click(nextButton);
    });

    expect(
      screen.getByRole('heading', { name: 'Indica si eres contratante o contratista' })
    ).toBeDefined();

    // Debe mostrar una alerta accesible de error
    const alerts = screen.getAllByRole('alert');
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts[0].textContent).toContain('guardar');
  });
});
