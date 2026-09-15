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
    <fieldset className="space-y-2.5">
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
            className={`flex flex-col p-4 border rounded-xl transition-all ${
              isChecked
                ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/60'
            }`}
          >
            <div className="flex items-start justify-between">
              <label htmlFor={inputId} className="flex items-center gap-3 cursor-pointer flex-1">
                <input
                  id={inputId}
                  type="checkbox"
                  value={opt.value}
                  checked={isChecked}
                  onChange={() => handleToggle(opt)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm sm:text-base font-medium text-gray-800">{opt.label}</span>
              </label>
              {opt.tooltip && (
                <Tooltip content={opt.tooltip}>
                  <button
                    type="button"
                    aria-label={`Información sobre ${opt.label}`}
                    className="inline-block text-gray-400 hover:text-gray-600 ml-2 cursor-help p-0.5 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    ℹ️
                  </button>
                </Tooltip>
              )}
            </div>

            {isChecked && requiresCustom && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <label
                  htmlFor={`custom-input-${id}-${opt.value}`}
                  className="block text-xs font-semibold text-blue-900 mb-1"
                >
                  {es.questionnaire.specifyOtherLabel}
                </label>
                <input
                  id={`custom-input-${id}-${opt.value}`}
                  type="text"
                  value={customVal}
                  onChange={(e) => handleCustomTextChange(opt.value, e.target.value)}
                  placeholder={es.questionnaire.specifyOtherPlaceholder}
                  className="w-full px-3 py-2 text-sm bg-white border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
          </div>
        );
      })}
    </fieldset>
  );
};
