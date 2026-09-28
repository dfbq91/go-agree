import { es } from '@/locales/es';
import type { ContractDashboardItemDTO } from '@go-agree/application';
import Link from 'next/link';
import { ClickToEditTitle } from './ClickToEditTitle';
import { DownloadDropdown } from './DownloadDropdown';

interface ContractTableRowProps {
  contract: ContractDashboardItemDTO;
  onDeleteClick?: (contract: ContractDashboardItemDTO) => void;
  onRename?: (contractId: string, newTitle: string) => Promise<void>;
  renderTitle?: (contract: ContractDashboardItemDTO) => React.ReactNode;
  renderDownload?: (contract: ContractDashboardItemDTO) => React.ReactNode;
}

export function ContractTableRow({
  contract,
  onDeleteClick,
  onRename,
  renderTitle,
  renderDownload,
}: ContractTableRowProps) {
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
    <tr className="hover:bg-surface-canvas transition-colors border-b border-border-subtle group">
      {/* 1. Título */}
      <td className="py-4 pl-4 pr-3 text-sm font-semibold text-gray-900 sm:pl-6">
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
      </td>

      {/* 2. Preguntas respondidas */}
      <td className="px-3 py-4 whitespace-nowrap text-sm">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" aria-hidden="true" />
          {es.dashboard.questionsAnsweredCount(contract.questionsAnsweredCount)}
        </span>
      </td>

      {/* 3. Descargar */}
      <td className="px-3 py-4 whitespace-nowrap text-sm">
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
      </td>

      {/* 4. Fecha de creación */}
      <td className="px-3 py-4 whitespace-nowrap text-xs text-gray-500 tabular-nums">
        {formattedCreatedAt}
      </td>

      {/* 5. Última modificación */}
      <td className="px-3 py-4 whitespace-nowrap text-xs text-gray-500 tabular-nums font-medium text-gray-700">
        {formattedUpdatedAt}
      </td>

      {/* 6. Acciones */}
      <td className="py-4 pl-3 pr-4 text-right text-xs font-semibold whitespace-nowrap sm:pr-6">
        <div className="inline-flex items-center justify-end gap-2">
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
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label={`${es.dashboard.columns.actions} - ${contract.title}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <span>{es.dashboard.deleteModal.confirm}</span>
          </button>
        </div>
      </td>
    </tr>
  );
}
