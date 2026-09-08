export type RawAnswerValue = string | string[] | boolean | number | null | undefined;

export class AnswerValue {
  private readonly _value: RawAnswerValue;

  constructor(value: RawAnswerValue) {
    this._value = this.sanitize(value);
  }

  private sanitize(val: RawAnswerValue): RawAnswerValue {
    if (typeof val === 'string') {
      return val.trim();
    }
    if (Array.isArray(val)) {
      return val.map((v) => (typeof v === 'string' ? v.trim() : v)).filter(Boolean);
    }
    return val;
  }

  get value(): RawAnswerValue {
    return this._value;
  }

  isEmpty(): boolean {
    if (this._value === undefined || this._value === null) {
      return true;
    }
    if (typeof this._value === 'string') {
      return this._value.trim().length === 0;
    }
    if (Array.isArray(this._value)) {
      return this._value.length === 0;
    }
    return false;
  }

  asString(): string {
    if (typeof this._value === 'string') {
      return this._value;
    }
    if (this._value === null || this._value === undefined) {
      return '';
    }
    return String(this._value);
  }

  asArray(): string[] {
    if (Array.isArray(this._value)) {
      return this._value.map(String);
    }
    if (this._value) {
      return [String(this._value)];
    }
    return [];
  }

  asBoolean(): boolean {
    return Boolean(this._value);
  }
}
