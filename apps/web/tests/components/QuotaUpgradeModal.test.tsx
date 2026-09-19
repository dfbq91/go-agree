import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QuotaUpgradeModal } from '../../src/components/modals/QuotaUpgradeModal';
import { es } from '../../src/locales/es';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('QuotaUpgradeModal Component (US4)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(<QuotaUpgradeModal isOpen={false} onClose={vi.fn()} />);

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders accessible dialog with title, description, and CTA button when open', () => {
    render(<QuotaUpgradeModal isOpen={true} onClose={vi.fn()} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeDefined();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-labelledby')).toBe('modal-title');

    expect(screen.getByText(es.plans.upgradeModalTitle)).toBeDefined();
    expect(screen.getByText(es.plans.upgradeModalDescription)).toBeDefined();

    const ctaButton = screen.getByRole('button', { name: es.plans.upgradeModalCta });
    expect(ctaButton).toBeDefined();

    const closeButton = screen.getByRole('button', { name: es.plans.upgradeModalClose });
    expect(closeButton).toBeDefined();
  });

  it('formats description according to custom freeContractsLimit', () => {
    render(<QuotaUpgradeModal isOpen={true} onClose={vi.fn()} freeContractsLimit={2} />);

    expect(screen.getByText(es.plans.formatUpgradeModalDescription(2))).toBeDefined();
  });

  it('navigates to /checkout when clicking the CTA button by default', () => {
    render(<QuotaUpgradeModal isOpen={true} onClose={vi.fn()} />);

    const ctaButton = screen.getByRole('button', { name: es.plans.upgradeModalCta });
    fireEvent.click(ctaButton);

    expect(mockPush).toHaveBeenCalledWith('/checkout');
  });

  it('calls onUpgrade callback when provided and CTA button is clicked', () => {
    const handleUpgrade = vi.fn();
    render(<QuotaUpgradeModal isOpen={true} onClose={vi.fn()} onUpgrade={handleUpgrade} />);

    const ctaButton = screen.getByRole('button', { name: es.plans.upgradeModalCta });
    fireEvent.click(ctaButton);

    expect(handleUpgrade).toHaveBeenCalledTimes(1);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('calls onClose when clicking the close button', () => {
    const handleClose = vi.fn();
    render(<QuotaUpgradeModal isOpen={true} onClose={handleClose} />);

    const closeButton = screen.getByRole('button', { name: es.plans.upgradeModalClose });
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when pressing the Escape key', () => {
    const handleClose = vi.fn();
    render(<QuotaUpgradeModal isOpen={true} onClose={handleClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking the backdrop overlay', () => {
    const handleClose = vi.fn();
    render(<QuotaUpgradeModal isOpen={true} onClose={handleClose} />);

    const backdrop = screen.getByTestId('quota-modal-backdrop');
    fireEvent.click(backdrop);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
