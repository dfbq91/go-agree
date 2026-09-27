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
    <fieldset className="space-y-3.5">
      <legend className="sr-only">{prompt}</legend>
      {options.map((opt) => {
        const isSelected = selectedVal === opt.value;
        const inputId = `opt-${id}-${opt.value}`;
        const requiresCustom = isCustomSpecOption(opt);

        return (
          <div
            key={opt.id}
            className={`flex flex-col rounded-lg border transition-all ${
              isSelected
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
                  type="radio"
                  name={`group-${id}`}
                  value={opt.value}
                  checked={isSelected}
                  onChange={() => handleSelect(opt)}
                  className="sr-only"
                />

                {/* Custom Radio Circle */}
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 bg-white transition-colors ${
                    isSelected ? 'border-primary-600' : 'border-gray-300'
                  }`}
                  aria-hidden="true"
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      isSelected ? 'bg-primary-600' : 'bg-transparent'
                    }`}
                  />
                </div>

                {/* Etiqueta de la opción */}
                <span
                  className={`ml-4 text-sm sm:text-base ${
                    isSelected ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                  }`}
                >
                  {opt.label}
                </span>
              </label>

              <div className="flex items-center ml-2">
                {/* Indicador sutil de selección */}
                {isSelected && (
                  <span
                    className="text-primary-600 text-[18px] font-bold mr-1 select-none"
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                )}

                {opt.tooltip && (
                  <Tooltip content={opt.tooltip}>
                    <button
                      type="button"
                      aria-label={`Información sobre ${opt.label}`}
                      className="inline-block text-gray-400 hover:text-gray-600 ml-2 cursor-help p-0.5 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      ℹ️
                    </button>
                  </Tooltip>
                )}
              </div>
            </div>

            {isSelected && requiresCustom && (
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
