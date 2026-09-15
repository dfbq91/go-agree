import { withCorrelationContext } from '@/lib/api-error';
import { getServerAuthAdapter } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { correlationStorage } from '@go-agree/infrastructure';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  return withCorrelationContext(request, async () => {
    const correlationId = correlationStorage.getCorrelationId();
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const error = requestUrl.searchParams.get('error');
    const errorDescription = requestUrl.searchParams.get('error_description');
    const next = requestUrl.searchParams.get('next') || '/dashboard';

    // Handle user cancellation or provider rejection
    if (error) {
      logger.warn('OAuth provider returned error', { error, errorDescription });
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set(
        'error',
        error === 'access_denied' ? 'google_cancelled' : 'google_failed'
      );
      if (errorDescription) {
        redirectUrl.searchParams.set('details', errorDescription);
      }
      const response = NextResponse.redirect(redirectUrl);
      response.headers.set('x-correlation-id', correlationId);
      return response;
    }

    if (code) {
      try {
        const authAdapter = await getServerAuthAdapter();
        await authAdapter.handleOAuthCallback({ code });

        logger.info('OAuth callback processed successfully');

        // Clean redirect to protected dashboard or preserved destination
        const redirectUrl = new URL(next, request.url);
        const response = NextResponse.redirect(redirectUrl);
        response.headers.set('x-correlation-id', correlationId);
        return response;
      } catch (err: any) {
        logger.error('OAuth callback processing failed', { error: err });
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('error', 'google_failed');
        const response = NextResponse.redirect(redirectUrl);
        response.headers.set('x-correlation-id', correlationId);
        return response;
      }
    }

    // No code and no error
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('error', 'google_failed');
    const response = NextResponse.redirect(redirectUrl);
    response.headers.set('x-correlation-id', correlationId);
    return response;
  });
}
