'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { es } from '../../locales/es';
import { PlanQuotaBadge } from './PlanQuotaBadge';
import { QuotaUpgradeModal } from './QuotaUpgradeModal';
import type { SubscriptionStatusResult } from '@go-agree/application';

export interface DashboardHeaderProps {
  readonly subscription: SubscriptionStatusResult;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ subscription }) => {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 pb-6 border-b border-gray-200 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{es.dashboard.title}</h1>
        </div>
        <div className="mt-2">
          <PlanQuotaBadge
            planType={subscription.planType}
            status={subscription.status}
            freeContractsUsed={subscription.freeContractsUsed}
            freeContractsLimit={subscription.freeContractsLimit}
            remainingQuota={subscription.remainingQuota}
            onUpgradeClick={() => setIsUpgradeModalOpen(true)}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {subscription.canGenerateContract ? (
          <Link
            href="/questionnaire"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {es.dashboard.newContractButton}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setIsUpgradeModalOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {es.dashboard.newContractButton}
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
