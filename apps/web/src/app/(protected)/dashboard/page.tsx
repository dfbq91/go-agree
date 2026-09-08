import React from 'react';
import Link from 'next/link';
import { es } from '@/locales/es';
import { getServerAuthAdapter } from '@/lib/auth';
import { getServerContractRepository } from '@/lib/contracts';
import { ListUserContractsUseCase } from '@go-agree/application';
import { ContractList } from '@/components/dashboard/ContractList';

export default async function DashboardPage() {
  let contracts: any[] = [];

  try {
    const authAdapter = getServerAuthAdapter();
    const session = await authAdapter.getCurrentSession();

    if (session) {
      const contractRepo = getServerContractRepository();
      const listUseCase = new ListUserContractsUseCase(contractRepo);
      contracts = await listUseCase.execute(session.userId);
    }
  } catch {
    contracts = [];
  }

  return (
    <div>
      <div className="flex justify-between items-center pb-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">{es.dashboard.title}</h1>
        <Link
          href="/questionnaire"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {es.dashboard.newContractButton}
        </Link>
      </div>

      <div className="mt-8">
        <ContractList contracts={contracts} />
      </div>
    </div>
  );
}
