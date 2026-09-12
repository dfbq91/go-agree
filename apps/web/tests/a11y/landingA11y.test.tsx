import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import axe from 'axe-core';
import { LandingHeader } from '../../src/components/landing/LandingHeader';
import { MobileNavDrawer } from '../../src/components/landing/MobileNavDrawer';
import { HeroSection } from '../../src/components/landing/HeroSection';
import { HowItWorksSection } from '../../src/components/landing/HowItWorksSection';
import { BillingToggle } from '../../src/components/landing/BillingToggle';
import { PricingCard } from '../../src/components/landing/PricingCard';
import { PricingSection } from '../../src/components/landing/PricingSection';
import { LandingFooter } from '../../src/components/landing/LandingFooter';
import { CountryPricingRegistry } from '@go-agree/domain';

describe('Landing Page WCAG 2.1 AA Accessibility Audit (axe-core)', () => {
  afterEach(() => {
    cleanup();
  });

  const axeOptions: axe.RunOptions = {
    rules: {
      // happy-dom does not calculate CSS render trees for contrast
      'color-contrast': { enabled: false },
    },
  };

  const samplePlan = CountryPricingRegistry.getPlanForCountry('CO');

  it('LandingHeader passes accessibility checks when unauthenticated', async () => {
    const { container } = render(
      <LandingHeader isAuthenticated={false} />
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it('LandingHeader passes accessibility checks when authenticated', async () => {
    const { container } = render(
      <LandingHeader isAuthenticated={true} />
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it('MobileNavDrawer passes accessibility checks when open', async () => {
    const { container } = render(
      <MobileNavDrawer
        isOpen={true}
        onClose={() => {}}
        isAuthenticated={false}
      />
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it('HeroSection passes accessibility checks (unauthenticated)', async () => {
    const { container } = render(
      <HeroSection isAuthenticated={false} freeContractsCount={3} />
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it('HeroSection passes accessibility checks (authenticated)', async () => {
    const { container } = render(
      <HeroSection isAuthenticated={true} freeContractsCount={3} />
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it('HowItWorksSection passes accessibility checks', async () => {
    const { container } = render(<HowItWorksSection />);
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it('BillingToggle passes accessibility checks for monthly cycle', async () => {
    const { container } = render(
      <BillingToggle
        selectedCycle="monthly"
        onCycleChange={() => {}}
        savingsPercentage={20}
      />
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it('BillingToggle passes accessibility checks for annual cycle', async () => {
    const { container } = render(
      <BillingToggle
        selectedCycle="annual"
        onCycleChange={() => {}}
        savingsPercentage={20}
      />
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it('PricingCard passes accessibility checks', async () => {
    const { container } = render(
      <PricingCard
        plan={samplePlan}
        selectedCycle="monthly"
        isAuthenticated={false}
      />
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it('PricingSection passes accessibility checks', async () => {
    const { container } = render(
      <PricingSection plan={samplePlan} isAuthenticated={false} />
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it('LandingFooter passes accessibility checks', async () => {
    const { container } = render(<LandingFooter />);
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it('Full Landing Page composition passes accessibility audit', async () => {
    const { container } = render(
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <LandingHeader isAuthenticated={false} />
        <main id="main-content" className="flex-1">
          <HeroSection isAuthenticated={false} freeContractsCount={3} />
          <HowItWorksSection />
          <PricingSection plan={samplePlan} isAuthenticated={false} />
        </main>
        <LandingFooter />
      </div>
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });
});
