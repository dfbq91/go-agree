import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LandingFooter } from '../../src/components/landing/LandingFooter';
import { es } from '../../src/locales/es';

describe('LandingFooter Component', () => {
  it('renders brand name, tagline, and statutory legal disclaimer', () => {
    render(<LandingFooter />);

    expect(screen.getByText(es.brand.name)).toBeDefined();
    expect(screen.getByText(es.landing.footer.brandTagline)).toBeDefined();

    // Legal disclaimer
    const disclaimer = screen.getByText(es.landing.footer.legalDisclaimer);
    expect(disclaimer).toBeDefined();

    // Rights reserved
    expect(screen.getByText(new RegExp(es.landing.footer.rightsReserved))).toBeDefined();
  });

  it('renders in-page navigation anchor links', () => {
    render(<LandingFooter />);

    const howItWorksLink = screen.getByRole('link', {
      name: es.landing.nav.howItWorks,
    });
    expect(howItWorksLink.getAttribute('href')).toBe('#como-funciona');

    const pricingLink = screen.getByRole('link', {
      name: es.landing.nav.pricing,
    });
    expect(pricingLink.getAttribute('href')).toBe('#precios');
  });
});
