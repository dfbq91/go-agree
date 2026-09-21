import type { QuestionDTO } from '@go-agree/application';
import { fireEvent, render } from '@testing-library/react';
import axe from 'axe-core';
import { describe, expect, it, vi } from 'vitest';
import { DownloadDropdown } from '../../src/components/dashboard/DownloadDropdown';
import { QuotaUpgradeModal } from '../../src/components/modals/QuotaUpgradeModal';
import { SummaryReview } from '../../src/components/questionnaire/SummaryReview';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/questionnaire/contract-a11y-test',
}));

describe('Document Generation WCAG 2.1 AA Accessibility Audit (axe-core)', () => {
  const axeOptions: axe.RunOptions = {
    rules: {
      // happy-dom / jsdom does not calculate CSS render trees for contrast
      'color-contrast': { enabled: false },
    },
  };

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
      id: 'q2_description',
      order: 2,
      prompt: 'Describe el bien o servicio que necesitas',
      type: 'open_text',
      isRequired: true,
    },
  ];

  const mockAnswers: Record<string, unknown> = {
    q0_party_role: 'client',
    q1_legal_personality: 'individual',
    q2_description: 'Desarrollo web accesible y seguro',
  };

  describe('SummaryReview Screen Accessibility', () => {
    it('passes audit in pre-generation review state with legal disclaimer callout', async () => {
      const { container } = render(
        <SummaryReview
          questions={mockQuestions}
          answers={mockAnswers}
          onEdit={vi.fn()}
          onConfirm={vi.fn()}
          isCompleted={false}
          isSubmitting={false}
        />
      );

      const results = await axe.run(container, axeOptions);
      expect(results.violations).toEqual([]);
    });

    it('passes audit when generation is in progress (aria-busy active)', async () => {
      const { container } = render(
        <SummaryReview
          questions={mockQuestions}
          answers={mockAnswers}
          onEdit={vi.fn()}
          onConfirm={vi.fn()}
          isCompleted={false}
          isSubmitting={true}
        />
      );

      const results = await axe.run(container, axeOptions);
      expect(results.violations).toEqual([]);
    });

    it('passes audit in completed state with Word and PDF download action buttons', async () => {
      const { container } = render(
        <SummaryReview
          questions={mockQuestions}
          answers={mockAnswers}
          onEdit={vi.fn()}
          onConfirm={vi.fn()}
          isCompleted={true}
          hasGeneratedDocument={true}
          onDownloadFormat={vi.fn()}
          onBackToDashboard={vi.fn()}
        />
      );

      const results = await axe.run(container, axeOptions);
      expect(results.violations).toEqual([]);
    });

    it('passes audit in pending regeneration state with warning banner', async () => {
      const { container } = render(
        <SummaryReview
          questions={mockQuestions}
          answers={mockAnswers}
          onEdit={vi.fn()}
          onConfirm={vi.fn()}
          isCompleted={true}
          hasGeneratedDocument={true}
          isRegenerationPending={true}
          onRegenerate={vi.fn()}
          isRegenerating={false}
        />
      );

      const results = await axe.run(container, axeOptions);
      expect(results.violations).toEqual([]);
    });
  });

  describe('Dashboard DownloadDropdown Accessibility', () => {
    it('passes audit when contract document is ready (dropdown closed)', async () => {
      const { container } = render(
        <DownloadDropdown
          contractId="test-contract-123"
          hasGeneratedDocument={true}
          isRegenerationPending={false}
        />
      );

      const results = await axe.run(container, axeOptions);
      expect(results.violations).toEqual([]);
    });

    it('passes audit when dropdown menu is expanded with options', async () => {
      const { container, getByRole } = render(
        <DownloadDropdown
          contractId="test-contract-123"
          hasGeneratedDocument={true}
          isRegenerationPending={false}
        />
      );

      const button = getByRole('button');
      fireEvent.click(button);

      const results = await axe.run(container, axeOptions);
      expect(results.violations).toEqual([]);
    });

    it('passes audit when contract has no generated document (disabled state)', async () => {
      const { container } = render(
        <DownloadDropdown
          contractId="test-contract-incomplete"
          hasGeneratedDocument={false}
          isRegenerationPending={false}
        />
      );

      const results = await axe.run(container, axeOptions);
      expect(results.violations).toEqual([]);
    });

    it('passes audit when contract has pending regeneration banner', async () => {
      const { container } = render(
        <DownloadDropdown
          contractId="test-contract-stale"
          hasGeneratedDocument={true}
          isRegenerationPending={true}
        />
      );

      const results = await axe.run(container, axeOptions);
      expect(results.violations).toEqual([]);
    });
  });

  describe('QuotaUpgradeModal Accessibility', () => {
    it('passes audit when rendered open to prompt Free user quota upgrade', async () => {
      const { container } = render(
        <QuotaUpgradeModal isOpen={true} onClose={vi.fn()} freeContractsLimit={3} />
      );

      const results = await axe.run(container, axeOptions);
      expect(results.violations).toEqual([]);
    });
  });
});
