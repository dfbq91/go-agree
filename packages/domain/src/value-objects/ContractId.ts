export class ContractId {
  private readonly _value: string;

  constructor(value: string) {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      throw new Error('ContractId must be a non-empty string');
    }
    this._value = value.trim();
  }

  static create(value: string): ContractId {
    return new ContractId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: ContractId): boolean {
    if (!other || !(other instanceof ContractId)) {
      return false;
    }
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
