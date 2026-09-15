import type { Email } from '../value-objects/Email.js';
import type { UserId } from '../value-objects/UserId.js';

export type AuthProviderType = 'email_password' | 'google';

export interface UserAccountProps {
  id: UserId;
  email: Email;
  authProviders: AuthProviderType[];
  createdAt: Date;
  lastLoginAt: Date;
}

export class UserAccount {
  private readonly _id: UserId;
  private readonly _email: Email;
  private _authProviders: Set<AuthProviderType>;
  private readonly _createdAt: Date;
  private _lastLoginAt: Date;

  constructor(props: UserAccountProps) {
    if (!props.authProviders || props.authProviders.length === 0) {
      throw new Error('UserAccount must have at least one auth provider');
    }

    this._id = props.id;
    this._email = props.email;
    this._authProviders = new Set(props.authProviders);
    this._createdAt = props.createdAt;
    this._lastLoginAt = props.lastLoginAt;
  }

  get id(): UserId {
    return this._id;
  }

  get email(): Email {
    return this._email;
  }

  get authProviders(): AuthProviderType[] {
    return Array.from(this._authProviders);
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get lastLoginAt(): Date {
    return this._lastLoginAt;
  }

  hasProvider(provider: AuthProviderType): boolean {
    return this._authProviders.has(provider);
  }

  linkProvider(provider: AuthProviderType): void {
    this._authProviders.add(provider);
  }

  recordLogin(timestamp: Date = new Date()): void {
    this._lastLoginAt = timestamp;
  }
}
