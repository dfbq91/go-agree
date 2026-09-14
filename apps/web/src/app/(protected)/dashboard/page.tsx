import React from 'react';
import { es } from '@/locales/es';
import { getServerAuthAdapter } from '@/lib/auth';
import { getServerContractRepository } from '@/lib/contracts';
import { getServerSubscriptionStatus } from '@/lib/subscription';
import { ListUserContractsUseCase, type SubscriptionStatusResult } from '@go-agree/application';
import { getFreeContractLimit } from '@go-agree/domain';
import { ContractList } from '@/components/dashboard/ContractList';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  let contracts: any[] = [];
  const defaultFreeLimit = getFreeContractLimit();
  let subscription: SubscriptionStatusResult = {
    planType: 'free',
    status: 'active',
    freeContractsUsed: 0,
    freeContractsLimit: defaultFreeLimit,
    remainingQuota: defaultFreeLimit,
    canGenerateContract: true,
    canInitiateCheckout: true,
    expiresAt: null,
    currentPeriodBillingCycle: null,
  };

  try {
    const authAdapter = getServerAuthAdapter();
    const session = await authAdapter.getCurrentSession();

    if (session) {
      const contractRepo = getServerContractRepository();
      const listUseCase = new ListUserContractsUseCase(contractRepo);
      contracts = await listUseCase.execute(session.userId);

      subscription = await getServerSubscriptionStatus(session.userId);
    }
  } catch {
    contracts = [];
  }

  return (
    <div>
      <DashboardHeader subscription={subscription} />

      <div className="mt-8">
        <ContractList contracts={contracts} />
      </div>
    </div>
  );
}
