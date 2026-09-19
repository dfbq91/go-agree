import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ContractDashboardItemDTO } from '@go-agree/application';
import { DownloadDropdown } from '../../src/components/dashboard/DownloadDropdown';
import { ContractTableRow } from '../../src/components/dashboard/ContractTableRow';
import { es } from '../../src/locales/es';

describe('DownloadDropdown Component (User Story 2 - Dashboard Retrieval)', () => {
  it('renders disabled trigger with tooltip when document is not generated', () => {
    render(<DownloadDropdown contractId="c-123" hasGeneratedDocument={false} />);

    const button = screen.getByRole('button', {
      name: new RegExp(es.dashboard.download.action, 'i'),
    });
    expect(button).toBeDefined();
    expect(button.getAttribute('disabled')).not.toBeNull();
    expect(button.getAttribute('title')).toBe(es.dashboard.download.tooltipNotGenerated);

    // Clicking should not open menu
    fireEvent.click(button);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('renders enabled trigger and opens accessible menu on click when document exists', () => {
    render(<DownloadDropdown contractId="c-456" hasGeneratedDocument={true} />);

    const trigger = screen.getByRole('button', {
      name: new RegExp(es.dashboard.download.action, 'i'),
    });
    expect(trigger).toBeDefined();
    expect(trigger.getAttribute('disabled')).toBeNull();
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    // Click to open
    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    const menu = screen.getByRole('menu');
    expect(menu).toBeDefined();

    // Verify PDF and DOCX options
    const pdfOption = screen.getByRole('menuitem', { name: /Descargar PDF/i });
    const docxOption = screen.getByRole('menuitem', { name: /Descargar Word/i });

    expect(pdfOption).toBeDefined();
    expect(docxOption).toBeDefined();

    // Verify links/actions
    expect(pdfOption.getAttribute('href')).toBe('/api/contracts/c-456/download?format=pdf');
    expect(docxOption.getAttribute('href')).toBe('/api/contracts/c-456/download?format=docx');
  });

  it('closes the menu on Escape key press and returns focus to trigger', () => {
    render(<DownloadDropdown contractId="c-789" hasGeneratedDocument={true} />);

    const trigger = screen.getByRole('button', {
      name: new RegExp(es.dashboard.download.action, 'i'),
    });
    fireEvent.click(trigger);
    expect(screen.getByRole('menu')).toBeDefined();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).toBeNull();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes the menu when clicking outside', () => {
    render(
      <div>
        <div data-testid="outside-element">Outside</div>
        <DownloadDropdown contractId="c-789" hasGeneratedDocument={true} />
      </div>
    );

    const trigger = screen.getByRole('button', {
      name: new RegExp(es.dashboard.download.action, 'i'),
    });
    fireEvent.click(trigger);
    expect(screen.getByRole('menu')).toBeDefined();

    fireEvent.mouseDown(screen.getByTestId('outside-element'));
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('renders "Actualización pendiente" badge linking to summary screen when isRegenerationPending is true', () => {
    render(
      <DownloadDropdown
        contractId="c-regen-1"
        hasGeneratedDocument={true}
        isRegenerationPending={true}
      />
    );

    // Should NOT render the standard download button
    expect(screen.queryByRole('button', { name: new RegExp(es.dashboard.download.action, 'i') })).toBeNull();

    // Should render the badge link
    const badge = screen.getByRole('link', {
      name: new RegExp(es.dashboard.download.pendingRegenerationBadge, 'i'),
    });
    expect(badge).toBeDefined();
    expect(badge.getAttribute('href')).toBe('/questionnaire?id=c-regen-1&mode=summary');
    expect(badge.getAttribute('title')).toBe(es.dashboard.download.pendingRegenerationTooltip);
  });

  it('supports opening the menu with ArrowDown key on trigger and navigating menu items', () => {
    render(<DownloadDropdown contractId="c-keyboard" hasGeneratedDocument={true} />);

    const trigger = screen.getByRole('button', {
      name: new RegExp(es.dashboard.download.action, 'i'),
    });

    // Pressing ArrowDown on trigger opens the menu and focuses first item
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    const menu = screen.getByRole('menu');
    expect(menu).toBeDefined();

    const pdfOption = screen.getByRole('menuitem', { name: /Descargar PDF/i });
    const docxOption = screen.getByRole('menuitem', { name: /Descargar Word/i });

    // Arrow navigation
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    fireEvent.keyDown(menu, { key: 'ArrowUp' });
    expect(pdfOption).toBeDefined();
    expect(docxOption).toBeDefined();
  });
});

describe('ContractTableRow Component - Download Column Integration (User Story 2)', () => {
  const baseContract: ContractDashboardItemDTO = {
    id: 'c-row-1',
    userId: 'u-1',
    title: 'Contrato de Software',
    status: 'completed',
    currentQuestionIndex: 11,
    questionsAnsweredCount: 11,
    totalQuestionsCount: 11,
    hasGeneratedDocument: true,
    isRegenerationPending: false,
    availableFormats: ['pdf', 'docx'],
    createdAt: '2026-09-16T10:00:00.000Z',
    updatedAt: '2026-09-16T10:00:00.000Z',
  };

  it('renders active download dropdown in contract row when documents are generated', () => {
    render(
      <table>
        <tbody>
          <ContractTableRow contract={baseContract} />
        </tbody>
      </table>
    );

    const trigger = screen.getByRole('button', {
      name: new RegExp(es.dashboard.download.action, 'i'),
    });
    expect(trigger).toBeDefined();
    expect(trigger.getAttribute('disabled')).toBeNull();
  });

  it('renders disabled download button in contract row when contract has not generated documents', () => {
    const draftContract: ContractDashboardItemDTO = {
      ...baseContract,
      id: 'c-row-draft',
      status: 'in_progress',
      hasGeneratedDocument: false,
      isRegenerationPending: false,
    };

    render(
      <table>
        <tbody>
          <ContractTableRow contract={draftContract} />
        </tbody>
      </table>
    );

    const button = screen.getByRole('button', {
      name: new RegExp(es.dashboard.download.action, 'i'),
    });
    expect(button).toBeDefined();
    expect(button.getAttribute('disabled')).not.toBeNull();
    expect(button.getAttribute('title')).toBe(es.dashboard.download.tooltipNotGenerated);
  });

  it('renders "Actualización pendiente" badge in contract row when regeneration is pending', () => {
    const pendingContract: ContractDashboardItemDTO = {
      ...baseContract,
      id: 'c-row-pending',
      hasGeneratedDocument: true,
      isRegenerationPending: true,
    };

    render(
      <table>
        <tbody>
          <ContractTableRow contract={pendingContract} />
        </tbody>
      </table>
    );

    const badge = screen.getByRole('link', {
      name: new RegExp(es.dashboard.download.pendingRegenerationBadge, 'i'),
    });
    expect(badge).toBeDefined();
    expect(badge.getAttribute('href')).toBe('/questionnaire?id=c-row-pending&mode=summary');
  });
});
