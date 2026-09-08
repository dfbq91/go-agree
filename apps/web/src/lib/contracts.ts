import { cookies } from 'next/headers';
import {
  createSupabaseServerClient,
  SupabaseContractRepository,
  MockContractRepository,
} from '@go-agree/infrastructure';
import type { ContractRepositoryPort } from '@go-agree/application';

const globalMockContractRepo = new MockContractRepository();

export function getServerContractRepository(): ContractRepositoryPort {
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
          // Handled by route handler or middleware
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch {
          // Handled by route handler or middleware
        }
      },
    });

    return new SupabaseContractRepository(client);
  }

  return globalMockContractRepo;
}
