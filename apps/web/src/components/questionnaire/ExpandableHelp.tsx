import type React from 'react';
import { useState } from 'react';
import { es } from '../../locales/es';

export interface ExpandableHelpProps {
  questionId: string;
  helpText: string;
}

export const ExpandableHelp: React.FC<ExpandableHelpProps> = ({ questionId, helpText }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentId = `expandable-help-${questionId}`;
  const buttonId = `expandable-btn-${questionId}`;

  return (
    <div className="mt-3">
      <button
        type="button"
        id={buttonId}
        aria-expanded={isExpanded}
        aria-controls={contentId}
        onClick={() => setIsExpanded(!isExpanded)}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 focus:outline-none focus:underline rounded"
      >
        <span>{es.questionnaire.whyAskThis}</span>
        <svg
          className={`w-4 h-4 transform transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div
          id={contentId}
          role="region"
          aria-labelledby={buttonId}
          className="mt-2 p-3.5 bg-blue-50/70 border border-blue-100 rounded-lg text-xs sm:text-sm text-blue-900 leading-relaxed animate-fade-in"
        >
          {helpText}
        </div>
      )}
    </div>
  );
};
