import { describe, expect, it } from 'vitest';
import { LogSanitizer } from '../../src/logging/log-sanitizer.js';

describe('LogSanitizer (Obfuscation & Truncation)', () => {
  const sanitizer = new LogSanitizer();

  it('obfuscates default sensitive keys case-insensitively with [REDACTED]', () => {
    const input = {
      user: 'alice',
      password: 'super-secret-password',
      token: 'jwt.token.here',
      Secret: 'api-secret-key',
      ACCESS_TOKEN: 'access-123',
      refreshToken: 'refresh-456',
      apiKey: 'key-789',
      authorization: 'Bearer token-xyz',
      creditCard: '4111111111111111',
      cvv: '123',
      safeField: 'normal-value',
    };

    const result = sanitizer.sanitize(input);

    expect(result.password).toBe('[REDACTED]');
    expect(result.token).toBe('[REDACTED]');
    expect(result.Secret).toBe('[REDACTED]');
    expect(result.ACCESS_TOKEN).toBe('[REDACTED]');
    expect(result.refreshToken).toBe('[REDACTED]');
    expect(result.apiKey).toBe('[REDACTED]');
    expect(result.authorization).toBe('[REDACTED]');
    expect(result.creditCard).toBe('[REDACTED]');
    expect(result.cvv).toBe('[REDACTED]');
    expect(result.safeField).toBe('normal-value');
  });

  it('preserves sensitive keys when obfuscation is disabled', () => {
    const customSanitizer = new LogSanitizer({ obfuscationEnabled: false });
    const input = { password: 'secretpassword123' };

    const result = customSanitizer.sanitize(input);
    expect(result.password).toBe('secretpassword123');
  });

  it('supports custom additional sensitive keys', () => {
    const customSanitizer = new LogSanitizer({
      sensitiveKeys: ['ssn', 'taxId'],
    });

    const input = {
      ssn: '123-45-6789',
      taxId: '987654321',
      regular: 'hello',
    };

    const result = customSanitizer.sanitize(input);
    expect(result.ssn).toBe('[REDACTED]');
    expect(result.taxId).toBe('[REDACTED]');
    expect(result.regular).toBe('hello');
  });

  it('traverses nested objects and arrays up to 5 levels deep', () => {
    const input = {
      level1: {
        level2: {
          level3: {
            level4: {
              level5: {
                password: 'deep-secret',
                safe: 'visible',
              },
            },
          },
        },
      },
    };

    const result = sanitizer.sanitize(input);
    expect(result.level1.level2.level3.level4.level5.password).toBe('[REDACTED]');
    expect(result.level1.level2.level3.level4.level5.safe).toBe('visible');
  });

  it('guards against circular references without throwing stack overflow', () => {
    const cyclicObj: any = { name: 'cycle-root' };
    cyclicObj.self = cyclicObj;
    cyclicObj.nested = { back: cyclicObj, secret: 'top-secret' };

    expect(() => {
      const result = sanitizer.sanitize(cyclicObj);
      expect(result.name).toBe('cycle-root');
      expect(result.nested.secret).toBe('[REDACTED]');
      expect(result.self).toBe('[CIRCULAR]');
    }).not.toThrow();
  });

  it('truncates strings exceeding maxLength with "... [TRUNCATED]"', () => {
    const shortStr = 'A'.repeat(50);
    const longStr = 'B'.repeat(3000);

    const input = {
      short: shortStr,
      long: longStr,
    };

    const result = sanitizer.sanitize(input, { maxLength: 100 });
    expect(result.short).toBe(shortStr);
    expect(result.long.startsWith('B'.repeat(100))).toBe(true);
    expect(result.long.endsWith('... [TRUNCATED]')).toBe(true);
    expect(result.long.length).toBe(100 + '... [TRUNCATED]'.length);
  });

  it('preserves primitives (numbers, booleans, null, undefined) untouched', () => {
    const input = {
      count: 42,
      active: true,
      empty: null,
      missing: undefined,
    };

    const result = sanitizer.sanitize(input);
    expect(result).toEqual(input);
  });
});
