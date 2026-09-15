import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthPort, UserSessionDTO } from '../src/ports/AuthPort';
import { GetSessionUseCase, LogoutUseCase } from '../src/use-cases/auth/SessionUseCases';

describe('Session Use Cases', () => {
  let mockAuthPort: AuthPort;

  beforeEach(() => {
    mockAuthPort = {
      registerWithEmail: vi.fn(),
      loginWithEmail: vi.fn(),
      getGoogleAuthUrl: vi.fn(),
      handleOAuthCallback: vi.fn(),
      logout: vi.fn(),
      getCurrentSession: vi.fn(),
      requestPasswordReset: vi.fn(),
    };
  });

  describe('LogoutUseCase', () => {
    it('calls authPort.logout to terminate active session', async () => {
      const logoutUseCase = new LogoutUseCase(mockAuthPort);
      await logoutUseCase.execute();

      expect(mockAuthPort.logout).toHaveBeenCalledTimes(1);
    });

    it('propagates errors when logout fails', async () => {
      vi.mocked(mockAuthPort.logout).mockRejectedValue(new Error('Logout failed in provider'));
      const logoutUseCase = new LogoutUseCase(mockAuthPort);

      await expect(logoutUseCase.execute()).rejects.toThrow('Logout failed in provider');
    });
  });

  describe('GetSessionUseCase', () => {
    it('returns active session DTO when user is logged in', async () => {
      const mockSession: UserSessionDTO = {
        sessionId: 'sess-abc',
        userId: 'user-xyz',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        isValid: true,
      };

      vi.mocked(mockAuthPort.getCurrentSession).mockResolvedValue(mockSession);
      const getSessionUseCase = new GetSessionUseCase(mockAuthPort);
      const session = await getSessionUseCase.execute();

      expect(session).toEqual(mockSession);
      expect(mockAuthPort.getCurrentSession).toHaveBeenCalledTimes(1);
    });

    it('returns null when there is no active session', async () => {
      vi.mocked(mockAuthPort.getCurrentSession).mockResolvedValue(null);
      const getSessionUseCase = new GetSessionUseCase(mockAuthPort);
      const session = await getSessionUseCase.execute();

      expect(session).toBeNull();
    });
  });
});
