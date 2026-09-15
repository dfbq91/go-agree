import {
  TYPE_ID_PREFIXES,
  ensureTypeId,
  isTypeId,
  stripTypeIdPrefix,
} from './TypeId.js';

export class UserId {
  private readonly _value: string;

  constructor(value: string) {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      throw new Error('UserId must be a non-empty string');
    }
    this._value = value.trim();
  }

  static create(value: string): UserId {
    return new UserId(value);
  }

  /**
   * Creates a UserId from an external identifier (e.g. Supabase Auth),
   * ensuring the 'user_' TypeID prefix is attached for domain and logging traceability.
   */
  static fromExternal(uuid: string): UserId {
    return new UserId(ensureTypeId(TYPE_ID_PREFIXES.USER, uuid));
  }

  get value(): string {
    return this._value;
  }

  /**
   * Returns the raw UUID representation without the 'user_' TypeID prefix.
   */
  get rawUuid(): string {
    return stripTypeIdPrefix(this._value);
  }

  /**
   * Checks whether this UserId contains the 'user_' TypeID prefix.
   */
  get isTypeId(): boolean {
    return isTypeId(this._value, TYPE_ID_PREFIXES.USER);
  }

  equals(other: UserId): boolean {
    if (!other || !(other instanceof UserId)) {
      return false;
    }
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
