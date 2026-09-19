import type { QuestionDTO } from '@go-agree/application';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SummaryReview } from '../../src/components/questionnaire/SummaryReview';
import { es } from '../../src/locales/es';

describe('Legal Disclaimer Callout (US5 / FR-003)', () => {
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
  ];

  const mockAnswers: Record<string, unknown> = {
    q0_party_role: 'client',
  };

  it('renders prominent legal disclaimer callout with role="note" before generation', () => {
    render(
      <SummaryReview
        questions={mockQuestions}
        answers={mockAnswers}
        onEdit={vi.fn()}
        onConfirm={vi.fn()}
        isCompleted={false}
      />
    );

    const disclaimerCallout = screen.getByRole('note', { name: /aviso legal/i });
    expect(disclaimerCallout).toBeDefined();

    expect(
      screen.getByText(es.questionnaire.summary.legalDisclaimerTitle)
    ).toBeDefined();
    expect(
      screen.getByText(es.questionnaire.summary.legalDisclaimerText)
    ).toBeDefined();
  });

  it('renders disclaimer callout even when reviewing a completed contract', () => {
    render(
      <SummaryReview
        questions={mockQuestions}
        answers={mockAnswers}
        onEdit={vi.fn()}
        onConfirm={vi.fn()}
        isCompleted={true}
        hasGeneratedDocument={true}
      />
    );

    const disclaimerCallout = screen.getByRole('note');
    expect(disclaimerCallout).toBeDefined();
    expect(
      screen.getByText(es.questionnaire.summary.legalDisclaimerTitle)
    ).toBeDefined();
  });

  it('has accessible heading structure inside the callout', () => {
    render(
      <SummaryReview
        questions={mockQuestions}
        answers={mockAnswers}
        onEdit={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    const disclaimerCallout = screen.getByRole('note');
    expect(disclaimerCallout.getAttribute('aria-label')).toMatch(/aviso legal/i);
    expect(disclaimerCallout.textContent).toContain(
      'No constituye asesoría legal profesional'
    );
  });
});
