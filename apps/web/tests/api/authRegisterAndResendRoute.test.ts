import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST as registerHandler } from '../../src/app/api/auth/register/route';
import { POST as resendHandler } from '../../src/app/api/auth/resend-confirmation/route';

const { mockRegisterWithEmail, mockResendConfirmationEmail } = vi.hoisted(() => ({
  mockRegisterWithEmail: vi.fn(),
  mockResendConfirmationEmail: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  getServerAuthAdapter: vi.fn().mockResolvedValue({
    registerWithEmail: mockRegisterWithEmail,
    resendConfirmationEmail: mockResendConfirmationEmail,
  }),
}));

describe('Auth Register and Resend Confirmation API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('returns 201 with redirectTo pointing to /confirm-email', async () => {
      mockRegisterWithEmail.mockResolvedValue({
        user: {
          id: 'u-1',
          email: 'test@example.com',
          authProviders: ['email_password'],
          createdAt: new Date(),
          lastLoginAt: new Date(),
        },
        session: {
          sessionId: 's-1',
          userId: 'u-1',
          expiresAt: new Date(),
          isValid: true,
        },
      });

      const request = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'Password123!',
          redirect: '/questionnaire',
        }),
      });

      const response = await registerHandler(request);
      expect(response.status).toBe(201);

      const json = await response.json();
      expect(json.redirectTo).toBe('/confirm-email?email=test%40example.com&redirect=%2Fquestionnaire');
      expect(mockRegisterWithEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          password: 'Password123!',
          emailRedirectTo: 'http://localhost:3000/api/auth/callback?next=%2Fquestionnaire',
        })
      );
    });
  });

  describe('POST /api/auth/resend-confirmation', () => {
    it('returns 200 and calls resend on valid email', async () => {
      mockResendConfirmationEmail.mockResolvedValue(undefined);

      const request = new Request('http://localhost:3000/api/auth/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          redirect: '/dashboard',
        }),
      });

      const response = await resendHandler(request);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(mockResendConfirmationEmail).toHaveBeenCalledWith({
        email: 'test@example.com',
        emailRedirectTo: 'http://localhost:3000/api/auth/callback?next=%2Fdashboard',
      });
    });

    it('returns 400 when email is invalid', async () => {
      const request = new Request('http://localhost:3000/api/auth/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'not-an-email',
        }),
      });

      const response = await resendHandler(request);
      expect(response.status).toBe(400);
      expect(mockResendConfirmationEmail).not.toHaveBeenCalled();
    });

    it('returns 429 when rate limit is exceeded', async () => {
      const { AuthRateLimitExceededError } = await import('@go-agree/domain');
      mockResendConfirmationEmail.mockRejectedValue(new AuthRateLimitExceededError());

      const request = new Request('http://localhost:3000/api/auth/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'ratelimit@example.com',
        }),
      });

      const response = await resendHandler(request);
      expect(response.status).toBe(429);
      const json = await response.json();
      expect(json.code).toBe('RATE_LIMIT_EXCEEDED');
    });
  });
});
