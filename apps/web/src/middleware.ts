import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export const PROTECTED_ROUTES = ['/dashboard', '/questionnaire'];
export const AUTH_ROUTES = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const incomingCorrelationId = request.headers.get('x-correlation-id');
  const correlationId =
    incomingCorrelationId && incomingCorrelationId.trim().length > 0
      ? incomingCorrelationId.trim()
      : crypto.randomUUID();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-correlation-id', correlationId);

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set('x-correlation-id', correlationId);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
        response.headers.set('x-correlation-id', correlationId);
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        request.cookies.set({ name, value: '', ...options });
        response = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
        response.headers.set('x-correlation-id', correlationId);
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // If user is not authenticated and trying to access protected route
  if (isProtected && !user) {
    const redirectUrl = new URL('/login', request.url);
    const returnUrl = pathname + (request.nextUrl.search || '');
    redirectUrl.searchParams.set('redirect', returnUrl);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    redirectResponse.headers.set('x-correlation-id', correlationId);
    return redirectResponse;
  }

  // If user is authenticated and trying to access login/register
  if (isAuthRoute && user) {
    const targetRedirect = request.nextUrl.searchParams.get('redirect') || '/dashboard';
    const redirectUrl = new URL(targetRedirect, request.url);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    redirectResponse.headers.set('x-correlation-id', correlationId);
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
