import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '../../src/middleware';

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}));

import { createServerClient } from '@supabase/ssr';

describe('Route Guard Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createMockRequest(pathname: string, search = '') {
    const url = new URL(`http://localhost:3000${pathname}${search}`);
    return new NextRequest(url);
  }

  it('redirects unauthenticated user accessing /dashboard to /login with redirect query param', async () => {
    (createServerClient as any).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    });

    const req = createMockRequest('/dashboard');
    const res = await middleware(req);

    expect(res.status).toBe(307);
    const location = res.headers.get('location');
    expect(location).toContain('/login?redirect=%2Fdashboard');
  });

  it('redirects unauthenticated user accessing /questionnaire to /login with redirect param', async () => {
    (createServerClient as any).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    });

    const req = createMockRequest('/questionnaire');
    const res = await middleware(req);

    expect(res.status).toBe(307);
    const location = res.headers.get('location');
    expect(location).toContain('/login?redirect=%2Fquestionnaire');
  });

  it('allows authenticated user accessing /dashboard to proceed', async () => {
    (createServerClient as any).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123', email: 'test@example.com' } },
          error: null,
        }),
      },
    });

    const req = createMockRequest('/dashboard');
    const res = await middleware(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('redirects authenticated user accessing /login to /dashboard', async () => {
    (createServerClient as any).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123', email: 'test@example.com' } },
          error: null,
        }),
      },
    });

    const req = createMockRequest('/login');
    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/dashboard');
  });

  it('allows unauthenticated user accessing public routes to proceed', async () => {
    (createServerClient as any).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    });

    const req = createMockRequest('/');
    const res = await middleware(req);

    expect(res.status).toBe(200);
  });
});
