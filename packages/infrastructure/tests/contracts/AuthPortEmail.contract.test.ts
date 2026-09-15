import type { AuthPort } from '@go-agree/application';
import {
  InvalidCredentialsError,
  UserAlreadyExistsError,
  WeakPasswordError,
} from '@go-agree/domain';
import { beforeEach, describe, expect, it } from 'vitest';
import { MockAuthAdapter } from '../../src/adapters/auth/MockAuthAdapter.js';

describe('AuthPort Email/Password Contract Tests', () => {
  let authAdapter: AuthPort;

  beforeEach(() => {
    authAdapter = new MockAuthAdapter();
  });

  it('should register a user and issue a 30-day session', async () => {
    const result = await authAdapter.registerWithEmail({
      email: 'newuser@example.com',
      password: 'StrongPassword123!',
    });

    expect(result.user).toBeDefined();
    expect(result.user.email).toBe('newuser@example.com');
    expect(result.session).toBeDefined();
    expect(result.session.isValid).toBe(true);

    const now = new Date();
    const expiry = new Date(result.session.expiresAt);
    const daysUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    expect(daysUntilExpiry).toBeGreaterThanOrEqual(29);
  });

  it('should reject registration when email already exists', async () => {
    await authAdapter.registerWithEmail({
      email: 'existing@example.com',
      password: 'Password123!',
    });

    await expect(
      authAdapter.registerWithEmail({
        email: 'existing@example.com',
        password: 'Password123!',
      })
    ).rejects.toThrow(UserAlreadyExistsError);
  });

  it('should reject registration with weak password', async () => {
    await expect(
      authAdapter.registerWithEmail({
        email: 'test@example.com',
        password: '123',
      })
    ).rejects.toThrow(WeakPasswordError);
  });

  it('should authenticate with correct password', async () => {
    await authAdapter.registerWithEmail({
      email: 'testlogin@example.com',
      password: 'Password123!',
    });

    const result = await authAdapter.loginWithEmail({
      email: 'testlogin@example.com',
      password: 'Password123!',
    });

    expect(result.user.email).toBe('testlogin@example.com');
    expect(result.session.isValid).toBe(true);
  });

  it('should reject authentication with wrong password', async () => {
    await authAdapter.registerWithEmail({
      email: 'testwrong@example.com',
      password: 'Password123!',
    });

    await expect(
      authAdapter.loginWithEmail({
        email: 'testwrong@example.com',
        password: 'WrongPassword123!',
      })
    ).rejects.toThrow(InvalidCredentialsError);
  });

  it('should handle password reset requests cleanly without error', async () => {
    await expect(
      authAdapter.requestPasswordReset({ email: 'anyuser@example.com' })
    ).resolves.toBeUndefined();
  });
});
