import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BillingToggle } from '../../src/components/landing/BillingToggle';
import { es } from '../../src/locales/es';

describe('BillingToggle Component (WCAG 2.1 AA Accessibility)', () => {
  it('renders with role="radiogroup" and accessible radio options', () => {
    render(
      <BillingToggle selectedCycle="monthly" onCycleChange={vi.fn()} annualDiscountPercent={20} />
    );

    const radiogroup = screen.getByRole('radiogroup', {
      name: es.landing.pricing.billingCycle.label,
    });
    expect(radiogroup).toBeDefined();

    const monthlyRadio = screen.getByRole('radio', {
      name: es.landing.pricing.billingCycle.monthly,
    });
    const annualRadio = screen.getByRole('radio', {
      name: new RegExp(es.landing.pricing.billingCycle.annual),
    });

    expect(monthlyRadio.getAttribute('aria-checked')).toBe('true');
    expect(annualRadio.getAttribute('aria-checked')).toBe('false');
  });

  it('renders savings badge next to annual option', () => {
    render(
      <BillingToggle selectedCycle="monthly" onCycleChange={vi.fn()} annualDiscountPercent={20} />
    );

    expect(screen.getByText(es.landing.pricing.billingCycle.saveBadge)).toBeDefined();
  });

  it('calls onCycleChange when clicking the inactive radio option', () => {
    const onCycleChange = vi.fn();
    render(
      <BillingToggle
        selectedCycle="monthly"
        onCycleChange={onCycleChange}
        annualDiscountPercent={20}
      />
    );

    const annualRadio = screen.getByRole('radio', {
      name: new RegExp(es.landing.pricing.billingCycle.annual),
    });
    fireEvent.click(annualRadio);

    expect(onCycleChange).toHaveBeenCalledWith('annual');
  });

  it('supports keyboard arrow navigation between options', () => {
    const onCycleChange = vi.fn();
    render(
      <BillingToggle
        selectedCycle="monthly"
        onCycleChange={onCycleChange}
        annualDiscountPercent={20}
      />
    );

    const monthlyRadio = screen.getByRole('radio', {
      name: es.landing.pricing.billingCycle.monthly,
    });
    monthlyRadio.focus();

    fireEvent.keyDown(monthlyRadio, { key: 'ArrowRight' });
    expect(onCycleChange).toHaveBeenCalledWith('annual');
  });
});
