'use client';

import type { SubscriptionStatusResult } from '@go-agree/application';
import Link from 'next/link';
import type React from 'react';
import { useState } from 'react';
import { es } from '../../locales/es';
import { QuotaUpgradeModal } from '../modals/QuotaUpgradeModal';
import { PlanQuotaBadge } from './PlanQuotaBadge';

export interface DashboardHeaderProps {
  readonly subscription: SubscriptionStatusResult;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ subscription }) => {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border-subtle">
      <div>
        <nav
          aria-label="Breadcrumb"
          className="flex items-center space-x-2 text-xs text-gray-500 mb-2 font-medium"
        >
          <Link href="/dashboard" className="hover:text-primary transition-colors">
            Plataforma
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-primary font-semibold">{es.dashboard.title}</span>
        </nav>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {es.dashboard.title}
          </h1>
          <PlanQuotaBadge
            planType={subscription.planType}
            status={subscription.status}
            freeContractsUsed={subscription.freeContractsUsed}
            freeContractsLimit={subscription.freeContractsLimit}
            remainingQuota={subscription.remainingQuota}
            onUpgradeClick={() => setIsUpgradeModalOpen(true)}
          />
        </div>
        <p className="text-sm text-gray-500 mt-1 max-w-2xl">
          Gestiona, audita, descarga y actualiza tus acuerdos comerciales con trazabilidad completa.
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {subscription.canGenerateContract ? (
          <Link
            href="/questionnaire"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-sm font-semibold shadow-sm hover:shadow transition-all active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>{es.dashboard.newContractButton}</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setIsUpgradeModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-sm font-semibold shadow-sm hover:shadow transition-all active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>{es.dashboard.newContractButton}</span>
          </button>
        )}
      </div>

      <QuotaUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        freeContractsLimit={subscription.freeContractsLimit}
      />
    </div>
  );
};
