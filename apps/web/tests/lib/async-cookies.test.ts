import { getServerAuthAdapter } from '@/lib/auth';
import { getServerContractRepository } from '@/lib/contracts';
import { getServerPaymentRepository } from '@/lib/payments';
import { getServerSubscriptionRepository } from '@/lib/subscription';
import { cookies } from 'next/headers';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import fs from 'node:fs';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

describe('Asynchronous Cookie Access (Next.js 16 Active LTS)', () => {
  const mockCookieStore = {
    get: vi.fn(),
    set: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);
    // In Next.js 16, cookies() returns a Promise
    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);
  });

  it('getServerAuthAdapter awaits cookies() when supabase env is configured', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    mockCookieStore.get.mockReturnValue({ value: 'session-token' });

    const authAdapter = await getServerAuthAdapter();
    expect(cookies).toHaveBeenCalled();
    expect(authAdapter).toBeDefined();

    process.env.NEXT_PUBLIC_SUPABASE_URL = undefined;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = undefined;
  });

  it('getServerContractRepository awaits cookies() when service role is not set', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const repo = await getServerContractRepository();
    expect(cookies).toHaveBeenCalled();
    expect(repo).toBeDefined();

    process.env.NEXT_PUBLIC_SUPABASE_URL = undefined;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = undefined;
  });

  it('getServerPaymentRepository awaits cookies() when service role is not set', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const repo = await getServerPaymentRepository();
    expect(cookies).toHaveBeenCalled();
    expect(repo).toBeDefined();

    process.env.NEXT_PUBLIC_SUPABASE_URL = undefined;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = undefined;
  });

  it('getServerSubscriptionRepository awaits cookies() when service role is not set', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const repo = await getServerSubscriptionRepository();
    expect(cookies).toHaveBeenCalled();
    expect(repo).toBeDefined();

    process.env.NEXT_PUBLIC_SUPABASE_URL = undefined;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = undefined;
  });
});
