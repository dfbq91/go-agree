/**
 * @file checkout-ui.contract.ts
 * @description Presentation layer contract for Dashboard Quota, Multi-Provider Selection, and Checkout Result views.
 */

export interface PlanQuotaBadgeProps {
  readonly planType: 'free' | 'pro';
  readonly freeContractsUsed: number;
  readonly maxFreeContracts: number;
  readonly expiresAt?: string | null;
  readonly onUpgradeClick: () => void;
}

export interface PaymentProviderOption {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly supportedPaymentMethods: readonly string[];
  readonly logoKey: string;
  readonly isDefault: boolean;
}

export interface PaymentProviderSelectorProps {
  readonly providers: readonly PaymentProviderOption[];
  readonly selectedProviderId: string;
  readonly onSelectProvider: (providerId: string) => void;
  readonly disabled?: boolean;
}

export interface PlanCheckoutCardProps {
  readonly billingCycle: 'monthly' | 'annual';
  readonly onBillingCycleChange: (cycle: 'monthly' | 'annual') => void;
  readonly availableProviders: readonly PaymentProviderOption[];
  readonly selectedProviderId: string;
  readonly onSelectProvider: (providerId: string) => void;
  readonly onInitiateCheckout: () => Promise<void>;
  readonly isSubmitting: boolean;
  readonly errorMessage?: string | null;
}

export interface PaymentResultViewProps {
  readonly transactionReference: string;
  readonly status: 'pending' | 'approved' | 'rejected';
  readonly amountFormatted: string;
  readonly paymentMethodType?: string;
  readonly rejectionReason?: string;
  readonly isPolling: boolean;
  readonly onManualVerify: () => Promise<void>;
  readonly onRetryPayment: () => void;
  readonly onGoToDashboard: () => void;
}

export interface QuotaUpgradeModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly freeContractsUsed: number;
  readonly onUpgradeNow: () => void;
}
