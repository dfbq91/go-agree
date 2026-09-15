import type { QuestionDTO } from '@go-agree/application';
import React from 'react';
import { es } from '../../locales/es';
import { ExpandableHelp } from './ExpandableHelp';
import { QuestionGuidance } from './QuestionGuidance';
import { QuestionRenderer } from './QuestionRenderer';
import { Tooltip } from './Tooltip';

export interface QuestionCardProps {
  question: QuestionDTO;
  value: unknown;
  onChange: (val: unknown) => void;
  error?: string;
  onBlur?: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  value,
  onChange,
  error,
  onBlur,
}) => {
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Refocus heading when question ID changes
  React.useEffect(() => {
    headingRef.current?.focus();
  }, [question.id]);

  const tQuestion = (es.questionnaire.questions as Record<string, any>)[question.id] || {};
  const prompt = tQuestion.prompt || question.prompt;
  const helpText = tQuestion.helpText || question.helpText;
  const questionTooltip = tQuestion.tooltip || question.tooltip;
  const guidance = tQuestion.guidance;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8">
      {/* Question Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <h2
            ref={headingRef}
            tabIndex={-1}
            id={`heading-${question.id}`}
            className="text-xl sm:text-2xl font-semibold text-gray-900 leading-tight focus:outline-none flex items-center gap-1.5"
          >
            <span>{prompt}</span>
            {question.isRequired && (
              <span className="text-red-500 font-bold select-none" aria-hidden="true">
                *
              </span>
            )}
          </h2>
          {questionTooltip && (
            <div className="relative flex-shrink-0">
              <Tooltip content={questionTooltip}>
                <button
                  type="button"
                  aria-label="Información sobre la pregunta"
                  className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                >
                  ?
                </button>
              </Tooltip>
            </div>
          )}
        </div>

        {/* Expandable "Why are we asking this?" */}
        {helpText && <ExpandableHelp questionId={question.id} helpText={helpText} />}
      </div>

      {/* Visual Recommendations & Guidance Panel */}
      {guidance && (
        <QuestionGuidance
          guidance={guidance}
          onSelectExample={(exampleText) => onChange(exampleText)}
        />
      )}

      {/* Polymorphic Question Form Controls */}
      <div className="space-y-4">
        <QuestionRenderer
          question={question}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          error={error}
        />
      </div>

      {/* Contractor Scope Limitation Notice */}
      {question.id === 'q0_party_role' && value === 'contractor' && (
        <div
          role="region"
          aria-label="Aviso de disponibilidad para contratistas"
          className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs sm:text-sm flex items-start gap-3 shadow-2xs animate-fade-in"
        >
          <span className="text-xl flex-shrink-0" aria-hidden="true">
            ⚠️
          </span>
          <div>
            <h3 className="font-semibold text-amber-950">
              {es.questionnaire.contractorNotice.title}
            </h3>
            <p className="mt-1 text-amber-900 leading-relaxed">
              {es.questionnaire.contractorNotice.message}
            </p>
          </div>
        </div>
      )}

      {/* Validation Error Alert */}
      {error && (
        <div
          id={`error-${question.id}`}
          role="alert"
          className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs sm:text-sm text-red-700 flex items-center gap-2"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
