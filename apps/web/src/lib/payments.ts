import fs from 'node:fs';
import path from 'node:path';
import type { PaymentRepositoryPort } from '@go-agree/application';
import {
  MockPaymentRepository,
  PaymentGatewayResolver,
  SupabasePaymentRepository,
  WompiPaymentGatewayAdapter,
  createSupabaseServerClient,
} from '@go-agree/infrastructure';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { getPaymentConfig } from './config';
import { logger } from './logger';

const globalMockPaymentRepo = new MockPaymentRepository();

function getServiceRoleKey(): string | undefined {
  if (
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY !== 'undefined'
  ) {
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

export async function getServerPaymentRepository(): Promise<PaymentRepositoryPort> {
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
      return new SupabasePaymentRepository(adminClient, logger);
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
            // Handled by route handler
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Handled by route handler
          }
        },
      });

      return new SupabasePaymentRepository(client as any, logger);
    }
  }

  logger.warn('Supabase credentials not configured; using MockPaymentRepository');
  return globalMockPaymentRepo;
}

export function getPaymentGatewayResolver(): PaymentGatewayResolver {
  const config = getPaymentConfig();
  const wompiAdapter = new WompiPaymentGatewayAdapter({
    publicKey: config.wompiPublicKey,
    privateKey: config.wompiPrivateKey,
    integritySecret: config.wompiIntegritySecret,
    eventsSecret: config.wompiEventSecret,
    checkoutBaseUrl: config.wompiCheckoutUrl,
    logger,
  });

  return new PaymentGatewayResolver([wompiAdapter]);
}
