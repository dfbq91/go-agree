import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandingHeader } from '../../src/components/landing/LandingHeader';
import { es } from '../../src/locales/es';

describe('LandingHeader & MobileNavDrawer Components', () => {
  it('renders brand name and anchor links for desktop', () => {
    render(<LandingHeader isAuthenticated={false} />);

    expect(screen.getByText(es.brand.name)).toBeDefined();

    const howItWorksLink = screen.getAllByRole('link', {
      name: es.landing.nav.howItWorks,
    })[0];
    expect(howItWorksLink.getAttribute('href')).toBe('#como-funciona');

    const pricingLink = screen.getAllByRole('link', {
      name: es.landing.nav.pricing,
    })[0];
    expect(pricingLink.getAttribute('href')).toBe('#precios');
  });

  it('renders login and register buttons for unauthenticated visitors', () => {
    render(<LandingHeader isAuthenticated={false} />);

    const loginLinks = screen.getAllByRole('link', { name: es.nav.login });
    expect(loginLinks.length).toBeGreaterThan(0);
    expect(loginLinks[0].getAttribute('href')).toBe('/login');

    const registerLinks = screen.getAllByRole('link', {
      name: es.nav.register,
    });
    expect(registerLinks.length).toBeGreaterThan(0);
    expect(registerLinks[0].getAttribute('href')).toBe('/register');
  });

  it('renders dashboard link when authenticated', () => {
    render(<LandingHeader isAuthenticated={true} />);

    const dashboardLinks = screen.getAllByRole('link', {
      name: es.nav.dashboard,
    });
    expect(dashboardLinks.length).toBeGreaterThan(0);
    expect(dashboardLinks[0].getAttribute('href')).toBe('/dashboard');
  });

  it('opens and closes the mobile navigation drawer with accessible attributes', () => {
    render(<LandingHeader isAuthenticated={false} />);

    const menuButton = screen.getByRole('button', {
      name: es.landing.nav.openMenuAria,
    });
    expect(menuButton.getAttribute('aria-expanded')).toBe('false');

    // Click to open drawer
    fireEvent.click(menuButton);
    expect(menuButton.getAttribute('aria-expanded')).toBe('true');

    // Inside drawer: close button is accessible
    const closeButton = screen.getByRole('button', {
      name: es.landing.nav.closeMenuAria,
    });
    expect(closeButton).toBeDefined();

    // Pressing Escape closes drawer
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(menuButton.getAttribute('aria-expanded')).toBe('false');
  });
});
