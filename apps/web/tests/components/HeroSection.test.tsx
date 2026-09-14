import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { HeroSection } from '../../src/components/landing/HeroSection';
import { es } from '../../src/locales/es';

describe('HeroSection Component', () => {
  it('renders value proposition headline, subtitle, and 3-free-contracts badge', () => {
    render(<HeroSection isAuthenticated={false} freeContractsCount={3} />);

    // Value proposition heading
    const heading = screen.getByRole('heading', {
      level: 1,
      name: es.landing.hero.title,
    });
    expect(heading).toBeDefined();

    // Subtitle
    expect(screen.getByText(es.landing.hero.subtitle)).toBeDefined();

    // 3 free contracts badge
    expect(screen.getByText(es.landing.hero.freeTrialBadge)).toBeDefined();
  });

  it('renders registration and login CTAs for unauthenticated visitors', () => {
    render(<HeroSection isAuthenticated={false} freeContractsCount={3} />);

    const primaryCta = screen.getByRole('link', {
      name: es.landing.hero.ctaPrimary,
    });
    expect(primaryCta.getAttribute('href')).toBe('/register');

    const secondaryCta = screen.getByRole('link', {
      name: es.landing.hero.ctaSecondary,
    });
    expect(secondaryCta.getAttribute('href')).toBe('/login');
  });

  it('renders dashboard CTA for authenticated users', () => {
    render(<HeroSection isAuthenticated={true} freeContractsCount={3} />);

    const dashboardCta = screen.getByRole('link', {
      name: es.landing.hero.ctaDashboard,
    });
    expect(dashboardCta.getAttribute('href')).toBe('/dashboard');

    // Should not display registration CTA
    expect(
      screen.queryByRole('link', { name: es.landing.hero.ctaPrimary })
    ).toBeNull();
  });

  it('renders dynamic free contracts badge and note when custom freeContractsCount is provided', () => {
    render(<HeroSection isAuthenticated={false} freeContractsCount={5} />);

    expect(screen.getByText('🎁 5 contratos gratis sin tarjeta de crédito')).toBeDefined();
    expect(
      screen.getByText('Regístrate hoy y redacta tus primeros 5 contratos totalmente gratis.')
    ).toBeDefined();
  });
});

