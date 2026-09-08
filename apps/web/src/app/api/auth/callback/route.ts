import { NextResponse } from 'next/server';
import { getServerAuthAdapter } from '@/lib/auth';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  // Handle user cancellation or provider rejection
  if (error) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set(
      'error',
      error === 'access_denied' ? 'google_cancelled' : 'google_failed'
    );
    if (errorDescription) {
      redirectUrl.searchParams.set('details', errorDescription);
    }
    return NextResponse.redirect(redirectUrl);
  }

  if (code) {
    try {
      const authAdapter = getServerAuthAdapter();
      await authAdapter.handleOAuthCallback({ code });

      // Clean redirect to protected dashboard or preserved destination
      const redirectUrl = new URL(next, request.url);
      return NextResponse.redirect(redirectUrl);
    } catch (err: any) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('error', 'google_failed');
      return NextResponse.redirect(redirectUrl);
    }
  }

  // No code and no error
  const redirectUrl = new URL('/login', request.url);
  redirectUrl.searchParams.set('error', 'google_failed');
  return NextResponse.redirect(redirectUrl);
}
