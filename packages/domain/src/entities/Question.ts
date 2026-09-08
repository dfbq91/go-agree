import { QuestionOption } from '../value-objects/QuestionOption.js';
import { ConditionRule } from '../value-objects/ConditionRule.js';

export type QuestionType = 'open_text' | 'single_choice' | 'multiple_choice' | 'checkbox';

export interface QuestionProps {
  id: string;
  order: number;
  prompt: string;
  type: QuestionType;
  isRequired: boolean;
  helpText?: string;
  tooltip?: string;
  options?: QuestionOption[];
  condition?: ConditionRule;
}

export class Question {
  readonly id: string;
  readonly order: number;
  readonly prompt: string;
  readonly type: QuestionType;
  readonly isRequired: boolean;
  readonly helpText?: string;
  readonly tooltip?: string;
  readonly options?: QuestionOption[];
  readonly condition?: ConditionRule;

  constructor(props: QuestionProps) {
    if (!props.id || props.id.trim() === '') {
      throw new Error('Question id cannot be empty');
    }
    if (!props.prompt || props.prompt.trim() === '') {
      throw new Error('Question prompt cannot be empty');
    }
    this.id = props.id;
    this.order = props.order;
    this.prompt = props.prompt;
    this.type = props.type;
    this.isRequired = props.isRequired;
    this.helpText = props.helpText;
    this.tooltip = props.tooltip;
    this.options = props.options;
    this.condition = props.condition;
  }

  isVisible(answers: Record<string, unknown>): boolean {
    if (!this.condition) {
      return true;
    }
    return this.condition.evaluate(answers);
  }

  validate(answer: unknown): { isValid: boolean; error?: string } {
    if (this.isRequired) {
      if (answer === undefined || answer === null) {
        return { isValid: false, error: 'Este campo es requerido.' };
      }
      if (typeof answer === 'string' && answer.trim().length === 0) {
        return { isValid: false, error: 'Este campo es requerido.' };
      }
      if (Array.isArray(answer) && answer.length === 0) {
        return { isValid: false, error: 'Este campo es requerido.' };
      }
      if (
        typeof answer === 'object' &&
        answer !== null &&
        'selection' in answer &&
        String((answer as any).selection).trim().length === 0
      ) {
        return { isValid: false, error: 'Este campo es requerido.' };
      }
    }

    if (this.type === 'open_text' && typeof answer === 'string') {
      if (answer.length > 2000) {
        return { isValid: false, error: 'La respuesta no puede exceder 2000 caracteres.' };
      }
    }

    if (this.type === 'single_choice' && answer) {
      let selection = '';
      let customValue = '';

      if (typeof answer === 'object' && answer !== null && 'selection' in answer) {
        selection = String((answer as any).selection || '');
        customValue = String((answer as any).customValue || '');
      } else if (typeof answer === 'string') {
        if (answer.startsWith('other:')) {
          selection = 'other';
          customValue = answer.replace(/^other:\s*/, '');
        } else {
          selection = answer;
        }
      }

      const matchedOpt = this.options?.find((o) => o.value === selection);
      const requiresSpec =
        selection === 'other' ||
        (matchedOpt &&
          (matchedOpt.label.toLowerCase().includes('especificar') ||
            matchedOpt.label.toLowerCase().includes('especifique')));

      if (requiresSpec && customValue.trim().length === 0) {
        return { isValid: false, error: 'Por favor especifica el valor requerido.' };
      }
    }

    if (this.type === 'multiple_choice' && Array.isArray(answer)) {
      for (const item of answer) {
        let selection = '';
        let customValue = '';

        if (typeof item === 'object' && item !== null && 'selection' in item) {
          selection = String((item as any).selection || '');
          customValue = String((item as any).customValue || '');
        } else if (typeof item === 'string') {
          if (item.startsWith('other:')) {
            selection = 'other';
            customValue = item.replace(/^other:\s*/, '');
          } else {
            selection = item;
          }
        }

        const matchedOpt = this.options?.find((o) => o.value === selection);
        const requiresSpec =
          selection === 'other' ||
          (matchedOpt &&
            (matchedOpt.label.toLowerCase().includes('especificar') ||
              matchedOpt.label.toLowerCase().includes('especifique')));

        if (requiresSpec && customValue.trim().length === 0) {
          return { isValid: false, error: 'Por favor especifica el valor requerido.' };
        }
      }
    }

    return { isValid: true };
  }

  toJSON() {
    return {
      id: this.id,
      order: this.order,
      prompt: this.prompt,
      type: this.type,
      isRequired: this.isRequired,
      helpText: this.helpText,
      tooltip: this.tooltip,
      options: this.options?.map((opt) => opt.toJSON()),
      condition: this.condition?.toJSON(),
    };
  }
}
