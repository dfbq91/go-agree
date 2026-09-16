import type { ContractDashboardItemDTO } from '@go-agree/application';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DeleteContractModal } from '../../src/components/dashboard/DeleteContractModal';
import { es } from '../../src/locales/es';

describe('DeleteContractModal Component (User Story 4)', () => {
  const mockContract: ContractDashboardItemDTO = {
    id: 'c-delete-1',
    userId: 'u-1',
    title: 'Acuerdo Confidencial Especial',
    status: 'in_progress',
    currentQuestionIndex: 2,
    questionsAnsweredCount: 2,
    hasGeneratedDocument: false,
    availableFormats: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('does not render when isOpen is false', () => {
    render(
      <DeleteContractModal
        isOpen={false}
        contract={mockContract}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('renders alertdialog with accessible title, message, and contract name when open', () => {
    render(
      <DeleteContractModal
        isOpen={true}
        contract={mockContract}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toBeDefined();
    expect(screen.getByText(es.dashboard.deleteModal.title)).toBeDefined();
    expect(screen.getByText(es.dashboard.deleteModal.message)).toBeDefined();
    expect(screen.getByText('Acuerdo Confidencial Especial')).toBeDefined();
  });

  it('calls onClose when clicking Cancelar or pressing Escape', () => {
    const handleClose = vi.fn();
    render(
      <DeleteContractModal
        isOpen={true}
        contract={mockContract}
        onClose={handleClose}
        onConfirm={vi.fn()}
      />
    );

    const cancelButton = screen.getByRole('button', { name: es.dashboard.deleteModal.cancel });
    fireEvent.click(cancelButton);
    expect(handleClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('calls onConfirm when clicking Eliminar', () => {
    const handleConfirm = vi.fn();
    render(
      <DeleteContractModal
        isOpen={true}
        contract={mockContract}
        onClose={vi.fn()}
        onConfirm={handleConfirm}
      />
    );

    const confirmButton = screen.getByRole('button', { name: es.dashboard.deleteModal.confirm });
    fireEvent.click(confirmButton);
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('disables buttons and shows deleting state when isDeleting is true', () => {
    render(
      <DeleteContractModal
        isOpen={true}
        contract={mockContract}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        isDeleting={true}
      />
    );

    const confirmButton = screen.getByRole('button', { name: es.dashboard.deleteModal.deleting });
    expect(confirmButton.getAttribute('disabled')).not.toBeNull();

    const cancelButton = screen.getByRole('button', { name: es.dashboard.deleteModal.cancel });
    expect(cancelButton.getAttribute('disabled')).not.toBeNull();
  });
});
