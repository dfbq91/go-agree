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
    <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden bg-gray-50/60 shadow-2xs transition-all">
      <button
        type="button"
        id={buttonId}
        aria-expanded={isExpanded}
        aria-controls={contentId}
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-left select-none bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
      >
        <span className="flex items-center text-sm font-medium text-gray-700">
          <svg
            className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{es.questionnaire.whyAskThis}</span>
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transform transition-transform duration-200 flex-shrink-0 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div
          id={contentId}
          role="region"
          aria-labelledby={buttonId}
          className="px-4 py-3.5 text-sm text-gray-600 leading-relaxed bg-[#fafafa] border-t border-gray-200 animate-fade-in"
        >
          {helpText}
        </div>
      )}
    </div>
  );
};
