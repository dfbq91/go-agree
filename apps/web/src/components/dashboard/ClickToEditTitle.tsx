'use client';

import { es } from '@/locales/es';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export interface ClickToEditTitleProps {
  contractId: string;
  initialTitle: string;
  resumeUrl?: string;
  onSave?: (newTitle: string) => Promise<void> | void;
  className?: string;
}

export function ClickToEditTitle({
  contractId,
  initialTitle,
  resumeUrl,
  onSave,
  className = '',
}: ClickToEditTitleProps) {
  const [title, setTitle] = useState(initialTitle);
  const [draft, setDraft] = useState(initialTitle);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(initialTitle);
    setDraft(initialTitle);
  }, [initialTitle]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleCommit = async () => {
    const trimmed = draft.trim();
    if (trimmed.length === 0) {
      setErrorMessage(es.dashboard.rename.emptyError);
      setDraft(title);
      setIsEditing(false);
      return;
    }

    if (trimmed === title) {
      setIsEditing(false);
      setErrorMessage(null);
      return;
    }

    setErrorMessage(null);
    setTitle(trimmed);
    setIsEditing(false);
    setIsSaving(true);

    try {
      if (onSave) {
        await onSave(trimmed);
      } else {
        const res = await fetch(`/api/contracts/${contractId}/title`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: trimmed }),
        });

        if (!res.ok) {
          throw new Error('Failed to update title');
        }
      }
    } catch {
      setErrorMessage('Error al actualizar el título.');
      setTitle(title); // revert on failure
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(title);
    setIsEditing(false);
    setErrorMessage(null);
  };

  return (
    <div className={`inline-flex flex-col ${className}`}>
      {isEditing ? (
        <div className="flex items-center space-x-1.5">
          <input
            ref={inputRef}
            type="text"
            value={draft}
            disabled={isSaving}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleCommit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCommit();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                handleCancel();
              }
            }}
            aria-label={es.dashboard.rename.ariaLabel}
            className="text-sm font-semibold text-gray-900 border-b-2 border-primary-600 focus:outline-none bg-white px-1 py-0.5 rounded shadow-sm min-w-[180px]"
          />
          {isSaving && (
            <span className="text-xs text-gray-400 animate-pulse">
              {es.dashboard.rename.saving}
            </span>
          )}
        </div>
      ) : (
        <div className="group flex items-center space-x-1.5 max-w-full">
          {resumeUrl ? (
            <Link
              href={resumeUrl}
              className="text-sm font-semibold text-gray-900 hover:text-primary-600 hover:underline truncate max-w-xs md:max-w-sm transition-colors"
            >
              {title}
            </Link>
          ) : (
            <span className="text-sm font-semibold text-gray-900 truncate max-w-xs md:max-w-sm">
              {title}
            </span>
          )}

          <button
            type="button"
            onClick={() => {
              setDraft(title);
              setErrorMessage(null);
              setIsEditing(true);
            }}
            aria-label={es.dashboard.rename.ariaLabel}
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-gray-400 hover:text-primary-600 p-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-opacity"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
        </div>
      )}

      {errorMessage && (
        <span className="text-xs text-red-600 font-medium mt-0.5" role="alert">
          {errorMessage}
        </span>
      )}
    </div>
  );
}
