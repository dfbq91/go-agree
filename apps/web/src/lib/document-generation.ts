/**
 * @file document-generation.ts
 * @description Dependency wiring for Document Generation, LLM Drafting, and Storage.
 */

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import {
  GenerateContractDocumentUseCase,
  GetContractDocumentDownloadUseCase,
  type DocumentGeneratorPort,
  type DocumentStoragePort,
  type LlmContractDraftingPort,
} from '@go-agree/application';
import {
  AiContractDraftingAdapter,
  DocxDocumentGeneratorAdapter,
  MockContractDraftingAdapter,
  MockDocumentGeneratorAdapter,
  PdfDocumentGeneratorAdapter,
  SupabaseDocumentStorageAdapter,
} from '@go-agree/infrastructure';
import { createClient } from '@supabase/supabase-js';
import { getServerDynamicQuestionRepository } from './analysis';
import { getServerContractRepository } from './contracts';
import { logger } from './logger';
import { getServerSubscriptionRepository } from './subscription';

class CompositeDocumentGenerator implements DocumentGeneratorPort {
  constructor(
    private readonly docxGen: DocxDocumentGeneratorAdapter,
    private readonly pdfGen: PdfDocumentGeneratorAdapter
  ) {}

  generateDocx(contract: any) {
    return this.docxGen.generateDocx(contract);
  }

  generatePdf(contract: any) {
    return this.pdfGen.generatePdf(contract);
  }
}

// In-memory fallback storage for environments without Supabase configured
class InMemoryDocumentStorageAdapter implements DocumentStoragePort {
  private docs = new Map<string, any>();

  async saveDocument(params: any) {
    const key = `${params.userId}_${params.contractId}_${params.format}`;
    const now = new Date();
    this.docs.set(key, { ...params, createdAt: now });
    return { storagePath: `mock/${key}`, createdAt: now };
  }

  async getDocument(params: any) {
    const key = `${params.userId}_${params.contractId}_${params.format}`;
    const found = this.docs.get(key);
    if (!found) return null;
    return {
      format: found.format,
      content: found.buffer,
      mimeType:
        found.format === 'pdf'
          ? 'application/pdf'
          : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      filename: `contrato.${found.format}`,
    };
  }

  async getAvailableFormats(params: any) {
    const formats: any[] = [];
    let lastGeneratedAt: Date | null = null;
    for (const [key, doc] of this.docs.entries()) {
      if (key.startsWith(`${params.userId}_${params.contractId}_`)) {
        formats.push(doc.format);
        lastGeneratedAt = doc.createdAt;
      }
    }
    return { formats, lastGeneratedAt };
  }

  async deleteDocuments(params: any) {
    for (const key of Array.from(this.docs.keys())) {
      if (key.startsWith(`${params.userId}_${params.contractId}_`)) {
        this.docs.delete(key);
      }
    }
  }
}

const globalMockStorage = new InMemoryDocumentStorageAdapter();

export function getServerDocumentStorageAdapter(): DocumentStoragePort {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceRoleKey && !supabaseUrl.includes('<your-project-id>')) {
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    return new SupabaseDocumentStorageAdapter(adminClient, logger);
  }

  return globalMockStorage;
}

export function getServerLlmContractDraftingPort(): LlmContractDraftingPort {
  const apiKey = process.env.AI_API_KEY;

  if (apiKey && apiKey !== 'test' && apiKey.length > 5) {
    try {
      const google = createGoogleGenerativeAI({ apiKey });
      const model = google(process.env.AI_MODEL || 'gemini-3.5-flash-lite');
      return new AiContractDraftingAdapter({ model });
    } catch (e) {
      logger.warn('Failed to initialize Google Gemini; falling back to MockContractDraftingAdapter', { error: e });
    }
  }

  return new MockContractDraftingAdapter();
}

export function getServerDocumentGeneratorPort(): DocumentGeneratorPort {
  return new CompositeDocumentGenerator(
    new DocxDocumentGeneratorAdapter(),
    new PdfDocumentGeneratorAdapter()
  );
}

export async function getGenerateContractDocumentUseCase(): Promise<GenerateContractDocumentUseCase> {
  const contractRepo = await getServerContractRepository();
  const dynamicRepo = getServerDynamicQuestionRepository();
  const llmPort = getServerLlmContractDraftingPort();
  const docGen = getServerDocumentGeneratorPort();
  const docStorage = getServerDocumentStorageAdapter();
  const subRepo = await getServerSubscriptionRepository();

  return new GenerateContractDocumentUseCase({
    contractRepository: contractRepo,
    dynamicQuestionRepository: dynamicRepo,
    llmContractDrafting: llmPort,
    documentGenerator: docGen,
    documentStorage: docStorage,
    subscriptionRepository: subRepo,
    logger,
  });
}

export async function getGetContractDocumentDownloadUseCase(): Promise<GetContractDocumentDownloadUseCase> {
  const contractRepo = await getServerContractRepository();
  const docStorage = getServerDocumentStorageAdapter();

  return new GetContractDocumentDownloadUseCase({
    contractRepository: contractRepo,
    documentStorage: docStorage,
    logger,
  });
}
