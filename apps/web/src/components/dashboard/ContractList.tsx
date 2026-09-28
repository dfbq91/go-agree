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
    <div className="bg-surface-card border border-border-subtle rounded-xl shadow-xs p-5 flex flex-col justify-between space-y-4 hover:border-border-strong transition-all">
      <div>
        <div className="flex justify-between items-start gap-3 mb-2.5">
          <div className="font-semibold text-gray-900 line-clamp-1 flex-1">
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
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 border ${
              isInProgress
                ? 'bg-status-draft-bg text-status-draft-text border-status-draft-border'
                : 'bg-status-completed-bg text-status-completed-text border-status-completed-border'
            }`}
          >
            {!isInProgress && (
              <span
                className="w-1.5 h-1.5 rounded-full bg-status-completed-text"
                aria-hidden="true"
              />
            )}
            {isInProgress ? es.dashboard.statusInProgress : es.dashboard.statusCompleted}
          </span>
        </div>

        <div className="text-xs text-gray-500 space-y-1.5 mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">
              {es.dashboard.columns.questionsAnswered}:
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/50">
              {es.dashboard.questionsAnsweredCount(
                contract.questionsAnsweredCount ?? contract.currentQuestionIndex ?? 0
              )}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">{es.dashboard.columns.createdAt}:</span>
            <span className="tabular-nums text-gray-500">{formattedCreatedAt}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">{es.dashboard.columns.updatedAt}:</span>
            <span className="tabular-nums text-gray-700 font-medium">{formattedUpdatedAt}</span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-border-subtle flex items-center justify-between gap-3">
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

        <div className="flex items-center gap-2">
          {isInProgress ? (
            <Link
              href={`/questionnaire?id=${contract.id}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-xs font-semibold shadow-2xs transition-all active:scale-[0.99]"
            >
              <span>{es.dashboard.resumeDraft}</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          ) : (
            <Link
              href={`/questionnaire?id=${contract.id}&mode=summary`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-card hover:bg-surface-canvas border border-border-strong text-gray-800 text-xs font-semibold shadow-2xs transition-all active:scale-[0.99]"
            >
              <span>{es.dashboard.viewSummary}</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => onDeleteClick?.(contract)}
            className="text-gray-500 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg border border-transparent hover:border-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label={`${es.dashboard.columns.actions} - ${contract.title}`}
          >
            <span className="sr-only sm:not-sr-only text-xs font-medium mr-1">
              {es.dashboard.deleteModal.confirm}
            </span>
            <svg
              className="w-3.5 h-3.5 inline"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
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
      {/* Desktop: Semantic Table with horizontal scroll support */}
      <div className="hidden lg:block border border-border-subtle rounded-xl bg-surface-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border-subtle" role="table">
            <thead className="bg-surface-canvas border-b border-border-subtle">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-6 pr-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-600 font-sans"
                >
                  {es.dashboard.columns.title}
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-600 font-sans"
                >
                  {es.dashboard.columns.questionsAnswered}
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-600 font-sans"
                >
                  {es.dashboard.columns.download}
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-600 font-sans"
                >
                  {es.dashboard.columns.createdAt}
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-600 font-sans"
                >
                  {es.dashboard.columns.updatedAt}
                </th>
                <th
                  scope="col"
                  className="relative py-3.5 pl-3 pr-6 text-right text-[11px] font-bold uppercase tracking-wider text-gray-600 font-sans"
                >
                  {es.dashboard.columns.actions}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle bg-surface-card">
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
      </div>

      {/* Mobile & Tablet: Adaptive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden" role="list">
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
