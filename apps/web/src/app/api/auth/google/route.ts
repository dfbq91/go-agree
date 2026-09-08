import { NextResponse } from 'next/server';
import { getServerAuthAdapter } from '@/lib/auth';
import { es } from '@/locales/es';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const requestUrl = new URL(request.url);
    const origin = requestUrl.origin;
    const targetNext = body.redirectTo || '/dashboard';

    const callbackUrl = `${origin}/api/auth/callback?next=${encodeURIComponent(targetNext)}`;

    const authAdapter = getServerAuthAdapter();
    const result = await authAdapter.getGoogleAuthUrl(callbackUrl);

    return NextResponse.json({
      authUrl: result.authUrl,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: es.errors.googleAuthFailed || error.message },
      { status: 500 }
    );
  }
}
