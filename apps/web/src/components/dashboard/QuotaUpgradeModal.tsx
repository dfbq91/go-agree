'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { getFreeContractLimit } from '@go-agree/domain';
import { es } from '../../locales/es';

export interface QuotaUpgradeModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onUpgrade?: () => void;
  readonly freeContractsLimit?: number;
}

export const QuotaUpgradeModal: React.FC<QuotaUpgradeModalProps> = ({
  isOpen,
  onClose,
  onUpgrade,
  freeContractsLimit,
}) => {
  const router = useRouter();

  if (!isOpen) return null;

  const limit = freeContractsLimit ?? getFreeContractLimit();
  const modalDescription =
    freeContractsLimit !== undefined && es.plans.formatUpgradeModalDescription
      ? es.plans.formatUpgradeModalDescription(limit)
      : es.plans.upgradeModalDescription;

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      router.push('/checkout');
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
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl z-10">
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
          <h2 id="modal-title" className="text-lg font-bold text-foreground">
            {es.plans.upgradeModalTitle}
          </h2>
        </div>

        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {modalDescription}
        </p>

        <div className="flex flex-col gap-2.5 sm:flex-row-reverse">
          <button
            type="button"
            onClick={handleUpgrade}
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {es.plans.upgradeModalCta}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/60 transition-colors"
          >
            {es.plans.upgradeModalClose}
          </button>
        </div>
      </div>
    </div>
  );
};
