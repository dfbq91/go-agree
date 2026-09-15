import fs from 'node:fs';
import path from 'node:path';
import type { ContractRepositoryPort } from '@go-agree/application';
import {
  MockContractRepository,
  SupabaseContractRepository,
  createSupabaseServerClient,
} from '@go-agree/infrastructure';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const globalMockContractRepo = new MockContractRepository();

function getServiceRoleKey(): string | undefined {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY !== 'undefined') {
    return process.env.SUPABASE_SERVICE_ROLE_KEY;
  }
  try {
    const envPaths = [
      path.resolve(process.cwd(), '.env.local'),
      path.resolve(process.cwd(), 'apps/web/.env.local'),
      path.resolve(process.cwd(), '../apps/web/.env.local'),
    ];
    for (const envPath of envPaths) {
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const match = content.match(/^SUPABASE_SERVICE_ROLE_KEY=(.+)$/m);
        if (match?.[1]) {
          return match[1].trim();
        }
      }
    }
  } catch {
    // Ignore file read errors
  }
  return undefined;
}

export async function getServerContractRepository(): Promise<ContractRepositoryPort> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = getServiceRoleKey();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && !supabaseUrl.includes('<your-project-id>')) {
    if (serviceRoleKey) {
      const adminClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      return new SupabaseContractRepository(adminClient);
    }

    if (supabaseAnonKey) {
      const cookieStore = await cookies();
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

      return new SupabaseContractRepository(client as any);
    }
  }

  return globalMockContractRepo;
}
