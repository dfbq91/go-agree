export interface QuestionOptionProps {
  id: string;
  label: string;
  value: string;
  tooltip?: string;
}

export class QuestionOption {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly tooltip?: string;

  constructor(props: QuestionOptionProps) {
    if (!props.id || props.id.trim() === '') {
      throw new Error('QuestionOption id cannot be empty');
    }
    if (!props.label || props.label.trim() === '') {
      throw new Error('QuestionOption label cannot be empty');
    }
    this.id = props.id;
    this.label = props.label;
    this.value = props.value;
    this.tooltip = props.tooltip;
  }

  toJSON(): QuestionOptionProps {
    return {
      id: this.id,
      label: this.label,
      value: this.value,
      tooltip: this.tooltip,
    };
  }
}
