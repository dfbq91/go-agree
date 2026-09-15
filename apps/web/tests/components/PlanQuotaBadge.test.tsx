import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PlanQuotaBadge } from '../../src/components/dashboard/PlanQuotaBadge';
import { QuotaUpgradeModal } from '../../src/components/dashboard/QuotaUpgradeModal';
import { es } from '../../src/locales/es';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/dashboard',
}));

describe('PlanQuotaBadge & QuotaUpgradeModal Components', () => {
  describe('PlanQuotaBadge', () => {
    it('renders free plan badge with exact quota usage count and remaining count', () => {
      render(
        <PlanQuotaBadge
          planType="free"
          status="active"
          freeContractsUsed={1}
          freeContractsLimit={3}
          remainingQuota={2}
        />
      );

      expect(screen.getByText(es.plans.free)).toBeDefined();
      expect(screen.getByText(/1 de 3/)).toBeDefined();
      expect(screen.getByText(/2 restantes|2 disponibles/)).toBeDefined();
    });

    it('renders pro plan badge with unlimited access badge', () => {
      render(
        <PlanQuotaBadge
          planType="pro"
          status="active"
          freeContractsUsed={3}
          freeContractsLimit={3}
          remainingQuota={9999}
        />
      );

      expect(screen.getByText(es.plans.pro)).toBeDefined();
      expect(screen.getByText(es.plans.unlimitedAccess)).toBeDefined();
    });

    it('renders quota exhausted state when 3/3 contracts used on free plan', () => {
      render(
        <PlanQuotaBadge
          planType="free"
          status="active"
          freeContractsUsed={3}
          freeContractsLimit={3}
          remainingQuota={0}
        />
      );

      expect(screen.getByText(/3 de 3/)).toBeDefined();
      expect(screen.getByText(es.plans.upgradeButton)).toBeDefined();
    });
  });

  describe('QuotaUpgradeModal', () => {
    it('renders upgrade modal with Spanish messaging and CTA leading to checkout', () => {
      const onClose = vi.fn();
      const onUpgrade = vi.fn();

      render(<QuotaUpgradeModal isOpen={true} onClose={onClose} onUpgrade={onUpgrade} />);

      expect(screen.getByText(es.plans.upgradeModalTitle)).toBeDefined();
      expect(screen.getByText(es.plans.upgradeModalDescription)).toBeDefined();

      const upgradeBtn = screen.getByRole('button', { name: es.plans.upgradeModalCta });
      fireEvent.click(upgradeBtn);
      expect(onUpgrade).toHaveBeenCalledOnce();

      const closeBtn = screen.getByRole('button', { name: es.plans.upgradeModalClose });
      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalledOnce();
    });

    it('renders upgrade modal with custom freeContractsLimit messaging', () => {
      render(<QuotaUpgradeModal isOpen={true} onClose={vi.fn()} freeContractsLimit={5} />);

      expect(
        screen.getByText(
          'Has generado tus 5 contratos gratuitos. Para continuar creando contratos ilimitados y acceder a todas las funciones profesionales, adquiere el Plan Pro.'
        )
      ).toBeDefined();
    });

    it('does not render when isOpen is false', () => {
      render(<QuotaUpgradeModal isOpen={false} onClose={vi.fn()} />);

      expect(screen.queryByText(es.plans.upgradeModalTitle)).toBeNull();
    });
  });
});
