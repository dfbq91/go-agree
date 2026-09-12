/**
 * @file landing-ui.contract.ts
 * @description UI Component and View Model contracts for the go-agree Landing Page.
 */

import type { BillingCycle, PricingPlanConfig } from './pricing-port.contract';

export interface LandingNavigationLink {
  readonly label: string;
  readonly href: string;
  readonly isExternal?: boolean;
}

export interface LandingHeaderProps {
  readonly isAuthenticated: boolean;
  readonly navLinks: readonly LandingNavigationLink[];
}

export interface MobileNavDrawerProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly isAuthenticated: boolean;
  readonly navLinks: readonly LandingNavigationLink[];
}

export interface HeroSectionProps {
  readonly isAuthenticated: boolean;
  readonly freeContractsCount: number;
}

export interface WorkflowStepItem {
  readonly stepNumber: 1 | 2 | 3;
  readonly badge: string;
  readonly title: string;
  readonly description: string;
  readonly icon: 'questionnaire' | 'ai_analysis' | 'download_document';
}

export interface HowItWorksSectionProps {
  readonly steps: readonly WorkflowStepItem[];
}

export interface BillingToggleProps {
  readonly selectedCycle: BillingCycle;
  readonly onCycleChange: (cycle: BillingCycle) => void;
  readonly annualDiscountPercent: number;
}

export interface PricingCardProps {
  readonly plan: PricingPlanConfig;
  readonly selectedCycle: BillingCycle;
  readonly isAuthenticated: boolean;
}

export interface PricingSectionProps {
  readonly plan: PricingPlanConfig;
  readonly isAuthenticated: boolean;
}

export interface LandingFooterProps {
  readonly brandName: string;
  readonly disclaimer: string;
  readonly navLinks: readonly LandingNavigationLink[];
}
