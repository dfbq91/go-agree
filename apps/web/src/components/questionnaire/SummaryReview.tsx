import type { QuestionDTO } from '@go-agree/application';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
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
  onRegenerate?: () => void | Promise<void>;
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
  const [hasTriggeredRegenerate, setHasTriggeredRegenerate] = useState(false);
  const downloadActionsRef = useRef<HTMLDivElement>(null);
  const prevIsRegenerating = useRef(isRegenerating);

  useEffect(() => {
    const wasRegenerating = prevIsRegenerating.current;
    prevIsRegenerating.current = isRegenerating;

    const canScrollToDownloads =
      isCompleted &&
      hasGeneratedDocument &&
      !isRegenerationPending &&
      !isRegenerating &&
      !errorMessage &&
      !summaryError;

    if (((wasRegenerating && !isRegenerating) || hasTriggeredRegenerate) && canScrollToDownloads) {
      if (hasTriggeredRegenerate) {
        setHasTriggeredRegenerate(false);
      }

      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

      downloadActionsRef.current?.scrollIntoView?.({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'center',
      });
    }
  }, [
    isRegenerating,
    isRegenerationPending,
    hasGeneratedDocument,
    isCompleted,
    hasTriggeredRegenerate,
    errorMessage,
    summaryError,
  ]);

  const handleRegenerate = async () => {
    setSummaryError(null);
    setHasTriggeredRegenerate(true);
    try {
      await onRegenerate?.();
    } catch (err: any) {
      setHasTriggeredRegenerate(false);
      setSummaryError(err.message || 'Error al regenerar el documento');
    }
  };

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
    <div className="space-y-6">
      {/* 1. Banners Institucionales Superiores */}
      <div className="space-y-3">
        {/* Banner de Éxito cuando el contrato está completado y listo */}
        {isCompleted && hasGeneratedDocument && !isRegenerationPending && (
          <div className="flex items-start justify-between p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 shadow-2xs">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm font-bold text-emerald-950">¡Respuestas completadas!</p>
                <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                  Tu contrato está listo para descargarse en formato Word o PDF.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {(errorMessage || summaryError) && (
          <div
            role="alert"
            className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800 text-sm shadow-2xs"
          >
            <svg
              className="w-5 h-5 text-red-500 mt-0.5 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
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
            className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs"
          >
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-amber-600 mt-0.5 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="text-sm font-bold text-amber-950">
                  {es.questionnaire.summary.pendingRegenerationBannerTitle}
                </h3>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  {es.questionnaire.summary.pendingRegenerationBannerText}
                </p>
              </div>
            </div>
            {onRegenerate && (
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={isRegenerating}
                aria-busy={isRegenerating}
                className="whitespace-nowrap px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 disabled:opacity-50 transition-all shrink-0"
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
          className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-gray-800 flex items-start gap-3.5 shadow-2xs"
        >
          <svg
            className="w-5 h-5 text-primary-600 mt-0.5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-xs leading-relaxed text-gray-600">
            <p className="text-gray-900 font-semibold mb-0.5">
              {es.questionnaire.summary.legalDisclaimerTitle}
            </p>
            <p>{es.questionnaire.summary.legalDisclaimerText}</p>
            <p className="mt-1 text-gray-500">
              Los documentos generados no incluyen firma electrónica; están listos para que las partes los firmen de forma física o externa fuera de la plataforma.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Distribución en 2 Columnas (65% / 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* COLUMNA IZQUIERDA: 65% (lg:col-span-8) - Lista de Preguntas */}
        <section className="lg:col-span-8 space-y-4">
          {/* Header de la Sección */}
          <div className="pb-3 border-b border-gray-200/80">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              {es.questionnaire.summary.title}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              {es.questionnaire.summary.subtitle}
            </p>
          </div>

          {/* Lista Secuencial de Tarjetas de Pregunta / Respuesta */}
          <div className="space-y-3 pt-1">
            {questions.map((question, index) => {
              const tQuestion = (es.questionnaire.questions as Record<string, any>)[question.id];
              const prompt = tQuestion?.prompt || question.prompt;
              const questionTitle = tQuestion?.title || question.id;
              const answer = answers[question.id];
              const display = getAnswerDisplay(question, answer);

              return (
                <article
                  key={question.id}
                  className="bg-white border border-gray-200/90 rounded-2xl p-5 hover:border-gray-300 transition-colors flex items-start justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg border border-gray-200/80 font-mono">
                        {index + 1}
                      </span>
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {questionTitle}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 leading-snug">
                      {prompt}
                    </h3>
                    <div className="mt-2 text-sm text-gray-900 font-medium pl-3 border-l-2 border-primary-500 bg-gray-50/70 py-2 px-3 rounded-r-xl">
                      {display}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onEdit(question.id)}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary-600 hover:text-primary-700 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/60 px-3 py-1.5 rounded-xl transition-colors shrink-0"
                  >
                    <span>{es.questionnaire.nav.modify}</span>
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                </article>
              );
            })}
          </div>

          {/* Botón Volver al Panel al pie de la columna izquierda */}
          {(isCompleted || onBackToDashboard) && (
            <div className="pt-4">
              <button
                type="button"
                onClick={() => {
                  if (onBackToDashboard) {
                    onBackToDashboard();
                  } else if (typeof window !== 'undefined') {
                    window.location.href = '/dashboard';
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200/90 rounded-xl shadow-xs transition-colors"
              >
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span>{es.questionnaire.summary.backToDashboard}</span>
              </button>
            </div>
          )}
        </section>

        {/* COLUMNA DERECHA: 35% (lg:col-span-4) - Panel Sticky de Descarga y Estado */}
        <aside className="lg:col-span-4 sticky top-24 space-y-6">
          <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-sm">
            {/* Header de la Tarjeta */}
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-base font-bold text-gray-900 tracking-tight">
                Descarga del Documento
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Selecciona el formato de exportación para tu contrato listo para imprimir o enviar.
              </p>
            </div>

            {/* Botones de Acción y Descarga */}
            <div
              ref={downloadActionsRef}
              data-testid="summary-download-actions"
              className="space-y-3.5 pt-5"
            >
              {isCompleted && hasGeneratedDocument && !isRegenerationPending ? (
                <>
                  {/* Botón Descargar PDF */}
                  <button
                    type="button"
                    onClick={() => onDownloadFormat?.('pdf')}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl border border-gray-200/90 hover:border-gray-300 hover:bg-gray-50/70 transition-all text-left group shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center justify-center font-bold text-xs shrink-0">
                        PDF
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {es.questionnaire.summary.downloadPdf}
                        </div>
                        <div className="text-xs text-gray-500">Documento oficial maquetado</div>
                      </div>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  </button>

                  {/* Botón Descargar Word */}
                  <button
                    type="button"
                    onClick={() => onDownloadFormat?.('docx')}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl border border-gray-200/90 hover:border-gray-300 hover:bg-gray-50/70 transition-all text-left group shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-primary-700 flex items-center justify-center font-bold text-xs shrink-0">
                        DOCX
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {es.questionnaire.summary.downloadWord}
                        </div>
                        <div className="text-xs text-gray-500">Editable para modificaciones de texto</div>
                      </div>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  </button>
                </>
              ) : isCompleted && isRegenerationPending ? (
                <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs leading-relaxed text-center space-y-1">
                  <p className="font-semibold text-amber-950">Descargas temporalmente pausadas</p>
                  <p className="text-amber-800">
                    Por favor regenera el documento usando el botón superior para compilar tus respuestas actualizadas.
                  </p>
                </div>
              ) : !isCompleted ? (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="w-4 h-4 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                        <span>{es.questionnaire.summary.generatingContract}</span>
                      </>
                    ) : (
                      <span>{es.questionnaire.summary.confirmAction}</span>
                    )}
                  </button>
                  <p className="text-xs text-center text-gray-500 leading-relaxed">
                    Al confirmar, el sistema estructurará las cláusulas y generará los documentos Word y PDF.
                  </p>
                </div>
              ) : null}
            </div>

            {/* Separador Fino */}
            <div className="border-t border-gray-100 my-5" aria-hidden="true" />

            {/* Sección de Uso de Cuenta y Cuota */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900">Uso de tu cuenta</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                  Plan Gratuito
                </span>
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>{freeContractsLimit || 3} contratos incluidos</span>
                  <span className="font-semibold text-gray-700">Sin tarjeta</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-600 rounded-full w-2/3" />
                </div>
              </div>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setInternalQuotaModalOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <span>Mejorar a Plan Pro</span>
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <QuotaUpgradeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        freeContractsLimit={freeContractsLimit}
      />
    </div>
  );
};
