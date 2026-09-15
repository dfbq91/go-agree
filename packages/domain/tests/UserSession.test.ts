import { describe, expect, it } from 'vitest';
import { UserSession } from '../src/entities/UserSession';
import { UserId } from '../src/value-objects/UserId';

describe('UserSession Entity', () => {
  const userId = UserId.create('user-123');
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  it('creates an active session with 30-day sliding expiration window', () => {
    const session = UserSession.create({
      sessionId: 'session-123',
      userId,
    });

    expect(session.sessionId).toBe('session-123');
    expect(session.userId.equals(userId)).toBe(true);
    expect(session.isValid()).toBe(true);
    expect(session.isRevoked).toBe(false);
    expect(session.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('detects when a session has expired past its expiration timestamp', () => {
    const pastDate = new Date(Date.now() - 1000);
    const session = new UserSession({
      sessionId: 'session-old',
      userId,
      createdAt: new Date(Date.now() - thirtyDaysMs - 10000),
      lastActivityAt: new Date(Date.now() - thirtyDaysMs - 5000),
      expiresAt: pastDate,
      isRevoked: false,
    });

    expect(session.isExpired()).toBe(true);
    expect(session.isValid()).toBe(false);
  });

  it('refreshes expiration timestamp according to 30-day sliding window', () => {
    const now = new Date();
    const session = UserSession.create({
      sessionId: 'session-refresh',
      userId,
    });

    const futureTime = new Date(now.getTime() + 1000 * 60 * 60); // 1 hour later
    session.refresh(futureTime);

    expect(session.lastActivityAt.getTime()).toBe(futureTime.getTime());
    expect(session.expiresAt.getTime()).toBe(futureTime.getTime() + thirtyDaysMs);
    expect(session.isValid(futureTime)).toBe(true);
  });

  it('revokes session immediately upon logout', () => {
    const session = UserSession.create({
      sessionId: 'session-revoke',
      userId,
    });

    expect(session.isValid()).toBe(true);
    session.revoke();
    expect(session.isRevoked).toBe(true);
    expect(session.isValid()).toBe(false);
  });
});
