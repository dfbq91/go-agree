import { UserId } from '../value-objects/UserId.js';

export interface UserSessionProps {
  sessionId: string;
  userId: UserId;
  createdAt: Date;
  lastActivityAt: Date;
  expiresAt: Date;
  isRevoked: boolean;
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export class UserSession {
  readonly sessionId: string;
  readonly userId: UserId;
  readonly createdAt: Date;
  private _lastActivityAt: Date;
  private _expiresAt: Date;
  private _isRevoked: boolean;

  constructor(props: UserSessionProps) {
    this.sessionId = props.sessionId;
    this.userId = props.userId;
    this.createdAt = props.createdAt;
    this._lastActivityAt = props.lastActivityAt;
    this._expiresAt = props.expiresAt;
    this._isRevoked = props.isRevoked;
  }

  static create(params: { sessionId: string; userId: UserId; now?: Date }): UserSession {
    const now = params.now || new Date();
    const expiresAt = new Date(now.getTime() + THIRTY_DAYS_MS);

    return new UserSession({
      sessionId: params.sessionId,
      userId: params.userId,
      createdAt: now,
      lastActivityAt: now,
      expiresAt,
      isRevoked: false,
    });
  }

  get lastActivityAt(): Date {
    return this._lastActivityAt;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  get isRevoked(): boolean {
    return this._isRevoked;
  }

  isExpired(now: Date = new Date()): boolean {
    return now.getTime() > this._expiresAt.getTime();
  }

  isValid(now: Date = new Date()): boolean {
    return !this._isRevoked && !this.isExpired(now);
  }

  refresh(now: Date = new Date()): void {
    this._lastActivityAt = now;
    this._expiresAt = new Date(now.getTime() + THIRTY_DAYS_MS);
  }

  revoke(): void {
    this._isRevoked = true;
  }
}
