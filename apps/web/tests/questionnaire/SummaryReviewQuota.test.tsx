import type { QuestionDTO } from '@go-agree/application';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SummaryReview } from '../../src/components/questionnaire/SummaryReview';
import { es } from '../../src/locales/es';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockQuestions: QuestionDTO[] = [
  {
    id: 'q0_party_role',
    prompt: 'Indica si eres contratante o contratista',
    type: 'single_choice',
    order: 0,
    isRequired: true,
  },
];

const mockAnswers: Record<string, unknown> = {
  q0_party_role: 'client',
};

describe('SummaryReview - Quota Exceeded & Upgrade Modal Handling (US4)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens QuotaUpgradeModal when onConfirm fails with FREE_QUOTA_EXCEEDED error', async () => {
    const quotaError: any = new Error('Has alcanzado el límite de 3 contratos gratuitos');
    quotaError.code = 'FREE_QUOTA_EXCEEDED';
    quotaError.status = 403;

    const onConfirmMock = vi.fn().mockRejectedValue(quotaError);

    render(
      <SummaryReview
        questions={mockQuestions}
        answers={mockAnswers}
        onEdit={vi.fn()}
        onConfirm={onConfirmMock}
        isCompleted={false}
      />
    );

    // Modal is initially not open
    expect(screen.queryByRole('dialog')).toBeNull();

    // User clicks confirm
    const confirmButton = screen.getByRole('button', {
      name: new RegExp(es.questionnaire.summary.confirmAction, 'i'),
    });
    fireEvent.click(confirmButton);

    // Wait for reject handler
    expect(onConfirmMock).toHaveBeenCalledTimes(1);

    // Modal should now be open
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeDefined();
    expect(screen.getByText(es.plans.upgradeModalTitle)).toBeDefined();
    expect(screen.getByText(es.plans.upgradeModalDescription)).toBeDefined();

    // CTA button links to /checkout
    const ctaButton = screen.getByRole('button', { name: es.plans.upgradeModalCta });
    fireEvent.click(ctaButton);
    expect(mockPush).toHaveBeenCalledWith('/checkout');
  });

  it('allows dismissing QuotaUpgradeModal via close button', async () => {
    const quotaError: any = new Error('Limit reached');
    quotaError.code = 'FREE_QUOTA_EXCEEDED';

    const onConfirmMock = vi.fn().mockRejectedValue(quotaError);

    render(
      <SummaryReview
        questions={mockQuestions}
        answers={mockAnswers}
        onEdit={vi.fn()}
        onConfirm={onConfirmMock}
        isCompleted={false}
      />
    );

    const confirmButton = screen.getByRole('button', {
      name: new RegExp(es.questionnaire.summary.confirmAction, 'i'),
    });
    fireEvent.click(confirmButton);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeDefined();

    const closeButton = screen.getByRole('button', { name: es.plans.upgradeModalClose });
    fireEvent.click(closeButton);

    // Modal should be closed
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders general error alert when onConfirm fails with non-quota error', async () => {
    const genericError = new Error('Database error');
    const onConfirmMock = vi.fn().mockRejectedValue(genericError);

    render(
      <SummaryReview
        questions={mockQuestions}
        answers={mockAnswers}
        onEdit={vi.fn()}
        onConfirm={onConfirmMock}
        isCompleted={false}
      />
    );

    const confirmButton = screen.getByRole('button', {
      name: new RegExp(es.questionnaire.summary.confirmAction, 'i'),
    });
    fireEvent.click(confirmButton);

    // Alert rendered, modal NOT opened
    const alert = await screen.findByRole('alert');
    expect(alert).toBeDefined();
    expect(screen.getByText('Database error')).toBeDefined();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('respects external quotaModalOpen and onCloseQuotaModal props', () => {
    const onCloseMock = vi.fn();

    const { rerender } = render(
      <SummaryReview
        questions={mockQuestions}
        answers={mockAnswers}
        onEdit={vi.fn()}
        onConfirm={vi.fn()}
        isCompleted={false}
        quotaModalOpen={false}
        onCloseQuotaModal={onCloseMock}
      />
    );

    expect(screen.queryByRole('dialog')).toBeNull();

    rerender(
      <SummaryReview
        questions={mockQuestions}
        answers={mockAnswers}
        onEdit={vi.fn()}
        onConfirm={vi.fn()}
        isCompleted={false}
        quotaModalOpen={true}
        onCloseQuotaModal={onCloseMock}
        freeContractsLimit={2}
      />
    );

    expect(screen.getByRole('dialog')).toBeDefined();
    expect(screen.getByText(es.plans.formatUpgradeModalDescription(2))).toBeDefined();

    const closeButton = screen.getByRole('button', { name: es.plans.upgradeModalClose });
    fireEvent.click(closeButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
