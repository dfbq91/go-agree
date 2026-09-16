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
    <tr className="hover:bg-gray-50 transition-colors border-b border-gray-200">
      {/* 1. Título */}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
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
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
          {es.dashboard.questionsAnsweredCount(contract.questionsAnsweredCount)}
        </span>
      </td>

      {/* 3. Descargar */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {renderDownload ? (
          renderDownload(contract)
        ) : (
          <DownloadDropdown
            contractId={contract.id}
            hasGeneratedDocument={contract.hasGeneratedDocument}
            availableFormats={contract.availableFormats}
          />
        )}
      </td>

      {/* 4. Fecha de creación */}
      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{formattedCreatedAt}</td>

      {/* 5. Última modificación */}
      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{formattedUpdatedAt}</td>

      {/* 6. Acciones */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
        {isInProgress ? (
          <Link
            href={`/questionnaire?id=${contract.id}`}
            className="text-primary-600 hover:text-primary-900 text-xs font-medium hover:underline mr-3"
          >
            {es.dashboard.resumeDraft}
          </Link>
        ) : (
          <Link
            href={`/questionnaire?id=${contract.id}&mode=summary`}
            className="text-gray-600 hover:text-gray-900 text-xs font-medium hover:underline mr-3"
          >
            {es.dashboard.viewSummary}
          </Link>
        )}

        <button
          type="button"
          onClick={() => onDeleteClick?.(contract)}
          className="text-red-600 hover:text-red-900 text-xs font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-red-500 rounded p-1"
          aria-label={`${es.dashboard.columns.actions} - ${contract.title}`}
        >
          {es.dashboard.deleteModal.confirm}
        </button>
      </td>
    </tr>
  );
}
