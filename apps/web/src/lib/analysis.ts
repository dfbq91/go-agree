import { createGoogleGenerativeAI } from '@ai-sdk/google';
import {
  AnalyzeContractAnswersUseCase,
  type ContractRepositoryPort,
  type DynamicQuestionRepositoryPort,
  type LlmQuestionAnalysisPort,
} from '@go-agree/application';
import {
  AiQuestionAnalysisAdapter,
  MockDynamicQuestionRepository,
  SupabaseContractRepository,
  SupabaseDynamicQuestionRepository,
} from '@go-agree/infrastructure';
import { createClient } from '@supabase/supabase-js';
import { getServerContractRepository } from './contracts';

let globalMockDynamicRepo: MockDynamicQuestionRepository | null = null;

export function getServerDynamicQuestionRepository(): DynamicQuestionRepositoryPort {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceRoleKey && !supabaseUrl.includes('<your-project-id>')) {
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    return new SupabaseDynamicQuestionRepository(adminClient);
  }

  if (!globalMockDynamicRepo) {
    globalMockDynamicRepo = new MockDynamicQuestionRepository();
  }
  return globalMockDynamicRepo;
}

export async function getAnalyzeContractUseCase(): Promise<AnalyzeContractAnswersUseCase> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  let contractRepo: ContractRepositoryPort;
  const dynamicRepo = getServerDynamicQuestionRepository();

  // Si tenemos credenciales de Supabase configuradas
  if (supabaseUrl && serviceRoleKey && !supabaseUrl.includes('<your-project-id>')) {
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    contractRepo = new SupabaseContractRepository(adminClient);
  } else {
    // Fallback a repositorios en memoria para pruebas locales
    contractRepo = await getServerContractRepository();
  }

  const google = createGoogleGenerativeAI({
    apiKey: process.env.AI_API_KEY || '',
  });
  const model = google(process.env.AI_MODEL || 'gemini-3.5-flash-lite');

  const llmAdapter: LlmQuestionAnalysisPort = new AiQuestionAnalysisAdapter({ model });

  return new AnalyzeContractAnswersUseCase(contractRepo, dynamicRepo, llmAdapter);
}
