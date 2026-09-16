import type { ContractDashboardItemDTO } from '@go-agree/application';
import { fireEvent, render } from '@testing-library/react';
import axe from 'axe-core';
import { describe, expect, it } from 'vitest';
import { ClickToEditTitle } from '../../src/components/dashboard/ClickToEditTitle';
import { ContractList } from '../../src/components/dashboard/ContractList';
import { DashboardEmptyState } from '../../src/components/dashboard/DashboardEmptyState';
import { DeleteContractModal } from '../../src/components/dashboard/DeleteContractModal';
import { DownloadDropdown } from '../../src/components/dashboard/DownloadDropdown';
import { es } from '../../src/locales/es';

describe('Dashboard WCAG 2.1 AA Accessibility Audit (axe-core)', () => {
  const axeOptions: axe.RunOptions = {
    rules: {
      // jsdom/happy-dom does not calculate computed styles for color contrast
      'color-contrast': { enabled: false },
    },
  };

  const sampleContract: ContractDashboardItemDTO = {
    id: 'c-a11y-1',
    userId: 'u-1',
    title: 'Acuerdo Confidencial A11y',
    status: 'in_progress',
    currentQuestionIndex: 2,
    questionsAnsweredCount: 2,
    hasGeneratedDocument: false,
    availableFormats: [],
    createdAt: new Date('2026-09-01T10:00:00Z'),
    updatedAt: new Date('2026-09-10T12:00:00Z'),
  };

  const completedContract: ContractDashboardItemDTO = {
    id: 'c-a11y-2',
    userId: 'u-1',
    title: 'Acuerdo de Arriendo Completado',
    status: 'completed',
    currentQuestionIndex: 12,
    questionsAnsweredCount: 12,
    hasGeneratedDocument: true,
    availableFormats: ['pdf', 'docx'],
    createdAt: new Date('2026-09-02T10:00:00Z'),
    updatedAt: new Date('2026-09-12T12:00:00Z'),
  };

  it('DashboardEmptyState passes accessibility checks without violations', async () => {
    const { container } = render(<DashboardEmptyState />);
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it('ContractList with contracts passes accessibility checks without violations', async () => {
    const { container } = render(<ContractList contracts={[sampleContract, completedContract]} />);
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it('DeleteContractModal passes accessibility checks without violations', async () => {
    const { container } = render(
      <DeleteContractModal
        isOpen={true}
        contract={sampleContract}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it('DownloadDropdown in closed and open states passes accessibility checks', async () => {
    const { container, getByRole } = render(
      <DownloadDropdown contractId="c-a11y-2" hasGeneratedDocument={true} />
    );

    let results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);

    // Open dropdown
    fireEvent.click(getByRole('button', { name: new RegExp(es.dashboard.download.action, 'i') }));
    results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it('ClickToEditTitle in view and editing states passes accessibility checks', async () => {
    const { container, getByRole } = render(
      <ClickToEditTitle
        contractId="c-a11y-1"
        initialTitle="Título Accesible"
        resumeUrl="/questionnaire?id=c-a11y-1"
      />
    );

    let results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);

    // Trigger edit mode
    fireEvent.click(getByRole('button', { name: es.dashboard.rename.ariaLabel }));
    results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });
});
