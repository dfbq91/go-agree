import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { HowItWorksSection } from '../../src/components/landing/HowItWorksSection';
import { es } from '../../src/locales/es';

describe('HowItWorksSection Component', () => {
  it('renders section title, subtitle, and 3 sequential step cards', () => {
    render(<HowItWorksSection />);

    // Section title
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: es.landing.howItWorks.title,
      })
    ).toBeDefined();

    // Subtitle
    expect(screen.getByText(es.landing.howItWorks.subtitle)).toBeDefined();

    // Step 1
    expect(
      screen.getByText(es.landing.howItWorks.steps.step1.badge)
    ).toBeDefined();
    expect(
      screen.getByText(es.landing.howItWorks.steps.step1.title)
    ).toBeDefined();
    expect(
      screen.getByText(es.landing.howItWorks.steps.step1.description)
    ).toBeDefined();

    // Step 2
    expect(
      screen.getByText(es.landing.howItWorks.steps.step2.badge)
    ).toBeDefined();
    expect(
      screen.getByText(es.landing.howItWorks.steps.step2.title)
    ).toBeDefined();
    expect(
      screen.getByText(es.landing.howItWorks.steps.step2.description)
    ).toBeDefined();

    // Step 3
    expect(
      screen.getByText(es.landing.howItWorks.steps.step3.badge)
    ).toBeDefined();
    expect(
      screen.getByText(es.landing.howItWorks.steps.step3.title)
    ).toBeDefined();
    expect(
      screen.getByText(es.landing.howItWorks.steps.step3.description)
    ).toBeDefined();
  });

  it('strictly limits copy to actual capabilities without false promises', () => {
    const { container } = render(<HowItWorksSection />);
    const textContent = container.textContent?.toLowerCase() || '';

    // Prohibited terms
    expect(textContent).not.toContain('firma electrónica');
    expect(textContent).not.toContain('firma digital');
    expect(textContent).not.toContain('abogado');
    expect(textContent).not.toContain('revisión por abogado');
  });

  it('has anchor identifier "como-funciona" for in-page navigation', () => {
    const { container } = render(<HowItWorksSection />);
    const section = container.querySelector('section#como-funciona');
    expect(section).toBeDefined();
    expect(section).not.toBeNull();
  });
});
