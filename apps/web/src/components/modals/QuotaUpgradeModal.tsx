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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
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
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-primary border border-blue-100 shrink-0">
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
          <h2 id="modal-title" className="font-serif text-lg font-bold text-slate-900">
            {es.plans.upgradeModalTitle}
          </h2>
        </div>

        <p className="text-sm text-slate-600 mb-6 leading-relaxed">{modalDescription}</p>

        <div className="flex flex-col gap-2.5 sm:flex-row-reverse">
          <button
            type="button"
            onClick={handleUpgrade}
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-primary hover:bg-blue-700 active:bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {es.plans.upgradeModalCta}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
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
