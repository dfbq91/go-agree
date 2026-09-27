import type React from 'react';
import { es } from '../../locales/es';

export interface NavigationControlsProps {
  onPrevious?: () => void;
  onNext: () => void;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  isLoading?: boolean;
  error?: string;
  isEditingFromSummary?: boolean;
  onUpdateAnswer?: () => void;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  onPrevious,
  onNext,
  isFirstQuestion,
  isLastQuestion,
  isLoading = false,
  error,
  isEditingFromSummary = false,
  onUpdateAnswer,
}) => {
  return (
    <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      {/* Botón Anterior */}
      <div>
        {!isFirstQuestion && onPrevious && (
          <button
            type="button"
            onClick={onPrevious}
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-2xs"
          >
            <span className="mr-1.5">←</span>
            <span>{es.questionnaire.nav.previous}</span>
          </button>
        )}
      </div>

      {/* Botones de acción derecha y estado de error */}
      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
        {error && (
          <div role="alert" className="text-xs sm:text-sm text-red-600 font-medium animate-fade-in">
            {error}
          </div>
        )}

        {isEditingFromSummary && onUpdateAnswer && (
          <button
            type="button"
            onClick={onUpdateAnswer}
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all gap-1.5"
          >
            <span>{es.questionnaire.nav.updateAnswer}</span>
            <span>✓</span>
          </button>
        )}

        <button
          type="button"
          onClick={onNext}
          disabled={isLoading}
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>{es.questionnaire.savingStatus}</span>
            </span>
          ) : (
            <>
              <span>
                {isLastQuestion ? es.questionnaire.nav.review : es.questionnaire.nav.next}
              </span>
              <span className="ml-1.5">→</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
