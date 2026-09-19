'use client';

import { getFreeContractLimit } from '@go-agree/domain';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useEffect } from 'react';
import { es } from '../../locales/es';

export interface QuotaUpgradeModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onUpgrade?: () => void;
  readonly freeContractsLimit?: number;
}

const QuotaUpgradeModalContent: React.FC<QuotaUpgradeModalProps> = ({
  onClose,
  onUpgrade,
  freeContractsLimit,
}) => {
  let router: any = null;
  try {
    router = useRouter();
  } catch {
    router = null;
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const limit = freeContractsLimit ?? getFreeContractLimit();
  const modalDescription =
    freeContractsLimit !== undefined && es.plans.formatUpgradeModalDescription
      ? es.plans.formatUpgradeModalDescription(limit)
      : es.plans.upgradeModalDescription;

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else if (router && typeof router.push === 'function') {
      router.push('/checkout');
    } else if (typeof window !== 'undefined') {
      window.location.href = '/checkout';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="fixed inset-0"
        aria-hidden="true"
        data-testid="quota-modal-backdrop"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl z-10 bg-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h2 id="modal-title" className="text-lg font-bold text-foreground text-gray-900">
            {es.plans.upgradeModalTitle}
          </h2>
        </div>

        <p className="text-sm text-muted-foreground text-gray-600 mb-6 leading-relaxed">
          {modalDescription}
        </p>

        <div className="flex flex-col gap-2.5 sm:flex-row-reverse">
          <button
            type="button"
            onClick={handleUpgrade}
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-primary bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {es.plans.upgradeModalCta}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {es.plans.upgradeModalClose}
          </button>
        </div>
      </div>
    </div>
  );
};

export const QuotaUpgradeModal: React.FC<QuotaUpgradeModalProps> = (props) => {
  if (!props.isOpen) return null;
  return <QuotaUpgradeModalContent {...props} />;
};
