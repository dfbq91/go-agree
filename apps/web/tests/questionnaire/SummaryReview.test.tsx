import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SummaryReview } from '../../src/components/questionnaire/SummaryReview';
import type { QuestionDTO } from '@go-agree/application';

describe('SummaryReview Component', () => {
  const mockQuestions: QuestionDTO[] = [
    {
      id: 'q0_party_role',
      order: 0,
      prompt: 'Indica si eres contratante o contratista',
      type: 'single_choice',
      isRequired: true,
      options: [
        { id: 'opt_1', label: 'Contratante', value: 'client' },
        { id: 'opt_2', label: 'Contratista', value: 'contractor' },
      ],
    },
    {
      id: 'q1_legal_personality',
      order: 1,
      prompt: '¿Eres persona natural o persona jurídica?',
      type: 'single_choice',
      isRequired: true,
      options: [
        { id: 'opt_1', label: 'Persona natural', value: 'individual' },
        { id: 'opt_2', label: 'Persona jurídica', value: 'legal_entity' },
      ],
    },
    {
      id: 'q2_description_conditions',
      order: 2,
      prompt: 'Describe el bien o servicio que necesitas y en qué condiciones lo requieres',
      type: 'open_text',
      isRequired: true,
    },
  ];

  const mockAnswers: Record<string, unknown> = {
    q0_party_role: 'client',
    q1_legal_personality: 'individual',
    q2_description_conditions: 'Servicio de desarrollo de software',
  };

  it('renders summary review with questions and user answers', () => {
    render(
      <SummaryReview
        questions={mockQuestions}
        answers={mockAnswers}
        onEdit={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText(/Resumen de Respuestas/i)).toBeDefined();
    expect(screen.getByText('Indica si eres contratante o contratista')).toBeDefined();
    expect(screen.getByText('Contratante')).toBeDefined();
    expect(screen.getByText('¿Eres persona natural o persona jurídica?')).toBeDefined();
    expect(screen.getByText('Persona natural')).toBeDefined();
    expect(screen.getByText('Describe el bien o servicio que necesitas y en qué condiciones lo requieres')).toBeDefined();
    expect(screen.getByText('Servicio de desarrollo de software')).toBeDefined();
  });

  it('calls onEdit when clicking Modificar on a specific question', () => {
    const onEdit = vi.fn();
    render(
      <SummaryReview
        questions={mockQuestions}
        answers={mockAnswers}
        onEdit={onEdit}
        onConfirm={vi.fn()}
      />
    );

    const editButtons = screen.getAllByRole('button', { name: /Modificar/i });
    expect(editButtons.length).toBe(3);

    fireEvent.click(editButtons[0]);
    expect(onEdit).toHaveBeenCalledWith('q0_party_role');
  });

  it('calls onConfirm when clicking Confirmar cuestionario', () => {
    const onConfirm = vi.fn();
    render(
      <SummaryReview
        questions={mockQuestions}
        answers={mockAnswers}
        onEdit={vi.fn()}
        onConfirm={onConfirm}
      />
    );

    const confirmButton = screen.getByRole('button', { name: /Confirmar/i });
    fireEvent.click(confirmButton);
    expect(onConfirm).toHaveBeenCalled();
  });

  it('renders Spanish titles instead of technical question IDs', () => {
    render(
      <SummaryReview
        questions={mockQuestions}
        answers={mockAnswers}
        onEdit={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    // Should display Spanish titles from es.ts
    expect(screen.getByText('Rol en el contrato')).toBeDefined();
    expect(screen.getByText('Personalidad jurídica')).toBeDefined();
    expect(screen.getByText('Descripción y condiciones del bien o servicio')).toBeDefined();
    // Should NOT display raw IDs as badges
    expect(screen.queryByText('q0_party_role')).toBeNull();
    expect(screen.queryByText('q1_legal_personality')).toBeNull();
    expect(screen.queryByText('q2_description_conditions')).toBeNull();
  });

  it('displays custom specification detail for other options', () => {
    const questionsWithOther: QuestionDTO[] = [
      {
        id: 'q8_termination_notice',
        order: 10,
        prompt: 'Define el plazo de preaviso',
        type: 'single_choice',
        isRequired: true,
        options: [
          { id: 'opt_1', label: '30 días calendario', value: 'days_30' },
          { id: 'opt_other', label: 'Otro plazo a especificar', value: 'other' },
        ],
      },
    ];

    const answersWithOther = {
      q8_termination_notice: {
        selection: 'other',
        customValue: '45 días calendario',
      },
    };

    render(
      <SummaryReview
        questions={questionsWithOther}
        answers={answersWithOther}
        onEdit={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText('Otro plazo a especificar: 45 días calendario')).toBeDefined();
  });

  it('renders "Volver al panel" when isCompleted is true', () => {
    render(
      <SummaryReview
        questions={mockQuestions}
        answers={mockAnswers}
        onEdit={vi.fn()}
        onConfirm={vi.fn()}
        isCompleted={true}
      />
    );

    expect(screen.getByRole('button', { name: /Volver al panel/i })).toBeDefined();
  });

  it('calls onBackToDashboard and does not call onConfirm when clicking "Volver al panel"', () => {
    const onConfirmMock = vi.fn();
    const onBackToDashboardMock = vi.fn();

    render(
      <SummaryReview
        questions={mockQuestions}
        answers={mockAnswers}
        onEdit={vi.fn()}
        onConfirm={onConfirmMock}
        onBackToDashboard={onBackToDashboardMock}
        isCompleted={true}
      />
    );

    const button = screen.getByRole('button', { name: /Volver al panel/i });
    button.click();

    expect(onBackToDashboardMock).toHaveBeenCalledTimes(1);
    expect(onConfirmMock).not.toHaveBeenCalled();
  });
});
