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
    <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        {!isFirstQuestion && onPrevious && (
          <button
            type="button"
            onClick={onPrevious}
            disabled={isLoading}
            className="w-full sm:w-auto px-5 py-2.5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            ← {es.questionnaire.nav.previous}
          </button>
        )}
      </div>

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
            className="w-full sm:w-auto px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium text-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5"
          >
            <span>{es.questionnaire.nav.updateAnswer}</span>
            <span>✓</span>
          </button>
        )}

        <button
          type="button"
          onClick={onNext}
          disabled={isLoading}
          className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span>{es.questionnaire.savingStatus}</span>
          ) : (
            <>
              <span>
                {isLastQuestion ? es.questionnaire.nav.review : es.questionnaire.nav.next}
              </span>
              <span>→</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
