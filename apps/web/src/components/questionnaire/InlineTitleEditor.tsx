import type React from 'react';
import { useState } from 'react';
import { es } from '../../locales/es';

export interface InlineTitleEditorProps {
  initialTitle: string;
  onSave: (newTitle: string) => Promise<void> | void;
}

export const InlineTitleEditor: React.FC<InlineTitleEditorProps> = ({ initialTitle, onSave }) => {
  const [title, setTitle] = useState(initialTitle);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(initialTitle);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCommit = async () => {
    const trimmed = draft.trim();
    if (trimmed.length === 0) {
      setErrorMessage(es.questionnaire.emptyTitleError);
      setDraft(title); // Revert
      setIsEditing(false);
      return;
    }

    setErrorMessage(null);
    setTitle(trimmed);
    setIsEditing(false);
    await onSave(trimmed);
  };

  return (
    <div>
      {isEditing ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleCommit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCommit();
              if (e.key === 'Escape') {
                setDraft(title);
                setIsEditing(false);
              }
            }}
            aria-label={es.questionnaire.editTitlePlaceholder}
            placeholder={es.questionnaire.editTitlePlaceholder}
            className="text-xl sm:text-2xl font-bold text-gray-900 border-b-2 border-blue-600 focus:outline-none bg-transparent"
          />
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>
          <button
            type="button"
            aria-label={es.questionnaire.editTitleAria}
            onClick={() => {
              setDraft(title);
              setIsEditing(true);
            }}
            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
          >
            ✏️
          </button>
        </div>
      )}
      {errorMessage && <p className="mt-1 text-xs text-red-600 font-medium">{errorMessage}</p>}
    </div>
  );
};
