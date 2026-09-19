'use client';

import { es } from '@/locales/es';
import type { ContractDashboardItemDTO } from '@go-agree/application';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ClickToEditTitle } from './ClickToEditTitle';
import { ContractTableRow } from './ContractTableRow';
import { DashboardEmptyState } from './DashboardEmptyState';
import { DeleteContractModal } from './DeleteContractModal';
import { DownloadDropdown } from './DownloadDropdown';

interface ContractListProps {
  contracts: ContractDashboardItemDTO[];
  onDeleteContract?: (id: string) => Promise<void>;
  onRenameContract?: (id: string, newTitle: string) => Promise<void>;
  renderTitle?: (contract: ContractDashboardItemDTO) => React.ReactNode;
  renderDownload?: (contract: ContractDashboardItemDTO) => React.ReactNode;
  renderDeleteModal?: (props: {
    isOpen: boolean;
    contract: ContractDashboardItemDTO | null;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    isDeleting: boolean;
  }) => React.ReactNode;
}

export function ContractCardMobile({
  contract,
  onDeleteClick,
  onRename,
  renderTitle,
  renderDownload,
}: {
  contract: ContractDashboardItemDTO;
  onDeleteClick?: (contract: ContractDashboardItemDTO) => void;
  onRename?: (contractId: string, newTitle: string) => Promise<void>;
  renderTitle?: (contract: ContractDashboardItemDTO) => React.ReactNode;
  renderDownload?: (contract: ContractDashboardItemDTO) => React.ReactNode;
}) {
  const isInProgress = contract.status === 'in_progress';
  const createdAtDate = contract.createdAt
    ? new Date(contract.createdAt)
    : new Date(contract.updatedAt || Date.now());
  const formattedCreatedAt = new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(createdAtDate);

  const updatedAtDate = contract.updatedAt
    ? new Date(contract.updatedAt)
    : new Date(contract.createdAt || Date.now());
  const formattedUpdatedAt = new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(updatedAtDate);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 flex flex-col justify-between space-y-4">
      <div>
        <div className="flex justify-between items-start mb-2">
          <div className="font-semibold text-gray-900 line-clamp-1">
            {renderTitle ? (
              renderTitle(contract)
            ) : (
              <ClickToEditTitle
                contractId={contract.id}
                initialTitle={contract.title}
                resumeUrl={
                  isInProgress
                    ? `/questionnaire?id=${contract.id}`
                    : `/questionnaire?id=${contract.id}&mode=summary`
                }
                onSave={onRename ? (newTitle) => onRename(contract.id, newTitle) : undefined}
              />
            )}
          </div>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              isInProgress ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
            }`}
          >
            {isInProgress ? es.dashboard.statusInProgress : es.dashboard.statusCompleted}
          </span>
        </div>

        <div className="text-xs text-gray-500 space-y-1 mt-2">
          <p>
            <span className="font-medium text-gray-700">
              {es.dashboard.columns.questionsAnswered}:
            </span>{' '}
            <span className="text-blue-700 font-medium">
              {es.dashboard.questionsAnsweredCount(
                contract.questionsAnsweredCount ?? contract.currentQuestionIndex ?? 0
              )}
            </span>
          </p>
          <p>
            <span className="font-medium text-gray-700">{es.dashboard.columns.createdAt}:</span>{' '}
            {formattedCreatedAt}
          </p>
          <p>
            <span className="font-medium text-gray-700">{es.dashboard.columns.updatedAt}:</span>{' '}
            {formattedUpdatedAt}
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
        <div>
          {renderDownload ? (
            renderDownload(contract)
          ) : (
            <DownloadDropdown
              contractId={contract.id}
              hasGeneratedDocument={contract.hasGeneratedDocument}
              availableFormats={contract.availableFormats}
              isRegenerationPending={contract.isRegenerationPending}
            />
          )}
        </div>

        <div className="flex items-center space-x-3">
          {isInProgress ? (
            <Link
              href={`/questionnaire?id=${contract.id}`}
              className="text-primary-600 hover:text-primary-700 text-xs font-semibold hover:underline"
            >
              {es.dashboard.resumeDraft} →
            </Link>
          ) : (
            <Link
              href={`/questionnaire?id=${contract.id}&mode=summary`}
              className="text-gray-700 hover:text-gray-900 text-xs font-semibold hover:underline"
            >
              {es.dashboard.viewSummary} →
            </Link>
          )}

          <button
            type="button"
            onClick={() => onDeleteClick?.(contract)}
            className="text-red-600 hover:text-red-800 text-xs font-medium hover:underline p-1"
            aria-label={`${es.dashboard.columns.actions} - ${contract.title}`}
          >
            {es.dashboard.deleteModal.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}

function useSafeRouter() {
  try {
    return useRouter();
  } catch {
    return { refresh: () => {}, push: () => {} };
  }
}

export function ContractList({
  contracts: initialContracts,
  onDeleteContract,
  onRenameContract,
  renderTitle,
  renderDownload,
  renderDeleteModal,
}: ContractListProps) {
  const router = useSafeRouter();
  const [contracts, setContracts] = useState<ContractDashboardItemDTO[]>(initialContracts);
  const [selectedContractForDelete, setSelectedContractForDelete] =
    useState<ContractDashboardItemDTO | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Sync state when parent server component passes new contracts
  useEffect(() => {
    setContracts(initialContracts);
  }, [initialContracts]);

  const handleRename = async (contractId: string, newTitle: string) => {
    if (onRenameContract) {
      await onRenameContract(contractId, newTitle);
    } else {
      const res = await fetch(`/api/contracts/${contractId}/title`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
      if (!res.ok) {
        throw new Error('Failed to update title');
      }
    }
    setContracts((prev) => prev.map((c) => (c.id === contractId ? { ...c, title: newTitle } : c)));
  };

  const handleDeleteClick = (contract: ContractDashboardItemDTO) => {
    setDeleteError(null);
    setSelectedContractForDelete(contract);
  };

  const handleCloseDeleteModal = () => {
    if (!isDeleting) {
      setSelectedContractForDelete(null);
      setDeleteError(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedContractForDelete) return;

    const contractToDelete = selectedContractForDelete;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      if (onDeleteContract) {
        await onDeleteContract(contractToDelete.id);
      } else {
        const res = await fetch(`/api/contracts/${contractToDelete.id}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          throw new Error('Failed to delete contract');
        }
      }

      // Optimistically remove contract from local state immediately
      setContracts((prev) => prev.filter((c) => c.id !== contractToDelete.id));
      setSelectedContractForDelete(null);

      // Revalidate server component data in the background
      router.refresh();
    } catch {
      setDeleteError(es.dashboard.deleteModal.error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (contracts.length === 0) {
    return <DashboardEmptyState />;
  }

  // Ensure contracts are sorted by updatedAt descending
  const sortedContracts = [...contracts].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div>
      {/* Desktop / Tablet: Semantic Table */}
      <div className="hidden md:block overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg bg-white">
        <table className="min-w-full divide-y divide-gray-300" role="table">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-900 sm:pl-6"
              >
                {es.dashboard.columns.title}
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">
                {es.dashboard.columns.questionsAnswered}
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">
                {es.dashboard.columns.download}
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">
                {es.dashboard.columns.createdAt}
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">
                {es.dashboard.columns.updatedAt}
              </th>
              <th
                scope="col"
                className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right text-xs font-semibold text-gray-900"
              >
                {es.dashboard.columns.actions}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {sortedContracts.map((contract) => (
              <ContractTableRow
                key={contract.id}
                contract={contract}
                onDeleteClick={handleDeleteClick}
                onRename={handleRename}
                renderTitle={renderTitle}
                renderDownload={renderDownload}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: Adaptive Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden" role="list">
        {sortedContracts.map((contract) => (
          <div key={contract.id} role="listitem">
            <ContractCardMobile
              contract={contract}
              onDeleteClick={handleDeleteClick}
              onRename={handleRename}
              renderTitle={renderTitle}
              renderDownload={renderDownload}
            />
          </div>
        ))}
      </div>

      {/* Delete confirmation modal */}
      {renderDeleteModal ? (
        renderDeleteModal({
          isOpen: selectedContractForDelete !== null,
          contract: selectedContractForDelete,
          onClose: handleCloseDeleteModal,
          onConfirm: handleConfirmDelete,
          isDeleting,
        })
      ) : (
        <DeleteContractModal
          isOpen={selectedContractForDelete !== null}
          contract={selectedContractForDelete}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeleting}
          errorMessage={deleteError}
        />
      )}
    </div>
  );
}
