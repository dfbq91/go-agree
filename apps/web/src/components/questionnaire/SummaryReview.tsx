import type { QuestionDTO } from '@go-agree/application';
import type React from 'react';
import { useState } from 'react';
import { es } from '../../locales/es';
import { QuotaUpgradeModal } from '../modals/QuotaUpgradeModal';

export interface SummaryReviewProps {
  questions: QuestionDTO[];
  answers: Record<string, unknown>;
  onEdit: (questionId: string) => void;
  onConfirm: () => void | Promise<void>;
  onBackToDashboard?: () => void;
  isSubmitting?: boolean;
  isCompleted?: boolean;
  hasGeneratedDocument?: boolean;
  onDownloadFormat?: (format: 'pdf' | 'docx') => void;
  isRegenerationPending?: boolean;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
  quotaModalOpen?: boolean;
  onCloseQuotaModal?: () => void;
  freeContractsLimit?: number;
  errorMessage?: string;
}

export const SummaryReview: React.FC<SummaryReviewProps> = ({
  questions,
  answers,
  onEdit,
  onConfirm,
  onBackToDashboard,
  isSubmitting = false,
  isCompleted = false,
  hasGeneratedDocument = false,
  onDownloadFormat,
  isRegenerationPending = false,
  onRegenerate,
  isRegenerating = false,
  quotaModalOpen,
  onCloseQuotaModal,
  freeContractsLimit,
  errorMessage,
}) => {
  const [internalQuotaModalOpen, setInternalQuotaModalOpen] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const isModalOpen = quotaModalOpen !== undefined ? quotaModalOpen : internalQuotaModalOpen;

  const handleConfirm = async () => {
    setSummaryError(null);
    try {
      await onConfirm();
    } catch (err: any) {
      if (
        err?.code === 'FREE_QUOTA_EXCEEDED' ||
        err?.message?.includes('FREE_QUOTA_EXCEEDED') ||
        err?.status === 403
      ) {
        setInternalQuotaModalOpen(true);
      } else {
        setSummaryError(err.message || 'Error al generar contrato');
      }
    }
  };

  const handleCloseModal = () => {
    setInternalQuotaModalOpen(false);
    onCloseQuotaModal?.();
  };
  const getAnswerDisplay = (question: QuestionDTO, answer: unknown): string => {
    if (answer === undefined || answer === null || answer === '') {
      return es.questionnaire.summary.notAnswered;
    }

    if (question.type === 'single_choice' && question.options) {
      let selectedVal = typeof answer === 'string' ? answer : '';
      let customDetail = '';

      if (typeof answer === 'object' && answer !== null && 'selection' in answer) {
        selectedVal = String((answer as any).selection);
        customDetail = String((answer as any).customValue || '');
      } else if (typeof answer === 'string' && answer.startsWith('other:')) {
        selectedVal = 'other';
        customDetail = answer.replace(/^other:\s*/, '');
      }

      const selected = question.options.find((opt) => opt.value === selectedVal);
      if (selected) {
        const tQuestion = (es.questionnaire.questions as Record<string, any>)[question.id];
        const optDict = tQuestion?.options?.[selected.value];
        const baseLabel = optDict?.label || selected.label;
        if (customDetail.trim().length > 0) {
          return `${baseLabel}: ${customDetail.trim()}`;
        }
        return baseLabel;
      }
      return String(answer);
    }

    if (question.type === 'multiple_choice' && Array.isArray(answer)) {
      if (answer.length === 0) {
        return es.questionnaire.summary.notAnswered;
      }
      return answer
        .map((item) => {
          let val = typeof item === 'string' ? item : '';
          let detail = '';
          if (typeof item === 'object' && item !== null && 'selection' in item) {
            val = String((item as any).selection);
            detail = String((item as any).customValue || '');
          } else if (typeof item === 'string' && item.startsWith('other:')) {
            val = 'other';
            detail = item.replace(/^other:\s*/, '');
          }

          const opt = question.options?.find((o) => o.value === val);
          const tQuestion = (es.questionnaire.questions as Record<string, any>)[question.id];
          const optDict = tQuestion?.options?.[val];
          const baseLabel = optDict?.label || opt?.label || val;
          return detail.trim().length > 0 ? `${baseLabel}: ${detail.trim()}` : baseLabel;
        })
        .join(', ');
    }

    return String(answer);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900">{es.questionnaire.summary.title}</h2>
        <p className="mt-1 text-sm text-gray-500">{es.questionnaire.summary.subtitle}</p>
      </div>

      {/* Error Alert */}
      {(errorMessage || summaryError) && (
        <div
          role="alert"
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-800 text-sm animate-in fade-in"
        >
          <span className="text-lg text-red-500" aria-hidden="true">
            ⚠️
          </span>
          <div>
            <p className="font-semibold text-red-900">Error</p>
            <p>{errorMessage || summaryError}</p>
          </div>
        </div>
      )}

      {/* Pending Regeneration Banner */}
      {isCompleted && isRegenerationPending && (
        <div
          role="alert"
          className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <span className="text-xl" aria-hidden="true">
              ⚠️
            </span>
            <div>
              <h3 className="text-sm font-semibold text-amber-900">
                {es.questionnaire.summary.pendingRegenerationBannerTitle}
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                {es.questionnaire.summary.pendingRegenerationBannerText}
              </p>
            </div>
          </div>
          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              disabled={isRegenerating}
              aria-busy={isRegenerating}
              className="whitespace-nowrap px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 disabled:opacity-50 transition-all"
            >
              {isRegenerating
                ? es.questionnaire.summary.regenerating
                : es.questionnaire.summary.regenerateAction}
            </button>
          )}
        </div>
      )}

      {/* Legal Advice Disclaimer Callout */}
      <div
        role="note"
        aria-label="Aviso legal"
        className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3 text-slate-700"
      >
        <span className="text-lg text-slate-500" aria-hidden="true">
          ℹ️
        </span>
        <div className="text-xs leading-relaxed">
          <p className="font-semibold text-slate-900 mb-0.5">
            {es.questionnaire.summary.legalDisclaimerTitle}
          </p>
          <p>{es.questionnaire.summary.legalDisclaimerText}</p>
        </div>
      </div>

      {/* Questions List */}
      <div className="divide-y divide-gray-100">
        {questions.map((question) => {
          const tQuestion = (es.questionnaire.questions as Record<string, any>)[question.id];
          const prompt = tQuestion?.prompt || question.prompt;
          const questionTitle = tQuestion?.title || question.id;
          const answer = answers[question.id];
          const display = getAnswerDisplay(question, answer);

          return (
            <div
              key={question.id}
              className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div className="flex-1 pr-4">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {questionTitle}
                </span>
                <h3 className="text-sm sm:text-base font-medium text-gray-900 mt-0.5">{prompt}</h3>
                <p className="mt-1 text-sm text-blue-900 bg-blue-50/50 p-2.5 rounded-lg inline-block w-full sm:w-auto">
                  {display}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onEdit(question.id)}
                className="self-start sm:self-center px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
              >
                {es.questionnaire.nav.modify}
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        {isCompleted || onBackToDashboard ? (
          <button
            type="button"
            onClick={() => {
              if (onBackToDashboard) {
                onBackToDashboard();
              } else if (typeof window !== 'undefined') {
                window.location.href = '/dashboard';
              }
            }}
            className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
          >
            {es.questionnaire.summary.backToDashboard}
          </button>
        ) : (
          <div />
        )}

        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
          {isCompleted && hasGeneratedDocument && !isRegenerationPending ? (
            <>
              <button
                type="button"
                onClick={() => onDownloadFormat?.('docx')}
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-medium text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center justify-center gap-2"
              >
                <span>📄</span>
                {es.questionnaire.summary.downloadWord}
              </button>
              <button
                type="button"
                onClick={() => onDownloadFormat?.('pdf')}
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center justify-center gap-2"
              >
                <span>📥</span>
                {es.questionnaire.summary.downloadPdf}
              </button>
            </>
          ) : !isCompleted ? (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting
                ? es.questionnaire.summary.generatingContract
                : es.questionnaire.summary.confirmAction}
            </button>
          ) : null}
        </div>
      </div>

      <QuotaUpgradeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        freeContractsLimit={freeContractsLimit}
      />
    </div>
  );
};
