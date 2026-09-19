/**
 * @file DocumentGeneratorPort.ts
 * @description Port interface for compiling structured contract representation
 * into binary document files (.docx and .pdf).
 */

import type { AssembledContractDTO } from './LlmContractDraftingPort.js';

export type DocumentFormat = 'pdf' | 'docx';

export interface DocumentBuffer {
  format: DocumentFormat;
  content: Buffer | Uint8Array;
  mimeType: string;
  filename: string;
}

export interface DocumentGeneratorPort {
  generateDocx(contract: AssembledContractDTO): Promise<DocumentBuffer>;
  generatePdf(contract: AssembledContractDTO): Promise<DocumentBuffer>;
}
