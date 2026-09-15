import type { QuestionDTO } from '@go-agree/application';
import type React from 'react';
import { es } from '../../locales/es';

export interface SummaryReviewProps {
  questions: QuestionDTO[];
  answers: Record<string, unknown>;
  onEdit: (questionId: string) => void;
  onConfirm: () => void;
  onBackToDashboard?: () => void;
  isSubmitting?: boolean;
  isCompleted?: boolean;
}

export const SummaryReview: React.FC<SummaryReviewProps> = ({
  questions,
  answers,
  onEdit,
  onConfirm,
  onBackToDashboard,
  isSubmitting = false,
  isCompleted = false,
}) => {
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

    if (question.type === 'checkbox') {
      return answer ? 'Sí' : 'No';
    }

    return String(answer);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8">
      <div className="mb-6 pb-4 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900">{es.questionnaire.summary.title}</h2>
        <p className="mt-1 text-sm text-gray-500">{es.questionnaire.summary.subtitle}</p>
      </div>

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

      <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
        <button
          type="button"
          onClick={() => {
            if (isCompleted && onBackToDashboard) {
              onBackToDashboard();
            } else {
              onConfirm();
            }
          }}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting
            ? 'Confirmando...'
            : isCompleted
              ? es.questionnaire.summary.backToDashboard
              : es.questionnaire.nav.confirm}
        </button>
      </div>
    </div>
  );
};
