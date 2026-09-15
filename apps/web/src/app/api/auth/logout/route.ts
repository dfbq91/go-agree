import { createApiErrorResponse, withCorrelationContext } from '@/lib/api-error';
import { getServerAuthAdapter } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { es } from '@/locales/es';
import { LogoutUseCase } from '@go-agree/application';
import { correlationStorage } from '@go-agree/infrastructure';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  return withCorrelationContext(request, async () => {
    try {
      const authAdapter = await getServerAuthAdapter();
      const session = await authAdapter.getCurrentSession();
      if (session) {
        correlationStorage.setUserId(session.userId);
      }

      const logoutUseCase = new LogoutUseCase(authAdapter);
      await logoutUseCase.execute();

      logger.info('User logged out');

      return NextResponse.json(
        {
          success: true,
          redirectTo: '/',
        },
        {
          headers: {
            'x-correlation-id': correlationStorage.getCorrelationId(),
          },
        }
      );
    } catch (error: any) {
      logger.error('Logout failed', { error });
      return createApiErrorResponse('LOGOUT_ERROR', es.errors.genericError || error.message, {
        status: 500,
      });
    }
  });
}
