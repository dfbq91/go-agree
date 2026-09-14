import { CountryPricingRegistry, getFreeContractLimit } from '@go-agree/domain';
import { getServerAuthAdapter } from '@/lib/auth';
import { HeroSection } from '@/components/landing/HeroSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { PricingSection } from '@/components/landing/PricingSection';
import React from 'react';

export default async function HomePage() {
  let isAuthenticated = false;

  try {
    const authAdapter = getServerAuthAdapter();
    const session = await authAdapter.getCurrentSession();
    isAuthenticated = !!session;
  } catch {
    isAuthenticated = false;
  }

  const pricingPlan = CountryPricingRegistry.getPlanForCountry('CO');
  const freeContractsLimit = getFreeContractLimit();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation Header */}
      <LandingHeader isAuthenticated={isAuthenticated} />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1">
        <HeroSection isAuthenticated={isAuthenticated} freeContractsCount={freeContractsLimit} />
        <HowItWorksSection />
        <PricingSection
          plan={pricingPlan}
          isAuthenticated={isAuthenticated}
        />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}

