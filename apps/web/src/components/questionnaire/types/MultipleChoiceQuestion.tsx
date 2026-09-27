import type { QuestionOptionDTO } from '@go-agree/application';
import type React from 'react';
import { es } from '../../../locales/es';
import { Tooltip } from '../Tooltip';

export interface MultipleChoiceQuestionProps {
  id: string;
  value: unknown;
  options?: QuestionOptionDTO[];
  onChange: (val: unknown[]) => void;
  prompt?: string;
}

export const isCustomSpecOption = (opt: QuestionOptionDTO): boolean => {
  if (opt.value === 'other') return true;
  const lowerLabel = (opt.label || '').toLowerCase();
  const lowerValue = (opt.value || '').toLowerCase();
  return (
    lowerLabel.includes('especificar') ||
    lowerLabel.includes('especifique') ||
    lowerValue.includes('other') ||
    lowerValue.includes('especificar')
  );
};

export const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  id,
  value,
  options = [],
  onChange,
  prompt = '',
}) => {
  const rawArray: unknown[] = Array.isArray(value) ? value : [];

  const getSelectionValue = (item: unknown): string => {
    if (typeof item === 'object' && item !== null && 'selection' in item) {
      return String((item as any).selection);
    }
    if (typeof item === 'string' && item.startsWith('other:')) {
      return 'other';
    }
    return String(item);
  };

  const getCustomValue = (item: unknown): string => {
    if (typeof item === 'object' && item !== null && 'customValue' in item) {
      return String((item as any).customValue || '');
    }
    if (typeof item === 'string' && item.startsWith('other:')) {
      return item.replace(/^other:\s*/, '');
    }
    return '';
  };

  const handleToggle = (opt: QuestionOptionDTO) => {
    const isOptOut = opt.value === 'not_applicable';

    if (isOptOut) {
      const isAlreadyOptOut = rawArray.some((item) => getSelectionValue(item) === 'not_applicable');
      if (isAlreadyOptOut) {
        onChange([]);
      } else {
        onChange(['not_applicable']);
      }
      return;
    }

    const withoutOptOut = rawArray.filter((item) => getSelectionValue(item) !== 'not_applicable');
    const existingIndex = withoutOptOut.findIndex((item) => getSelectionValue(item) === opt.value);

    if (existingIndex >= 0) {
      onChange(withoutOptOut.filter((item) => getSelectionValue(item) !== opt.value));
    } else {
      if (isCustomSpecOption(opt)) {
        onChange([...withoutOptOut, { selection: opt.value, customValue: '' }]);
      } else {
        onChange([...withoutOptOut, opt.value]);
      }
    }
  };

  const handleCustomTextChange = (optValue: string, text: string) => {
    const updated = rawArray.map((item) => {
      if (getSelectionValue(item) === optValue) {
        return { selection: optValue, customValue: text };
      }
      return item;
    });
    onChange(updated);
  };

  return (
    <fieldset className="space-y-3.5">
      <legend className="sr-only">{prompt}</legend>
      {options.map((opt) => {
        const selectedItem = rawArray.find((item) => getSelectionValue(item) === opt.value);
        const isChecked = Boolean(selectedItem);
        const customVal = selectedItem ? getCustomValue(selectedItem) : '';
        const inputId = `opt-${id}-${opt.value}`;
        const requiresCustom = isCustomSpecOption(opt);

        return (
          <div
            key={opt.id}
            className={`flex flex-col rounded-lg border transition-all ${
              isChecked
                ? 'border-2 border-primary-600 bg-blue-50/20 shadow-xs'
                : 'border border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50/50'
            }`}
          >
            <div className="flex items-center justify-between p-4 sm:p-5 w-full">
              <label
                htmlFor={inputId}
                className="flex items-center flex-1 cursor-pointer select-none"
              >
                <input
                  id={inputId}
                  type="checkbox"
                  value={opt.value}
                  checked={isChecked}
                  onChange={() => handleToggle(opt)}
                  className="sr-only"
                />

                {/* Custom Checkbox */}
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isChecked
                      ? 'border-primary-600 bg-primary-600 text-white'
                      : 'border-gray-300 bg-white'
                  }`}
                  aria-hidden="true"
                >
                  {isChecked && (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>

                {/* Etiqueta de la opción */}
                <span
                  className={`ml-4 text-sm sm:text-base ${
                    isChecked ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                  }`}
                >
                  {opt.label}
                </span>
              </label>

              {opt.tooltip && (
                <div className="ml-2">
                  <Tooltip content={opt.tooltip}>
                    <button
                      type="button"
                      aria-label={`Información sobre ${opt.label}`}
                      className="inline-block text-gray-400 hover:text-gray-600 cursor-help p-0.5 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      ℹ️
                    </button>
                  </Tooltip>
                </div>
              )}
            </div>

            {isChecked && requiresCustom && (
              <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-2 border-t border-blue-200/80">
                <label
                  htmlFor={`custom-input-${id}-${opt.value}`}
                  className="block text-xs font-semibold text-blue-900 mb-1.5"
                >
                  {es.questionnaire.specifyOtherLabel}
                </label>
                <input
                  id={`custom-input-${id}-${opt.value}`}
                  type="text"
                  value={customVal}
                  onChange={(e) => handleCustomTextChange(opt.value, e.target.value)}
                  placeholder={es.questionnaire.specifyOtherPlaceholder}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                />
              </div>
            )}
          </div>
        );
      })}
    </fieldset>
  );
};
