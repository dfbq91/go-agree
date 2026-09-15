import type { QuestionDTO } from '@go-agree/application';
import type React from 'react';
import { es } from '../../locales/es';
import { CheckboxQuestion } from './types/CheckboxQuestion';
import { MultipleChoiceQuestion } from './types/MultipleChoiceQuestion';
import { OpenTextQuestion } from './types/OpenTextQuestion';
import { SingleChoiceQuestion } from './types/SingleChoiceQuestion';

export interface QuestionRendererProps {
  question: QuestionDTO;
  value: unknown;
  onChange: (val: unknown) => void;
  onBlur?: () => void;
  error?: string;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  value,
  onChange,
  onBlur,
  error,
}) => {
  const tQuestion = (es.questionnaire.questions as Record<string, any>)[question.id] || {};
  const placeholder = tQuestion.placeholder || '';
  const prompt = tQuestion.prompt || question.prompt;

  const localizedOptions = question.options?.map((opt) => {
    const optDict = tQuestion.options?.[opt.value];
    return {
      ...opt,
      label: optDict?.label || opt.label,
      tooltip: optDict?.tooltip || opt.tooltip,
    };
  });

  switch (question.type) {
    case 'open_text':
      return (
        <OpenTextQuestion
          id={question.id}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          maxLength={2000}
          error={error}
          isRequired={question.isRequired}
        />
      );

    case 'single_choice':
      return (
        <SingleChoiceQuestion
          id={question.id}
          value={value}
          options={localizedOptions}
          onChange={onChange}
          prompt={prompt}
        />
      );

    case 'multiple_choice':
      return (
        <MultipleChoiceQuestion
          id={question.id}
          value={value}
          options={localizedOptions}
          onChange={onChange}
          prompt={prompt}
        />
      );

    case 'checkbox':
      return <CheckboxQuestion id={question.id} label={prompt} value={value} onChange={onChange} />;

    default:
      return null;
  }
};
