export type ConditionOperator = 'equals' | 'not_equals' | 'greater_than' | 'contains' | 'in';

export interface ConditionRuleProps {
  dependsOnQuestionId: string;
  operator: ConditionOperator;
  expectedValue: unknown;
}

export class ConditionRule {
  readonly dependsOnQuestionId: string;
  readonly operator: ConditionOperator;
  readonly expectedValue: unknown;

  constructor(props: ConditionRuleProps) {
    if (!props.dependsOnQuestionId || props.dependsOnQuestionId.trim() === '') {
      throw new Error('ConditionRule dependsOnQuestionId cannot be empty');
    }
    this.dependsOnQuestionId = props.dependsOnQuestionId;
    this.operator = props.operator;
    this.expectedValue = props.expectedValue;
  }

  evaluate(answers: Record<string, unknown>): boolean {
    const actualValue = answers[this.dependsOnQuestionId];

    if (actualValue === undefined || actualValue === null) {
      return (
        this.operator === 'not_equals' &&
        this.expectedValue !== undefined &&
        this.expectedValue !== null
      );
    }

    switch (this.operator) {
      case 'equals':
        return actualValue === this.expectedValue;

      case 'not_equals':
        return actualValue !== this.expectedValue;

      case 'greater_than': {
        const numActual = typeof actualValue === 'number' ? actualValue : Number(actualValue);
        const numExpected =
          typeof this.expectedValue === 'number' ? this.expectedValue : Number(this.expectedValue);
        if (Number.isNaN(numActual) || Number.isNaN(numExpected)) {
          return false;
        }
        return numActual > numExpected;
      }

      case 'contains':
        if (Array.isArray(actualValue)) {
          return actualValue.includes(this.expectedValue);
        }
        if (typeof actualValue === 'string') {
          return actualValue.includes(String(this.expectedValue));
        }
        return false;

      case 'in':
        if (Array.isArray(this.expectedValue)) {
          return this.expectedValue.includes(actualValue);
        }
        return false;

      default:
        return false;
    }
  }

  toJSON(): ConditionRuleProps {
    return {
      dependsOnQuestionId: this.dependsOnQuestionId,
      operator: this.operator,
      expectedValue: this.expectedValue,
    };
  }
}
