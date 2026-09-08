import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RequestPasswordResetUseCase } from '../src/use-cases/auth/RequestPasswordResetUseCase.js';
import type { AuthPort } from '../src/ports/AuthPort.js';
import { InvalidEmailError } from '@go-agree/domain';

describe('RequestPasswordResetUseCase', () => {
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

  it('should trigger password reset for valid email', async () => {
    vi.mocked(mockAuthPort.requestPasswordReset).mockResolvedValue();
    const useCase = new RequestPasswordResetUseCase(mockAuthPort);

    await useCase.execute({ email: 'user@example.com' });

    expect(mockAuthPort.requestPasswordReset).toHaveBeenCalledWith({
      email: 'user@example.com',
      redirectToUrl: undefined,
    });
  });

  it('should reject invalid email format before calling port', async () => {
    const useCase = new RequestPasswordResetUseCase(mockAuthPort);

    await expect(useCase.execute({ email: 'not-an-email' })).rejects.toThrow(InvalidEmailError);
    expect(mockAuthPort.requestPasswordReset).not.toHaveBeenCalled();
  });
});
