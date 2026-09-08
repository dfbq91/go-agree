import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionCard } from '../../src/components/questionnaire/QuestionCard';
import type { QuestionDTO } from '@go-agree/application';

describe('QuestionCard Component', () => {
  const mockOpenTextQuestion: QuestionDTO = {
    id: 'q0_description',
    order: 0,
    prompt: 'Describe el bien o servicio que necesitas',
    type: 'open_text',
    isRequired: true,
    helpText: 'Esta descripción inicial nos permite identificar la naturaleza.',
  };

  const mockChoiceQuestion: QuestionDTO = {
    id: 'q1_legal_personality',
    order: 1,
    prompt: '¿Eres persona natural o persona jurídica?',
    type: 'single_choice',
    isRequired: true,
    options: [
      { id: 'opt_1', label: 'Persona natural', value: 'individual' },
      { id: 'opt_2', label: 'Persona jurídica', value: 'legal_entity' },
    ],
  };

  it('renders open text question prompt and textarea with character count', () => {
    const onChange = vi.fn();
    render(
      <QuestionCard
        question={mockOpenTextQuestion}
        value="Servicio de consultoría"
        onChange={onChange}
      />
    );

    expect(screen.getByText('Describe el bien o servicio que necesitas')).toBeDefined();
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.value).toBe('Servicio de consultoría');
    expect(screen.getByText(/caracteres/i)).toBeDefined();
  });

  it('renders single choice question options and calls onChange upon selection', () => {
    const onChange = vi.fn();
    render(
      <QuestionCard
        question={mockChoiceQuestion}
        value=""
        onChange={onChange}
      />
    );

    expect(
      screen.getByRole('heading', { name: '¿Eres persona natural o persona jurídica?' })
    ).toBeDefined();
    expect(screen.getByText('Persona natural')).toBeDefined();
    expect(screen.getByText('Persona jurídica')).toBeDefined();

    fireEvent.click(screen.getByLabelText('Persona natural'));
    expect(onChange).toHaveBeenCalledWith('individual');
  });

  it('renders inline error message with role="alert"', () => {
    render(
      <QuestionCard
        question={mockOpenTextQuestion}
        value=""
        onChange={vi.fn()}
        error="Este campo es requerido."
      />
    );

    const alert = screen.getByRole('alert');
    expect(alert).toBeDefined();
    expect(alert.textContent).toContain('Este campo es requerido.');
  });

  it('programmatically shifts focus to question heading on mount or question transition', () => {
    const { rerender } = render(
      <QuestionCard
        question={mockOpenTextQuestion}
        value=""
        onChange={vi.fn()}
      />
    );

    const heading = screen.getByRole('heading', { name: 'Describe el bien o servicio que necesitas' });
    expect(document.activeElement).toBe(heading);

    rerender(
      <QuestionCard
        question={mockChoiceQuestion}
        value=""
        onChange={vi.fn()}
      />
    );

    const nextHeading = screen.getByRole('heading', { name: '¿Eres persona natural o persona jurídica?' });
    expect(document.activeElement).toBe(nextHeading);
  });
});
