import type { AuthPort } from '@go-agree/application';
import { describe, expect, it, vi } from 'vitest';
import { MockAuthAdapter } from '../../src/adapters/auth/MockAuthAdapter';
import { SupabaseAuthAdapter } from '../../src/adapters/auth/SupabaseAuthAdapter';

function runAuthPortGoogleContractTests(
  name: string,
  createAdapter: () => { adapter: AuthPort; mockSupabase?: any }
) {
  describe(`AuthPort Google OAuth Contract: ${name}`, () => {
    it('returns an authorization URL containing google oauth redirect', async () => {
      const { adapter } = createAdapter();
      const redirectUrl = 'http://localhost:3000/api/auth/callback';

      const result = await adapter.getGoogleAuthUrl(redirectUrl);

      expect(result).toHaveProperty('authUrl');
      expect(typeof result.authUrl).toBe('string');
      expect(result.authUrl).toContain('google');
      expect(result.authUrl).toContain(encodeURIComponent(redirectUrl));
    });

    it('exchanges authorization code for an authenticated session', async () => {
      const { adapter } = createAdapter();

      const result = await adapter.handleOAuthCallback({ code: 'valid-test-code' });

      expect(result.user).toBeDefined();
      expect(result.user.email).toBeDefined();
      expect(result.user.authProviders).toContain('google');
      expect(result.session).toBeDefined();
      expect(result.session.isValid).toBe(true);
      expect(result.session.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });
  });
}

describe('AuthPort Google Implementations', () => {
  runAuthPortGoogleContractTests('MockAuthAdapter', () => ({
    adapter: new MockAuthAdapter(),
  }));

  runAuthPortGoogleContractTests('SupabaseAuthAdapter', () => {
    const mockSupabase = {
      auth: {
        signInWithOAuth: vi.fn().mockImplementation(({ options }) =>
          Promise.resolve({
            data: {
              url: `https://accounts.google.com/o/oauth2/v2/auth?client_id=test&redirect_uri=${encodeURIComponent(
                options.redirectTo
              )}`,
            },
            error: null,
          })
        ),
        exchangeCodeForSession: vi.fn().mockImplementation((_code: string) =>
          Promise.resolve({
            data: {
              user: {
                id: 'supabase-user-google-1',
                email: 'test-google@example.com',
                created_at: new Date().toISOString(),
              },
              session: {
                access_token: 'test-supabase-token',
                expires_at: Math.floor(Date.now() / 1000) + 3600 * 24 * 30,
              },
            },
            error: null,
          })
        ),
      },
    };

    return {
      adapter: new SupabaseAuthAdapter(mockSupabase as any),
      mockSupabase,
    };
  });
});
