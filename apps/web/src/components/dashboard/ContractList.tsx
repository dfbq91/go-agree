import React from 'react';
import Link from 'next/link';
import { es } from '@/locales/es';
import type { ContractGenerationSummaryDTO } from '@go-agree/application';

interface ContractListProps {
  contracts: ContractGenerationSummaryDTO[];
}

export function ContractCard({ contract }: { contract: ContractGenerationSummaryDTO }) {
  const isInProgress = contract.status === 'in_progress';
  const formattedDate = new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(contract.updatedAt));

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-lg font-semibold text-gray-900 line-clamp-1">{contract.title}</h2>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isInProgress
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {isInProgress ? es.dashboard.statusInProgress : es.dashboard.statusCompleted}
          </span>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          {es.dashboard.lastModified}: {formattedDate}
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
        {isInProgress ? (
          <Link
            href={`/questionnaire?contractId=${contract.id}`}
            className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 focus:outline-none focus:underline"
          >
            {es.dashboard.resumeDraft} →
          </Link>
        ) : (
          <Link
            href={`/questionnaire?contractId=${contract.id}`}
            className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:underline"
          >
            {es.dashboard.viewDocument} →
          </Link>
        )}
      </div>
    </div>
  );
}

export function ContractList({ contracts }: ContractListProps) {
  if (contracts.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300 p-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h2 className="mt-2 text-base font-medium text-gray-900">{es.dashboard.emptyTitle}</h2>
        <p className="mt-1 text-sm text-gray-500">{es.dashboard.emptySubtitle}</p>
        <div className="mt-6">
          <Link
            href="/questionnaire"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {es.dashboard.createFirstContract}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
      {contracts.map((contract) => (
        <li key={contract.id}>
          <ContractCard contract={contract} />
        </li>
      ))}
    </ul>
  );
}
