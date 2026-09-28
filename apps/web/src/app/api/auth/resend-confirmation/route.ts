import { createApiErrorResponse, withCorrelationContext } from '@/lib/api-error';
import { getServerAuthAdapter } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { es } from '@/locales/es';
import { ResendConfirmationEmailUseCase } from '@go-agree/application';
import { AuthRateLimitExceededError, DomainAuthError, InvalidEmailError } from '@go-agree/domain';
import { correlationStorage } from '@go-agree/infrastructure';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  return withCorrelationContext(request, async () => {
    try {
      const body = await request.json();
      if (!body.email || typeof body.email !== 'string') {
        return createApiErrorResponse('INVALID_EMAIL', es.errors.invalidEmail, { status: 400 });
      }

      const authAdapter = await getServerAuthAdapter();
      const useCase = new ResendConfirmationEmailUseCase(authAdapter);

      const requestUrl = new URL(request.url);
      const origin = requestUrl.origin;
      const nextTarget = body.redirect || '/dashboard';
      const emailRedirectTo = `${origin}/api/auth/callback?next=${encodeURIComponent(nextTarget)}`;

      await useCase.execute({
        email: body.email.trim(),
        emailRedirectTo,
      });

      logger.info('Resent confirmation email successfully', { email: body.email.trim() });

      return NextResponse.json(
        {
          success: true,
          message: es.auth.resendEmailSuccess,
        },
        {
          status: 200,
          headers: {
            'x-correlation-id': correlationStorage.getCorrelationId(),
          },
        }
      );
    } catch (error: any) {
      if (error instanceof InvalidEmailError) {
        logger.warn('Resend confirmation failed: invalid email', { error: error.message });
        return createApiErrorResponse(error.code, es.errors.invalidEmail, { status: 400 });
      }
      if (error instanceof AuthRateLimitExceededError) {
        logger.warn('Resend confirmation failed: rate limit exceeded', { error: error.message });
        return createApiErrorResponse(error.code, es.errors.rateLimitExceeded, { status: 429 });
      }
      if (error instanceof DomainAuthError) {
        logger.warn('Resend confirmation failed: domain auth error', { error: error.message });
        return createApiErrorResponse(error.code, error.message, { status: 400 });
      }

      logger.error('Unexpected error while resending confirmation email', { error });
      return createApiErrorResponse('INTERNAL_ERROR', es.auth.resendEmailError, { status: 500 });
    }
  });
}
