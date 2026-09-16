import type { ContractDashboardItemDTO } from '@go-agree/application';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ContractList } from '../../src/components/dashboard/ContractList';
import { es } from '../../src/locales/es';

describe('ContractList Component (Dashboard UI & Spanish Localization)', () => {
  it('renders empty state when no contracts exist', () => {
    render(<ContractList contracts={[]} />);

    expect(screen.getByText(es.dashboard.emptyTitle)).toBeDefined();
    expect(screen.getByText(es.dashboard.emptySubtitle)).toBeDefined();
    expect(screen.getByText(es.dashboard.createFirstContract)).toBeDefined();
  });

  it('renders 6-column table of contracts with proper headers and data', () => {
    const mockContracts: ContractDashboardItemDTO[] = [
      {
        id: 'c-1',
        userId: 'u-1',
        title: 'Contrato de Confidencialidad',
        status: 'in_progress',
        currentQuestionIndex: 2,
        questionsAnsweredCount: 3,
        hasGeneratedDocument: false,
        availableFormats: [],
        createdAt: new Date('2026-09-01T10:00:00Z'),
        updatedAt: new Date('2026-09-15T12:00:00Z'),
      },
      {
        id: 'c-2',
        userId: 'u-1',
        title: 'Acuerdo de Servicios',
        status: 'completed',
        currentQuestionIndex: 12,
        questionsAnsweredCount: 12,
        hasGeneratedDocument: true,
        availableFormats: ['pdf', 'docx'],
        createdAt: new Date('2026-09-05T10:00:00Z'),
        updatedAt: new Date('2026-09-10T12:00:00Z'),
      },
    ];

    render(<ContractList contracts={mockContracts} />);

    // Verify 6 column headers
    expect(screen.getByRole('columnheader', { name: es.dashboard.columns.title })).toBeDefined();
    expect(
      screen.getByRole('columnheader', { name: es.dashboard.columns.questionsAnswered })
    ).toBeDefined();
    expect(screen.getByRole('columnheader', { name: es.dashboard.columns.download })).toBeDefined();
    expect(
      screen.getByRole('columnheader', { name: es.dashboard.columns.createdAt })
    ).toBeDefined();
    expect(
      screen.getByRole('columnheader', { name: es.dashboard.columns.updatedAt })
    ).toBeDefined();
    expect(screen.getByRole('columnheader', { name: es.dashboard.columns.actions })).toBeDefined();

    // Verify row contents (present in both desktop table and mobile card views)
    expect(screen.getAllByText('Contrato de Confidencialidad').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Acuerdo de Servicios').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('3 respondidas').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('12 respondidas').length).toBeGreaterThanOrEqual(1);
  });

  it('handles safe deletion flow with confirmation modal and optimistic removal', async () => {
    const mockContracts: ContractDashboardItemDTO[] = [
      {
        id: 'c-del-test',
        userId: 'u-1',
        title: 'Contrato a Eliminar Test',
        status: 'in_progress',
        currentQuestionIndex: 1,
        questionsAnsweredCount: 1,
        hasGeneratedDocument: false,
        availableFormats: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const handleDelete = vi.fn().mockResolvedValue(undefined);

    render(<ContractList contracts={mockContracts} onDeleteContract={handleDelete} />);

    // Click delete button on the row
    const deleteButton = screen.getAllByRole('button', {
      name: new RegExp(es.dashboard.deleteModal.confirm, 'i'),
    })[0];
    fireEvent.click(deleteButton);

    // Modal dialog appears
    const modal = screen.getByRole('alertdialog');
    expect(modal).toBeDefined();
    expect(screen.getByText(es.dashboard.deleteModal.title)).toBeDefined();

    // Click cancel first
    const cancelButton = screen.getByRole('button', { name: es.dashboard.deleteModal.cancel });
    fireEvent.click(cancelButton);
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(screen.getAllByText('Contrato a Eliminar Test').length).toBeGreaterThanOrEqual(1);

    // Click delete button again and confirm
    fireEvent.click(
      screen.getAllByRole('button', {
        name: new RegExp(es.dashboard.deleteModal.confirm, 'i'),
      })[0]
    );
    const confirmDeleteButton = screen
      .getAllByRole('button', { name: es.dashboard.deleteModal.confirm })
      .find((btn) => btn.closest('[role="alertdialog"]'));
    expect(confirmDeleteButton).toBeDefined();
    await act(async () => {
      fireEvent.click(confirmDeleteButton!);
    });

    // onDeleteContract was called
    expect(handleDelete).toHaveBeenCalledWith('c-del-test');

    // Contract was optimistically removed from the UI
    expect(screen.queryByText('Contrato a Eliminar Test')).toBeNull();
    expect(screen.getByText(es.dashboard.emptyTitle)).toBeDefined();
  });
});
