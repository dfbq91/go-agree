import { createApiErrorResponse, withCorrelationContext } from '@/lib/api-error';
import { getServerAuthAdapter } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { es } from '@/locales/es';
import { correlationStorage } from '@go-agree/infrastructure';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  return withCorrelationContext(request, async () => {
    try {
      const body = await request.json().catch(() => ({}));
      const requestUrl = new URL(request.url);
      const origin = requestUrl.origin;
      const targetNext = body.redirectTo || '/dashboard';

      const callbackUrl = `${origin}/api/auth/callback?next=${encodeURIComponent(targetNext)}`;

      const authAdapter = await getServerAuthAdapter();
      const result = await authAdapter.getGoogleAuthUrl(callbackUrl);

      logger.info('Generated Google OAuth URL');

      return NextResponse.json(
        {
          authUrl: result.authUrl,
        },
        {
          headers: {
            'x-correlation-id': correlationStorage.getCorrelationId(),
          },
        }
      );
    } catch (error: any) {
      logger.error('Google auth URL generation failed', { error });
      return createApiErrorResponse(
        'GOOGLE_AUTH_ERROR',
        es.errors.googleAuthFailed || error.message,
        { status: 500 }
      );
    }
  });
}
