import type React from 'react';
import { useState } from 'react';
import { es } from '../../locales/es';

export interface GuidanceTip {
  icon?: string;
  title: string;
  text: string;
}

export interface GuidanceExample {
  label: string;
  text: string;
}

export interface GuidanceData {
  title: string;
  badge?: string;
  context?: string;
  tips: GuidanceTip[];
  examples?: GuidanceExample[];
}

export interface QuestionGuidanceProps {
  guidance: GuidanceData;
  onSelectExample?: (text: string) => void;
}

export const QuestionGuidance: React.FC<QuestionGuidanceProps> = ({
  guidance,
  onSelectExample,
}) => {
  const [selectedExampleIndex, setSelectedExampleIndex] = useState<number | null>(null);

  const selectedExample =
    selectedExampleIndex !== null && guidance.examples
      ? guidance.examples[selectedExampleIndex]
      : null;

  const toggleExample = (idx: number) => {
    setSelectedExampleIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50/70 p-4 sm:p-5 shadow-2xs transition-all">
      {/* Header con icono y título */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-base select-none mt-0.5" aria-hidden="true">
            💡
          </span>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-900">
            {guidance.title}
          </h3>
        </div>
        {guidance.badge && (
          <span className="inline-flex items-center rounded-full bg-blue-100/90 px-2.5 py-0.5 text-xs font-medium text-blue-800">
            {guidance.badge}
          </span>
        )}
      </div>

      {/* Descripción contextual */}
      {guidance.context && (
        <p className="text-xs sm:text-sm text-blue-950 mb-3.5 leading-relaxed">
          {guidance.context}
        </p>
      )}

      {/* Grid de Pautas / Tips */}
      {guidance.tips && guidance.tips.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3.5">
          {guidance.tips.map((tip, index) => (
            <div
              key={index}
              className="rounded-lg bg-white/95 border border-blue-100/70 p-3 shadow-2xs flex flex-col justify-start"
            >
              <div className="flex items-center gap-1.5 mb-1">
                {tip.icon && (
                  <span className="text-sm" aria-hidden="true">
                    {tip.icon}
                  </span>
                )}
                <span className="text-xs font-semibold text-blue-950">{tip.title}</span>
              </div>
              <p className="text-xs text-gray-600 leading-snug">{tip.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Ejemplos prácticos de referencia */}
      {guidance.examples && guidance.examples.length > 0 && (
        <div className="border-t border-blue-100/80 pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Ejemplos prácticos de referencia:
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-2">
            {guidance.examples.map((ex, idx) => {
              const isSelected = selectedExampleIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleExample(idx)}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium border transition-colors flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-primary-600 text-white border-primary-600 shadow-2xs'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:bg-blue-50/50'
                  }`}
                  aria-expanded={isSelected}
                >
                  <span className="text-[10px]">{isSelected ? '▼' : '▶'}</span>
                  <span>{ex.label}</span>
                </button>
              );
            })}
          </div>

          {selectedExample && (
            <div className="mt-2.5 rounded-lg bg-white p-3 border border-blue-200 text-xs text-gray-700 shadow-2xs animate-fade-in">
              <p className="italic text-gray-800 mb-2 leading-relaxed">"{selectedExample.text}"</p>
              {onSelectExample && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => onSelectExample(selectedExample.text)}
                    className="text-xs font-medium text-primary-600 hover:text-primary-800 hover:underline inline-flex items-center gap-1"
                  >
                    <span>
                      {es.questionnaire.guidanceAction?.useExample || 'Usar como plantilla'}
                    </span>
                    <span>→</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
