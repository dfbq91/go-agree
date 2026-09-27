import Link from 'next/link';
import type React from 'react';
import { es } from '../../locales/es';
import { InlineTitleEditor } from './InlineTitleEditor';

export interface QuestionnaireHeaderProps {
  title: string;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  onSaveTitle: (newTitle: string) => Promise<void> | void;
  currentStep?: number;
  totalSteps?: number;
}

export const QuestionnaireHeader: React.FC<QuestionnaireHeaderProps> = ({
  title,
  saveStatus,
  onSaveTitle,
  currentStep,
  totalSteps,
}) => {
  return (
    <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
      {/* Lado Izquierdo: Volver al Dashboard, divisor y Título editable */}
      <div className="flex items-center flex-wrap gap-4 sm:gap-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors py-1 group focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
        >
          <span className="mr-1.5 transition-transform group-hover:-translate-x-0.5">←</span>
          <span>{es.nav.dashboard}</span>
        </Link>

        <div className="hidden sm:block h-4 w-[1px] bg-gray-200" aria-hidden="true" />

        <div className="flex-1 min-w-[200px]">
          <InlineTitleEditor initialTitle={title} onSave={onSaveTitle} />
        </div>
      </div>

      {/* Lado Derecho: Indicador de paso discreto y Guardado automático */}
      <div className="flex items-center gap-3 sm:gap-4 self-end sm:self-auto">
        {currentStep !== undefined && totalSteps !== undefined && (
          <div className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200 whitespace-nowrap">
            Pregunta {currentStep} de {totalSteps}
          </div>
        )}

        {/* Indicador de persistencia */}
        <div className="text-xs">
          {saveStatus === 'saving' && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
              {es.questionnaire.savingStatus}
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
              <span className="text-emerald-600 font-bold">✓</span>
              {es.questionnaire.savedStatus}
            </span>
          )}
          {saveStatus === 'error' && (
            <span
              role="alert"
              className="inline-flex items-center text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full text-xs font-medium border border-amber-200"
            >
              {es.questionnaire.saveError}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
