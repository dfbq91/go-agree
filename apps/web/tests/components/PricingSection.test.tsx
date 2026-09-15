import { COLOMBIA_PRICING_PLAN } from '@go-agree/domain';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PricingSection } from '../../src/components/landing/PricingSection';
import { es } from '../../src/locales/es';

describe('PricingSection Component', () => {
  it('renders section title, subtitle, and 3-free-contracts banner', () => {
    render(<PricingSection plan={COLOMBIA_PRICING_PLAN} isAuthenticated={false} />);

    // Section title & subtitle
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: es.landing.pricing.title,
      })
    ).toBeDefined();
    expect(screen.getByText(es.landing.pricing.subtitle)).toBeDefined();

    // 3 free contracts banner
    expect(screen.getByText(es.landing.pricing.freeTrialBanner.title)).toBeDefined();
    expect(screen.getByText(es.landing.pricing.freeTrialBanner.description)).toBeDefined();
  });

  it('renders default monthly price and updates on annual toggle', () => {
    render(<PricingSection plan={COLOMBIA_PRICING_PLAN} isAuthenticated={false} />);

    // Default monthly fee
    expect(screen.getByText(/49[.,]000/)).toBeDefined();

    // Toggle to annual
    const annualRadio = screen.getByRole('radio', {
      name: new RegExp(es.landing.pricing.billingCycle.annual),
    });
    fireEvent.click(annualRadio);

    // Annual monthly fee & total
    expect(screen.getByText(/39[.,]000/)).toBeDefined();
    expect(screen.getByText(/468[.,]000/)).toBeDefined();
  });

  it('renders realistic feature capability list without false promises', () => {
    const { container } = render(
      <PricingSection plan={COLOMBIA_PRICING_PLAN} isAuthenticated={false} />
    );

    // Real features
    expect(screen.getByText('Generación ilimitada de contratos legales')).toBeDefined();
    expect(screen.getByText('Descarga directa en formato Word (.docx) y PDF')).toBeDefined();

    // Negative assertions
    const textContent = container.textContent?.toLowerCase() || '';
    expect(textContent).not.toContain('firma electrónica');
    expect(textContent).not.toContain('revisión por abogado');
  });

  it('routes CTA to registration for unauthenticated users', () => {
    render(<PricingSection plan={COLOMBIA_PRICING_PLAN} isAuthenticated={false} />);

    const cta = screen.getByRole('link', {
      name: es.landing.pricing.cta,
    });
    expect(cta.getAttribute('href')).toBe('/register');
  });

  it('has anchor identifier "precios" for in-page navigation', () => {
    const { container } = render(
      <PricingSection plan={COLOMBIA_PRICING_PLAN} isAuthenticated={false} />
    );
    const section = container.querySelector('section#precios');
    expect(section).not.toBeNull();
  });

  it('renders dynamic free contracts banner when plan defines custom freeContractsIncluded', () => {
    const customPlan = {
      ...COLOMBIA_PRICING_PLAN,
      freeContractsIncluded: 7,
    };

    render(<PricingSection plan={customPlan} isAuthenticated={false} />);

    expect(screen.getByText('7 contratos gratis incluidos')).toBeDefined();
    expect(
      screen.getByText(
        'Crea tu cuenta sin costo y genera tus primeros 7 contratos completos antes de suscribirte. Sin tarjeta de crédito requerida.'
      )
    ).toBeDefined();
  });
});
