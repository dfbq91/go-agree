import { describe, it, expect, vi } from 'vitest';
import { MockAuthAdapter } from '../../src/adapters/auth/MockAuthAdapter';
import { SupabaseAuthAdapter } from '../../src/adapters/auth/SupabaseAuthAdapter';
import type { AuthPort } from '@go-agree/application';

function runAuthPortSessionContractTests(
  name: string,
  createAdapter: () => { adapter: AuthPort; mockSupabase?: any }
) {
  describe(`AuthPort Session Contract: ${name}`, () => {
    it('returns null when no session is active', async () => {
      const { adapter } = createAdapter();
      const session = await adapter.getCurrentSession();
      expect(session).toBeNull();
    });

    it('returns active session after registration or login and clears it upon logout', async () => {
      const { adapter } = createAdapter();

      // Register a user
      const result = await adapter.registerWithEmail({
        email: `session-user-${Date.now()}@example.com`,
        password: 'ValidPassword123!',
      });

      expect(result.session.isValid).toBe(true);

      const currentSession = await adapter.getCurrentSession();
      expect(currentSession).toBeDefined();
      expect(currentSession?.isValid).toBe(true);

      // Perform logout
      await adapter.logout();

      const sessionAfterLogout = await adapter.getCurrentSession();
      expect(sessionAfterLogout).toBeNull();
    });
  });
}

describe('AuthPort Session Implementations', () => {
  runAuthPortSessionContractTests('MockAuthAdapter', () => ({
    adapter: new MockAuthAdapter(),
  }));

  runAuthPortSessionContractTests('SupabaseAuthAdapter', () => {
    let mockSessionData: any = null;

    const mockSupabase = {
      auth: {
        signUp: vi.fn().mockImplementation(({ email }) => {
          mockSessionData = {
            access_token: 'test-access-token',
            expires_at: Math.floor(Date.now() / 1000) + 3600 * 24 * 30,
          };
          return Promise.resolve({
            data: {
              user: {
                id: 'supabase-user-sess-1',
                email,
                created_at: new Date().toISOString(),
              },
              session: mockSessionData,
            },
            error: null,
          });
        }),
        getSession: vi.fn().mockImplementation(() =>
          Promise.resolve({
            data: {
              session: mockSessionData
                ? {
                    ...mockSessionData,
                    user: { id: 'supabase-user-sess-1' },
                  }
                : null,
            },
            error: null,
          })
        ),
        signOut: vi.fn().mockImplementation(() => {
          mockSessionData = null;
          return Promise.resolve({ error: null });
        }),
      },
    };

    return {
      adapter: new SupabaseAuthAdapter(mockSupabase as any),
      mockSupabase,
    };
  });
});
