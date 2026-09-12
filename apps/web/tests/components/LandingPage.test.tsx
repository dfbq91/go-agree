import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HomePage from '../../src/app/page';
import * as authLib from '../../src/lib/auth';
import { es } from '../../src/locales/es';

describe('Landing Page End-to-End Integration Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders all complete landing sections for an unauthenticated visitor', async () => {
    vi.spyOn(authLib, 'getServerAuthAdapter').mockReturnValue({
      getCurrentSession: vi.fn().mockResolvedValue(null),
    } as any);

    const Page = await HomePage();
    render(Page);

    // 1. Header
    const brandElements = screen.getAllByText(es.brand.name);
    expect(brandElements.length).toBeGreaterThan(0);

    const navHowItWorks = screen.getAllByRole('link', {
      name: es.landing.nav.howItWorks,
    });
    expect(navHowItWorks[0].getAttribute('href')).toBe('#como-funciona');

    const navPricing = screen.getAllByRole('link', {
      name: es.landing.nav.pricing,
    });
    expect(navPricing[0].getAttribute('href')).toBe('#precios');

    // 2. Hero Section
    expect(screen.getByText(es.landing.hero.title)).toBeDefined();
    expect(screen.getByText(es.landing.hero.subtitle)).toBeDefined();
    expect(screen.getByText(es.landing.hero.freeTrialBadge)).toBeDefined();

    const heroRegisterCta = screen.getByRole('link', {
      name: es.landing.hero.ctaPrimary,
    });
    expect(heroRegisterCta.getAttribute('href')).toBe('/register');

    // 3. How It Works Section
    expect(screen.getByText(es.landing.howItWorks.title)).toBeDefined();
    expect(screen.getByText(es.landing.howItWorks.steps.step1.title)).toBeDefined();
    expect(screen.getByText(es.landing.howItWorks.steps.step2.title)).toBeDefined();
    expect(screen.getByText(es.landing.howItWorks.steps.step3.title)).toBeDefined();

    // 4. Pricing Section
    expect(screen.getByText(es.landing.pricing.title)).toBeDefined();
    expect(
      screen.getByText(es.landing.pricing.freeTrialBanner.title)
    ).toBeDefined();

    // Default monthly price
    expect(screen.getByText(/49[.,]000/)).toBeDefined();

    // Toggle to Annual billing
    const annualRadio = screen.getByRole('radio', {
      name: new RegExp(es.landing.pricing.billingCycle.annual),
    });
    fireEvent.click(annualRadio);

    // Annual price per month
    expect(screen.getByText(/39[.,]000/)).toBeDefined();
    // Annual total
    expect(screen.getByText(/468[.,]000/)).toBeDefined();

    // 5. Footer
    expect(screen.getByText(es.landing.footer.brandTagline)).toBeDefined();
    expect(screen.getByText(es.landing.footer.legalDisclaimer)).toBeDefined();
  });

  it('adapts call-to-actions appropriately when visitor is authenticated', async () => {
    vi.spyOn(authLib, 'getServerAuthAdapter').mockReturnValue({
      getCurrentSession: vi.fn().mockResolvedValue({
        user: { id: 'test-user-id', email: 'usuario@ejemplo.com' },
      }),
    } as any);

    const Page = await HomePage();
    render(Page);

    // Header CTA points to dashboard
    const dashboardHeaderLinks = screen.getAllByRole('link', {
      name: es.nav.dashboard,
    });
    expect(dashboardHeaderLinks.length).toBeGreaterThan(0);
    expect(dashboardHeaderLinks[0].getAttribute('href')).toBe('/dashboard');

    // Hero and Pricing CTAs point to dashboard
    const dashboardCtas = screen.getAllByRole('link', {
      name: es.landing.hero.ctaDashboard,
    });
    expect(dashboardCtas.length).toBe(2);
    expect(dashboardCtas[0].getAttribute('href')).toBe('/dashboard');
    expect(dashboardCtas[1].getAttribute('href')).toBe('/dashboard');
  });
});
