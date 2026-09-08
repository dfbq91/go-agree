import { cookies } from 'next/headers';
import {
  createSupabaseServerClient,
  SupabaseAuthAdapter,
  MockAuthAdapter,
} from '@go-agree/infrastructure';
import type { AuthPort } from '@go-agree/application';

// Singleton in-memory mock for dev fallback when Supabase credentials are not configured
const globalMockAdapter = new MockAuthAdapter();

export function getServerAuthAdapter(): AuthPort {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('<your-project-id>')) {
    const cookieStore = cookies();
    const client = createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Route handler or Server Action will set cookies
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch {
          // Route handler or Server Action will clear cookies
        }
      },
    });

    return new SupabaseAuthAdapter(client);
  }

  // Fallback to in-memory mock adapter for local testing/dev
  return globalMockAdapter;
}
