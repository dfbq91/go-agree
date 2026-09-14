'use client';

import React from 'react';
import Link from 'next/link';
import { getFreeContractLimit } from '@go-agree/domain';
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
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
        <span className="inline-block h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
        <span className="font-bold">{es.plans.pro}</span>
        <span className="text-muted-foreground">•</span>
        <span>{es.plans.unlimitedAccess}</span>
      </div>
    );
  }

  const quotaText = es.plans.quotaMeter
    .replace('{used}', freeContractsUsed.toString())
    .replace('{max}', freeContractsLimit.toString())
    .replace('{remaining}', remainingQuota.toString());

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div
        className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium ${
          isExhausted
            ? 'border-amber-500/30 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
            : 'border-border bg-muted/50 text-foreground'
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

      {isExhausted && (
        onUpgradeClick ? (
          <button
            type="button"
            onClick={onUpgradeClick}
            className="inline-flex items-center justify-center rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {es.plans.upgradeButton}
          </button>
        ) : (
          <Link
            href="/checkout"
            className="inline-flex items-center justify-center rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {es.plans.upgradeButton}
          </Link>
        )
      )}
    </div>
  );
};
