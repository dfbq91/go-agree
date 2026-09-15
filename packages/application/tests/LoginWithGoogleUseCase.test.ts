import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthPort, AuthResultDTO } from '../src/ports/AuthPort';
import { LoginWithGoogleUseCase } from '../src/use-cases/auth/LoginWithGoogleUseCase';

describe('LoginWithGoogleUseCase', () => {
  let mockAuthPort: AuthPort;
  let useCase: LoginWithGoogleUseCase;

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
    useCase = new LoginWithGoogleUseCase(mockAuthPort);
  });

  describe('getAuthorizationUrl', () => {
    it('returns the authorization URL provided by AuthPort', async () => {
      vi.mocked(mockAuthPort.getGoogleAuthUrl).mockResolvedValue({
        authUrl: 'https://accounts.google.com/o/oauth2/auth?...',
      });

      const result = await useCase.getAuthorizationUrl('http://localhost:3000/api/auth/callback');

      expect(mockAuthPort.getGoogleAuthUrl).toHaveBeenCalledWith(
        'http://localhost:3000/api/auth/callback'
      );
      expect(result.authUrl).toContain('accounts.google.com');
    });

    it('propagates errors when AuthPort fails', async () => {
      vi.mocked(mockAuthPort.getGoogleAuthUrl).mockRejectedValue(
        new Error('OAuth provider configuration error')
      );

      await expect(
        useCase.getAuthorizationUrl('http://localhost:3000/api/auth/callback')
      ).rejects.toThrow('OAuth provider configuration error');
    });
  });

  describe('handleCallback', () => {
    const mockAuthResult: AuthResultDTO = {
      user: {
        id: 'user-google-1',
        email: 'user@gmail.com',
        authProviders: ['google'],
        createdAt: new Date(),
        lastLoginAt: new Date(),
      },
      session: {
        sessionId: 'session-google-1',
        userId: 'user-google-1',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isValid: true,
      },
    };

    it('exchanges code for user and session successfully', async () => {
      vi.mocked(mockAuthPort.handleOAuthCallback).mockResolvedValue(mockAuthResult);

      const result = await useCase.handleCallback({ code: 'valid-auth-code' });

      expect(mockAuthPort.handleOAuthCallback).toHaveBeenCalledWith({ code: 'valid-auth-code' });
      expect(result.user.email).toBe('user@gmail.com');
      expect(result.user.authProviders).toContain('google');
      expect(result.session.isValid).toBe(true);
    });

    it('throws error if code is empty', async () => {
      await expect(useCase.handleCallback({ code: '' })).rejects.toThrow(
        'Authorization code is required'
      );
      expect(mockAuthPort.handleOAuthCallback).not.toHaveBeenCalled();
    });
  });
});
