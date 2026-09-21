/**
 * @file SupabaseDocumentStorageAdapter.ts
 * @description Storage adapter persisting compiled contract documents (.docx and .pdf)
 * to Supabase Storage bucket 'contracts' and tracking metadata in table 'contract_documents'.
 */

import type {
  DocumentBuffer,
  DocumentFormat,
  DocumentStoragePort,
  LoggerPort,
} from '@go-agree/application';
import { stripTypeIdPrefix } from '@go-agree/domain';
import type { SupabaseClient } from '@supabase/supabase-js';

const BUCKET_NAME = 'contracts';

const MIME_TYPES: Record<DocumentFormat, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

export class SupabaseDocumentStorageAdapter implements DocumentStoragePort {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly logger?: LoggerPort
  ) {}

  private resolveStoragePath(userId: string, contractId: string, format: DocumentFormat): string {
    const cleanUserId = stripTypeIdPrefix(userId);
    const cleanContractId = stripTypeIdPrefix(contractId);
    return `${cleanUserId}/${cleanContractId}/contract.${format}`;
  }

  async saveDocument(params: {
    contractId: string;
    userId: string;
    format: DocumentFormat;
    buffer: Buffer | Uint8Array;
  }): Promise<{ storagePath: string; createdAt: Date }> {
    const storagePath = this.resolveStoragePath(params.userId, params.contractId, params.format);
    const mimeType = MIME_TYPES[params.format];
    const now = new Date();

    // 1. Upload to Supabase Storage
    let { error: storageError } = await this.supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, params.buffer, {
        contentType: mimeType,
        upsert: true,
      });

    // Auto-create bucket if missing and retry once
    if (
      storageError &&
      (storageError.message?.toLowerCase().includes('bucket not found') ||
        (storageError as any).statusCode === '404' ||
        (storageError as any).status === 404)
    ) {
      this.logger?.info(`Storage bucket '${BUCKET_NAME}' not found. Attempting auto-creation...`);
      try {
        const { error: createBucketError } = await this.supabase.storage.createBucket(BUCKET_NAME, {
          public: false,
        });
        if (!createBucketError || createBucketError.message?.includes('already exists')) {
          const retry = await this.supabase.storage
            .from(BUCKET_NAME)
            .upload(storagePath, params.buffer, {
              contentType: mimeType,
              upsert: true,
            });
          storageError = retry.error;
        }
      } catch (e) {
        this.logger?.warn('Failed to auto-create storage bucket', { error: e });
      }
    }

    if (storageError) {
      this.logger?.error('Failed to upload document to Supabase Storage', {
        contractId: params.contractId,
        userId: params.userId,
        format: params.format,
        error: storageError.message,
      });
      throw new Error(`Storage upload failed: ${storageError.message}`);
    }

    // 2. Persist or update metadata in contract_documents table
    const cleanContractId = stripTypeIdPrefix(params.contractId);
    const cleanUserId = stripTypeIdPrefix(params.userId);

    const { error: dbError } = await this.supabase.from('contract_documents').upsert(
      {
        contract_id: cleanContractId,
        user_id: cleanUserId,
        file_format: params.format,
        storage_path: storagePath,
        created_at: now.toISOString(),
      },
      { onConflict: 'contract_id, file_format' }
    );

    if (dbError) {
      this.logger?.error('Failed to upsert contract_documents row', {
        contractId: params.contractId,
        userId: params.userId,
        format: params.format,
        error: dbError.message,
      });
      throw new Error(`Database upsert failed: ${dbError.message}`);
    }

    return { storagePath, createdAt: now };
  }

  async getDocument(params: {
    contractId: string;
    userId: string;
    format: DocumentFormat;
  }): Promise<DocumentBuffer | null> {
    const cleanContractId = stripTypeIdPrefix(params.contractId);
    const cleanUserId = stripTypeIdPrefix(params.userId);

    // 1. Fetch metadata
    const { data: meta, error: metaError } = await this.supabase
      .from('contract_documents')
      .select('storage_path, file_format')
      .eq('contract_id', cleanContractId)
      .eq('user_id', cleanUserId)
      .eq('file_format', params.format)
      .maybeSingle();

    if (metaError || !meta) {
      return null;
    }

    // 2. Download binary from storage
    const { data: blob, error: downloadError } = await this.supabase.storage
      .from(BUCKET_NAME)
      .download(meta.storage_path);

    if (downloadError || !blob) {
      this.logger?.warn('Document row exists but storage file could not be downloaded', {
        contractId: params.contractId,
        storagePath: meta.storage_path,
        error: downloadError?.message,
      });
      return null;
    }

    const arrayBuffer = await blob.arrayBuffer();
    const content = Buffer.from(arrayBuffer);

    return {
      format: params.format,
      content,
      mimeType: MIME_TYPES[params.format],
      filename: `contrato.${params.format}`,
    };
  }

  async getAvailableFormats(params: {
    contractId: string;
    userId: string;
  }): Promise<{ formats: DocumentFormat[]; lastGeneratedAt: Date | null }> {
    const cleanContractId = stripTypeIdPrefix(params.contractId);
    const cleanUserId = stripTypeIdPrefix(params.userId);

    const { data, error } = await this.supabase
      .from('contract_documents')
      .select('file_format, created_at')
      .eq('contract_id', cleanContractId)
      .eq('user_id', cleanUserId)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return { formats: [], lastGeneratedAt: null };
    }

    const formats = data.map((d: any) => d.file_format as DocumentFormat);
    const lastGeneratedAt = new Date(data[0].created_at);

    return { formats, lastGeneratedAt };
  }

  async deleteDocuments(params: {
    contractId: string;
    userId: string;
  }): Promise<void> {
    const cleanContractId = stripTypeIdPrefix(params.contractId);
    const cleanUserId = stripTypeIdPrefix(params.userId);

    const { data } = await this.supabase
      .from('contract_documents')
      .select('storage_path')
      .eq('contract_id', cleanContractId)
      .eq('user_id', cleanUserId);

    if (data && data.length > 0) {
      const paths = data.map((d: any) => d.storage_path);
      await this.supabase.storage.from(BUCKET_NAME).remove(paths);
    }

    await this.supabase
      .from('contract_documents')
      .delete()
      .eq('contract_id', cleanContractId)
      .eq('user_id', cleanUserId);
  }
}
