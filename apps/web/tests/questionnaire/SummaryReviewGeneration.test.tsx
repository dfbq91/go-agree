import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SummaryReview } from '../../src/components/questionnaire/SummaryReview';
import { es } from '../../src/locales/es';

describe('SummaryReview - Generation & Download Controls (US1)', () => {
  const dummyQuestions = [
    {
      id: 'q0_party_role',
      order: 0,
      prompt: 'Indica si eres contratante o contratista',
      type: 'single_choice' as const,
      isRequired: true,
      options: [
        { id: '1', label: 'Contratante', value: 'client' },
        { id: '2', label: 'Contratista', value: 'contractor' },
      ],
    },
  ];

  it('renders prominent legal advice disclaimer before confirmation', () => {
    render(
      <SummaryReview
        questions={dummyQuestions}
        answers={{ q0_party_role: 'client' }}
        onEdit={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    const disclaimer = screen.getByRole('note');
    expect(disclaimer).toBeDefined();
    expect(disclaimer.textContent).toContain(es.questionnaire.summary.legalDisclaimerText);
  });

  it('displays loading state with aria-busy="true" during document generation', () => {
    render(
      <SummaryReview
        questions={dummyQuestions}
        answers={{ q0_party_role: 'client' }}
        onEdit={vi.fn()}
        onConfirm={vi.fn()}
        isSubmitting={true}
      />
    );

    const confirmBtn = screen.getByRole('button', { name: /generando/i });
    expect(confirmBtn).toBeDefined();
    expect(confirmBtn.getAttribute('aria-busy')).toBe('true');
    expect((confirmBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it('renders accessible Word and PDF download buttons when contract is completed', () => {
    const onDownloadWord = vi.fn();
    const onDownloadPdf = vi.fn();

    render(
      <SummaryReview
        questions={dummyQuestions}
        answers={{ q0_party_role: 'client' }}
        onEdit={vi.fn()}
        onConfirm={vi.fn()}
        isCompleted={true}
        hasGeneratedDocument={true}
        onDownloadFormat={(fmt) => {
          if (fmt === 'docx') onDownloadWord();
          if (fmt === 'pdf') onDownloadPdf();
        }}
      />
    );

    const wordBtn = screen.getByRole('button', { name: /descargar word/i });
    const pdfBtn = screen.getByRole('button', { name: /descargar pdf/i });

    expect(wordBtn).toBeDefined();
    expect(pdfBtn).toBeDefined();

    fireEvent.click(wordBtn);
    expect(onDownloadWord).toHaveBeenCalledTimes(1);

    fireEvent.click(pdfBtn);
    expect(onDownloadPdf).toHaveBeenCalledTimes(1);
  });
});
