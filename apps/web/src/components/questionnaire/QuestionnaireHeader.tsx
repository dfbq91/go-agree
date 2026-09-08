import React from 'react';
import Link from 'next/link';
import { InlineTitleEditor } from './InlineTitleEditor';
import { es } from '../../locales/es';

export interface QuestionnaireHeaderProps {
  title: string;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  onSaveTitle: (newTitle: string) => Promise<void> | void;
}

export const QuestionnaireHeader: React.FC<QuestionnaireHeaderProps> = ({
  title,
  saveStatus,
  onSaveTitle,
}) => {
  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
      <div className="flex-1">
        <InlineTitleEditor initialTitle={title} onSave={onSaveTitle} />
      </div>

      <div className="flex items-center gap-4">
        {/* Persistence Status Indicator */}
        <div className="text-xs text-gray-500">
          {saveStatus === 'saving' && (
            <span className="inline-flex items-center gap-1.5 text-blue-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              {es.questionnaire.savingStatus}
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="inline-flex items-center gap-1.5 text-green-600 font-medium">
              <span>✓</span>
              {es.questionnaire.savedStatus}
            </span>
          )}
          {saveStatus === 'error' && (
            <span role="alert" className="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md text-xs font-medium border border-amber-200">
              {es.questionnaire.saveError}
            </span>
          )}
        </div>

        {/* Return to Dashboard */}
        <Link
          href="/dashboard"
          className="text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
        >
          ← {es.nav.dashboard}
        </Link>
      </div>
    </div>
  );
};
