import { createApiErrorResponse, withCorrelationContext } from '@/lib/api-error';
import { getServerAuthAdapter } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { es } from '@/locales/es';
import { LoginWithEmailUseCase } from '@go-agree/application';
import { DomainAuthError, InvalidCredentialsError, InvalidEmailError } from '@go-agree/domain';
import { correlationStorage } from '@go-agree/infrastructure';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  return withCorrelationContext(request, async () => {
    try {
      const body = await request.json();
      const authAdapter = await getServerAuthAdapter();
      const useCase = new LoginWithEmailUseCase(authAdapter);

      const result = await useCase.execute({
        email: body.email,
        password: body.password,
      });

      correlationStorage.setUserId(result.user.id);
      logger.info('User login successful', { userId: result.user.id });

      return NextResponse.json(
        {
          user: result.user,
          redirectTo: '/dashboard',
        },
        {
          headers: {
            'x-correlation-id': correlationStorage.getCorrelationId(),
          },
        }
      );
    } catch (error: any) {
      logger.warn('User login failed', { error });
      if (error instanceof InvalidCredentialsError) {
        return createApiErrorResponse(error.code, es.errors.invalidCredentials, { status: 401 });
      }
      if (error instanceof InvalidEmailError) {
        return createApiErrorResponse(error.code, es.errors.invalidEmail, { status: 400 });
      }
      if (error instanceof DomainAuthError) {
        return createApiErrorResponse(error.code, error.message, { status: 400 });
      }

      return createApiErrorResponse('INTERNAL_ERROR', es.errors.genericError, { status: 500 });
    }
  });
}
