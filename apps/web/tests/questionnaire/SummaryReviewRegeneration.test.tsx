import type { QuestionDTO } from '@go-agree/application';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SummaryReview } from '../../src/components/questionnaire/SummaryReview';
import { es } from '../../src/locales/es';

const mockQuestions: QuestionDTO[] = [
  {
    id: 'q0_party_role',
    prompt: 'Indica si eres contratante o contratista',
    type: 'single_choice',
    order: 0,
    isRequired: true,
  },
  {
    id: 'q1_party_legal_nature',
    prompt: '¿Eres persona natural o persona jurídica?',
    type: 'single_choice',
    order: 1,
    isRequired: true,
  },
  {
    id: 'q2_scope_description',
    prompt: 'Describe el bien o servicio que necesitas',
    type: 'open_text',
    order: 2,
    isRequired: true,
  },
];

const mockAnswers: Record<string, unknown> = {
  q0_party_role: 'client',
  q1_party_legal_nature: 'natural',
  q2_scope_description: 'Servicio de desarrollo de software modificado',
};

describe('SummaryReview - Answer Modification and Document Regeneration (US3)', () => {
  it('displays "Actualización pendiente" banner and pauses downloads when isRegenerationPending is true', () => {
    const onRegenerateMock = vi.fn();

    render(
      <SummaryReview
        questions={mockQuestions}
        answers={mockAnswers}
        onEdit={vi.fn()}
        onConfirm={vi.fn()}
        isCompleted={true}
        hasGeneratedDocument={true}
        isRegenerationPending={true}
        onRegenerate={onRegenerateMock}
      />
    );

    // Banner is rendered
    const banner = screen.getByRole('alert');
    expect(banner).toBeDefined();
    expect(screen.getByText(es.questionnaire.summary.pendingRegenerationBannerTitle)).toBeDefined();
    expect(screen.getByText(es.questionnaire.summary.pendingRegenerationBannerText)).toBeDefined();

    // Regenerate action button is present
    const regenBtn = screen.getByRole('button', {
      name: new RegExp(es.questionnaire.summary.regenerateAction, 'i'),
    });
    expect(regenBtn).toBeDefined();

    // Word and PDF download buttons MUST be paused / hidden while regeneration is pending
    expect(screen.queryByRole('button', { name: /Descargar Word/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Descargar PDF/i })).toBeNull();
  });

  it('calls onRegenerate when clicking "Regenerar documento"', () => {
    const onRegenerateMock = vi.fn();

    render(
      <SummaryReview
        questions={mockQuestions}
        answers={mockAnswers}
        onEdit={vi.fn()}
        onConfirm={vi.fn()}
        isCompleted={true}
        hasGeneratedDocument={true}
        isRegenerationPending={true}
        onRegenerate={onRegenerateMock}
      />
    );

    const regenBtn = screen.getByRole('button', {
      name: new RegExp(es.questionnaire.summary.regenerateAction, 'i'),
    });
    fireEvent.click(regenBtn);

    expect(onRegenerateMock).toHaveBeenCalledTimes(1);
  });

  it('displays loading state with aria-busy="true" on regenerate button during regeneration', () => {
    render(
      <SummaryReview
        questions={mockQuestions}
        answers={mockAnswers}
        onEdit={vi.fn()}
        onConfirm={vi.fn()}
        isCompleted={true}
        hasGeneratedDocument={true}
        isRegenerationPending={true}
        onRegenerate={vi.fn()}
        isRegenerating={true}
      />
    );

    const regenBtn = screen.getByRole('button', {
      name: new RegExp(es.questionnaire.summary.regenerating, 'i'),
    });
    expect(regenBtn).toBeDefined();
    expect(regenBtn.getAttribute('aria-busy')).toBe('true');
    expect((regenBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it('re-enables Word and PDF download buttons and removes banner once regeneration is completed', () => {
    const onDownloadFormatMock = vi.fn();

    render(
      <SummaryReview
        questions={mockQuestions}
        answers={mockAnswers}
        onEdit={vi.fn()}
        onConfirm={vi.fn()}
        isCompleted={true}
        hasGeneratedDocument={true}
        isRegenerationPending={false}
        onDownloadFormat={onDownloadFormatMock}
      />
    );

    // Banner is not present
    expect(screen.queryByRole('alert')).toBeNull();

    // Download buttons are present
    const wordBtn = screen.getByRole('button', {
      name: /Descargar Word/i,
    });
    const pdfBtn = screen.getByRole('button', {
      name: /Descargar PDF/i,
    });

    expect(wordBtn).toBeDefined();
    expect(pdfBtn).toBeDefined();

    fireEvent.click(wordBtn);
    expect(onDownloadFormatMock).toHaveBeenCalledWith('docx');

    fireEvent.click(pdfBtn);
    expect(onDownloadFormatMock).toHaveBeenCalledWith('pdf');
  });
});
