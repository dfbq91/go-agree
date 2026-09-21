/**
 * @file MockDocumentGeneratorAdapter.ts
 * @description Fast deterministic test mock for DocumentGeneratorPort.
 */

import type {
  AssembledContractDTO,
  DocumentBuffer,
  DocumentGeneratorPort,
} from '@go-agree/application';

export class MockDocumentGeneratorAdapter implements DocumentGeneratorPort {
  public lastGeneratedContract: AssembledContractDTO | null = null;
  public failNextDocx = false;
  public failNextPdf = false;

  async generateDocx(contract: AssembledContractDTO): Promise<DocumentBuffer> {
    if (this.failNextDocx) {
      throw new Error('Simulated Docx generation failure');
    }
    this.lastGeneratedContract = contract;

    const dummyContent = Buffer.from(`MOCK DOCX CONTENT: ${contract.title}`);
    return {
      format: 'docx',
      content: dummyContent,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      filename: `${contract.title.replace(/\s+/g, '_')}.docx`,
    };
  }

  async generatePdf(contract: AssembledContractDTO): Promise<DocumentBuffer> {
    if (this.failNextPdf) {
      throw new Error('Simulated PDF generation failure');
    }
    this.lastGeneratedContract = contract;

    const dummyContent = Buffer.from(`MOCK PDF CONTENT: ${contract.title}`);
    return {
      format: 'pdf',
      content: dummyContent,
      mimeType: 'application/pdf',
      filename: `${contract.title.replace(/\s+/g, '_')}.pdf`,
    };
  }
}
