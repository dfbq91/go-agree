/**
 * @file DocumentStoragePort.ts
 * @description Port interface for persisting, checking, and retrieving compiled document artifacts.
 */

import type { DocumentBuffer, DocumentFormat } from './DocumentGeneratorPort.js';

export interface DocumentStoragePort {
  saveDocument(params: {
    contractId: string;
    userId: string;
    format: DocumentFormat;
    buffer: Buffer | Uint8Array;
  }): Promise<{ storagePath: string; createdAt: Date }>;

  getDocument(params: {
    contractId: string;
    userId: string;
    format: DocumentFormat;
  }): Promise<DocumentBuffer | null>;

  getAvailableFormats(params: {
    contractId: string;
    userId: string;
  }): Promise<{ formats: DocumentFormat[]; lastGeneratedAt: Date | null }>;

  deleteDocuments(params: {
    contractId: string;
    userId: string;
  }): Promise<void>;
}
