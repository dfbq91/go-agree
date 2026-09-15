import type { QuestionOptionDTO } from '@go-agree/application';
import type React from 'react';
import { es } from '../../../locales/es';
import { Tooltip } from '../Tooltip';

export interface SingleChoiceQuestionProps {
  id: string;
  value: unknown;
  options?: QuestionOptionDTO[];
  onChange: (val: unknown) => void;
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

export const SingleChoiceQuestion: React.FC<SingleChoiceQuestionProps> = ({
  id,
  value,
  options = [],
  onChange,
  prompt = '',
}) => {
  let selectedVal = '';
  let customVal = '';

  if (typeof value === 'string') {
    if (value.startsWith('other:')) {
      selectedVal = 'other';
      customVal = value.replace(/^other:\s*/, '');
    } else {
      selectedVal = value;
    }
  } else if (typeof value === 'object' && value !== null && 'selection' in value) {
    selectedVal = String((value as any).selection || '');
    customVal = String((value as any).customValue || '');
  }

  const handleSelect = (opt: QuestionOptionDTO) => {
    if (isCustomSpecOption(opt)) {
      onChange({ selection: opt.value, customValue: customVal });
    } else {
      onChange(opt.value);
    }
  };

  const handleCustomTextChange = (optValue: string, text: string) => {
    onChange({ selection: optValue, customValue: text });
  };

  return (
    <fieldset className="space-y-2.5">
      <legend className="sr-only">{prompt}</legend>
      {options.map((opt) => {
        const isSelected = selectedVal === opt.value;
        const inputId = `opt-${id}-${opt.value}`;
        const requiresCustom = isCustomSpecOption(opt);

        return (
          <div
            key={opt.id}
            className={`flex flex-col p-4 border rounded-xl transition-all ${
              isSelected
                ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/60'
            }`}
          >
            <div className="flex items-start justify-between">
              <label htmlFor={inputId} className="flex items-center gap-3 cursor-pointer flex-1">
                <input
                  id={inputId}
                  type="radio"
                  name={`group-${id}`}
                  value={opt.value}
                  checked={isSelected}
                  onChange={() => handleSelect(opt)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
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

            {isSelected && requiresCustom && (
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
