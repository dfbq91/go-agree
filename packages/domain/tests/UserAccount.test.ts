import { describe, expect, it } from 'vitest';
import { UserAccount } from '../src/entities/UserAccount.js';
import { Email } from '../src/value-objects/Email.js';
import { UserId } from '../src/value-objects/UserId.js';

describe('UserAccount Entity', () => {
  it('should create a valid UserAccount with an email and id', () => {
    const userId = new UserId('user-123');
    const email = new Email('test@example.com');
    const account = new UserAccount({
      id: userId,
      email,
      authProviders: ['email_password'],
      createdAt: new Date('2026-01-01T00:00:00Z'),
      lastLoginAt: new Date('2026-01-01T00:00:00Z'),
    });

    expect(account.id.value).toBe('user-123');
    expect(account.email.value).toBe('test@example.com');
    expect(account.hasProvider('email_password')).toBe(true);
    expect(account.hasProvider('google')).toBe(false);
  });

  it('should add a provider without duplication', () => {
    const account = new UserAccount({
      id: new UserId('user-123'),
      email: new Email('test@example.com'),
      authProviders: ['email_password'],
      createdAt: new Date(),
      lastLoginAt: new Date(),
    });

    account.linkProvider('google');
    expect(account.authProviders).toContain('google');
    expect(account.authProviders).toContain('email_password');

    // Linking again is idempotent
    account.linkProvider('google');
    expect(account.authProviders.filter((p) => p === 'google').length).toBe(1);
  });

  it('should update lastLoginAt when recordLogin is called', () => {
    const initialDate = new Date('2026-01-01T00:00:00Z');
    const account = new UserAccount({
      id: new UserId('user-123'),
      email: new Email('test@example.com'),
      authProviders: ['email_password'],
      createdAt: initialDate,
      lastLoginAt: initialDate,
    });

    const newLoginDate = new Date('2026-01-02T10:00:00Z');
    account.recordLogin(newLoginDate);

    expect(account.lastLoginAt.getTime()).toBe(newLoginDate.getTime());
  });

  it('should throw error if created without auth providers', () => {
    expect(() => {
      new UserAccount({
        id: new UserId('user-123'),
        email: new Email('test@example.com'),
        authProviders: [],
        createdAt: new Date(),
        lastLoginAt: new Date(),
      });
    }).toThrow('UserAccount must have at least one auth provider');
  });
});
