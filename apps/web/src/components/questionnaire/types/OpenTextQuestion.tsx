import type React from 'react';
import { es } from '../../../locales/es';

export interface OpenTextQuestionProps {
  id: string;
  value: unknown;
  onChange: (val: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  maxLength?: number;
  error?: string;
  isRequired?: boolean;
}

export const OpenTextQuestion: React.FC<OpenTextQuestionProps> = ({
  id,
  value,
  onChange,
  onBlur,
  placeholder = '',
  maxLength = 2000,
  error,
  isRequired = false,
}) => {
  const stringValue = typeof value === 'string' ? value : '';

  return (
    <div>
      <textarea
        id={`input-${id}`}
        rows={4}
        maxLength={maxLength}
        placeholder={placeholder}
        value={stringValue}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        required={isRequired}
        aria-required={isRequired}
        aria-labelledby={`heading-${id}`}
        aria-describedby={error ? `error-${id}` : undefined}
        className={`w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
        }`}
      />
      <div className="mt-1 flex justify-end text-xs text-gray-500">
        <span>
          {stringValue.length} / {maxLength} {es.questionnaire.charCount}
        </span>
      </div>
    </div>
  );
};
