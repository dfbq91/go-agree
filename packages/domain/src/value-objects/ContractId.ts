import {
  TYPE_ID_PREFIXES,
  ensureTypeId,
  generateTypeId,
  isTypeId,
  stripTypeIdPrefix,
} from './TypeId.js';

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

  /**
   * Generates a new ContractId using UUIDv7 and the 'con_' TypeID prefix.
   */
  static generate(): ContractId {
    return new ContractId(generateTypeId(TYPE_ID_PREFIXES.CONTRACT));
  }

  /**
   * Creates a ContractId from a raw UUID, ensuring the 'con_' TypeID prefix is attached.
   */
  static fromUuid(uuid: string): ContractId {
    return new ContractId(ensureTypeId(TYPE_ID_PREFIXES.CONTRACT, uuid));
  }

  get value(): string {
    return this._value;
  }

  /**
   * Returns the raw UUID representation by stripping the TypeID prefix if present.
   */
  get rawUuid(): string {
    return stripTypeIdPrefix(this._value);
  }

  /**
   * Checks whether this ContractId strictly adheres to the TypeID convention.
   */
  get isTypeId(): boolean {
    return isTypeId(this._value, TYPE_ID_PREFIXES.CONTRACT);
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
