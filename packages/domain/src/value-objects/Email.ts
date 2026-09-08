import { InvalidEmailError } from '../errors/DomainErrors.js';

export class Email {
  private readonly _value: string;

  // RFC 5322 compliant regex for standard email addresses
  private static readonly EMAIL_REGEX =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  constructor(value: string) {
    if (!value || typeof value !== 'string') {
      throw new InvalidEmailError(value);
    }

    const trimmed = value.trim().toLowerCase();

    if (!Email.EMAIL_REGEX.test(trimmed)) {
      throw new InvalidEmailError(value);
    }

    this._value = trimmed;
  }

  get value(): string {
    return this._value;
  }

  equals(other: Email): boolean {
    if (!other || !(other instanceof Email)) {
      return false;
    }
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
