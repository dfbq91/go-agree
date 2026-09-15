import {
  InvalidCredentialsError,
  InvalidEmailError,
  UserAlreadyExistsError,
  WeakPasswordError,
} from '@go-agree/domain';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthPort, AuthResultDTO } from '../src/ports/AuthPort.js';
import { LoginWithEmailUseCase } from '../src/use-cases/auth/LoginWithEmailUseCase.js';
import { RegisterUserUseCase } from '../src/use-cases/auth/RegisterUserUseCase.js';

describe('RegisterUserUseCase & LoginWithEmailUseCase', () => {
  let mockAuthPort: AuthPort;

  const mockAuthResult: AuthResultDTO = {
    user: {
      id: 'user-1',
      email: 'valid@example.com',
      authProviders: ['email_password'],
      createdAt: new Date(),
      lastLoginAt: new Date(),
    },
    session: {
      sessionId: 'session-1',
      userId: 'user-1',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isValid: true,
    },
  };

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

  describe('RegisterUserUseCase', () => {
    it('should register a valid user successfully', async () => {
      vi.mocked(mockAuthPort.registerWithEmail).mockResolvedValue(mockAuthResult);
      const useCase = new RegisterUserUseCase(mockAuthPort);

      const result = await useCase.execute({
        email: 'valid@example.com',
        password: 'Password123!',
      });

      expect(result.user.email).toBe('valid@example.com');
      expect(mockAuthPort.registerWithEmail).toHaveBeenCalledWith({
        email: 'valid@example.com',
        password: 'Password123!',
      });
    });

    it('should reject invalid email format before calling port', async () => {
      const useCase = new RegisterUserUseCase(mockAuthPort);

      await expect(
        useCase.execute({
          email: 'invalid-email',
          password: 'Password123!',
        })
      ).rejects.toThrow(InvalidEmailError);

      expect(mockAuthPort.registerWithEmail).not.toHaveBeenCalled();
    });

    it('should reject weak password under 8 characters before calling port', async () => {
      const useCase = new RegisterUserUseCase(mockAuthPort);

      await expect(
        useCase.execute({
          email: 'valid@example.com',
          password: 'short',
        })
      ).rejects.toThrow(WeakPasswordError);

      expect(mockAuthPort.registerWithEmail).not.toHaveBeenCalled();
    });

    it('should bubble up UserAlreadyExistsError from AuthPort', async () => {
      vi.mocked(mockAuthPort.registerWithEmail).mockRejectedValue(
        new UserAlreadyExistsError('valid@example.com')
      );
      const useCase = new RegisterUserUseCase(mockAuthPort);

      await expect(
        useCase.execute({
          email: 'valid@example.com',
          password: 'Password123!',
        })
      ).rejects.toThrow(UserAlreadyExistsError);
    });
  });

  describe('LoginWithEmailUseCase', () => {
    it('should log in a user with correct credentials', async () => {
      vi.mocked(mockAuthPort.loginWithEmail).mockResolvedValue(mockAuthResult);
      const useCase = new LoginWithEmailUseCase(mockAuthPort);

      const result = await useCase.execute({
        email: 'valid@example.com',
        password: 'Password123!',
      });

      expect(result.user.email).toBe('valid@example.com');
      expect(mockAuthPort.loginWithEmail).toHaveBeenCalledWith({
        email: 'valid@example.com',
        password: 'Password123!',
      });
    });

    it('should bubble up InvalidCredentialsError on bad login', async () => {
      vi.mocked(mockAuthPort.loginWithEmail).mockRejectedValue(new InvalidCredentialsError());
      const useCase = new LoginWithEmailUseCase(mockAuthPort);

      await expect(
        useCase.execute({
          email: 'valid@example.com',
          password: 'WrongPassword!',
        })
      ).rejects.toThrow(InvalidCredentialsError);
    });
  });
});
