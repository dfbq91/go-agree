'use client';

import { getFreeContractLimit } from '@go-agree/domain';
import Link from 'next/link';
import type React from 'react';
import { es } from '../../locales/es';

export interface PlanQuotaBadgeProps {
  readonly planType: 'free' | 'pro';
  readonly status?: 'active' | 'expired';
  readonly freeContractsUsed: number;
  readonly freeContractsLimit?: number;
  readonly remainingQuota: number;
  readonly onUpgradeClick?: () => void;
}

export const PlanQuotaBadge: React.FC<PlanQuotaBadgeProps> = ({
  planType,
  status = 'active',
  freeContractsUsed,
  freeContractsLimit = getFreeContractLimit(),
  remainingQuota,
  onUpgradeClick,
}) => {
  const isPro = planType === 'pro' && status === 'active';
  const isExhausted = !isPro && freeContractsUsed >= freeContractsLimit;

  if (isPro) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-blue-50/80 px-3.5 py-1 text-xs font-semibold text-primary shadow-2xs">
        <span className="inline-block h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
        <span className="font-bold">{es.plans.pro}</span>
        <span className="text-gray-400">•</span>
        <span className="text-gray-600">{es.plans.unlimitedAccess}</span>
      </div>
    );
  }

  const quotaText = es.plans.quotaMeter
    .replace('{used}', freeContractsUsed.toString())
    .replace('{max}', freeContractsLimit.toString())
    .replace('{remaining}', remainingQuota.toString());

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div
        className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-medium transition-all shadow-2xs ${
          isExhausted
            ? 'border-status-draft-border bg-status-draft-bg/60 text-status-draft-text'
            : 'border-border-subtle bg-surface-card text-gray-700'
        }`}
      >
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            isExhausted ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
          aria-hidden="true"
        />
        <span className="font-semibold">{es.plans.free}</span>
        <span aria-hidden="true">:</span>
        <span>{quotaText}</span>
      </div>

      {isExhausted &&
        (onUpgradeClick ? (
          <button
            type="button"
            onClick={onUpgradeClick}
            className="inline-flex items-center gap-1 justify-center rounded-full bg-primary hover:bg-primary-hover active:bg-primary-active px-3 py-1 text-xs font-semibold text-white shadow-xs transition-all active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>{es.plans.upgradeButton}</span>
          </button>
        ) : (
          <Link
            href="/checkout"
            className="inline-flex items-center gap-1 justify-center rounded-full bg-primary hover:bg-primary-hover active:bg-primary-active px-3 py-1 text-xs font-semibold text-white shadow-xs transition-all active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>{es.plans.upgradeButton}</span>
          </Link>
        ))}
    </div>
  );
};

