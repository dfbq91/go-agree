import { describe, expect, it } from 'vitest';
import type { AssembledContractDTO } from '@go-agree/application';
import { DocxDocumentGeneratorAdapter } from '../../src/adapters/document/DocxDocumentGeneratorAdapter.js';
import { PdfDocumentGeneratorAdapter } from '../../src/adapters/document/PdfDocumentGeneratorAdapter.js';

describe('DocumentGeneratorAdapters (Pure Node.js Document Compilation)', () => {
  const sampleContract: AssembledContractDTO = {
    contractId: 'cnt_sample_123',
    title: 'CONTRATO DE PRESTACIÓN DE SERVICIOS PROFESIONALES',
    client: {
      name: 'Empresa Contratante S.A.S.',
      entityType: 'legal_entity',
      idNumber: 'NIT 900.123.456-7',
      address: 'Calle 100 # 15-20, Bogotá',
    },
    provider: {
      name: 'Juan Carlos Pérez Gómez',
      entityType: 'individual',
      idNumber: 'C.C. 1.020.304.050 de Bogotá',
      address: 'Carrera 7 # 45-10, Bogotá',
    },
    declarations: [
      'DECLARACIÓN PRIMERA: Las partes declaran contar con plena capacidad jurídica para celebrar el presente acuerdo.',
      'DECLARACIÓN SEGUNDA: El Contratista cuenta con la idoneidad y experiencia técnica requerida.',
    ],
    operativeClauses: [
      {
        number: 1,
        title: 'Cláusula Primera - Objeto del Contrato',
        text: 'El Contratista se obliga a prestar sus servicios profesionales independientes para el desarrollo de la plataforma web.',
      },
      {
        number: 2,
        title: 'Cláusula Segunda - Valor y Forma de Pago',
        text: 'El valor total acordado es de DIEZ MILLONES DE PESOS ($10.000.000 COP) pagaderos en dos contados iguales.',
      },
      {
        number: 3,
        title: 'Cláusula Tercera - Plazo y Vigencia',
        text: 'El plazo de ejecución será de sesenta (60) días calendario contados a partir de la firma.',
      },
    ],
    dynamicClauses: [
      {
        number: 4,
        title: 'Cláusula Cuarta - Propiedad Intelectual',
        text: 'Todos los derechos patrimoniales sobre los desarrollos generados serán de titularidad exclusiva del Contratante.',
      },
    ],
    signatureBlocks: [
      {
        role: 'client',
        partyName: 'Empresa Contratante S.A.S.',
        idNumber: 'NIT 900.123.456-7',
        representativeName: 'Ana María Gómez (Representante Legal)',
      },
      {
        role: 'provider',
        partyName: 'Juan Carlos Pérez Gómez',
        idNumber: 'C.C. 1.020.304.050',
      },
    ],
  };

  describe('DocxDocumentGeneratorAdapter', () => {
    it('compiles AssembledContractDTO into a valid .docx Buffer', async () => {
      const adapter = new DocxDocumentGeneratorAdapter();
      const docxResult = await adapter.generateDocx(sampleContract);

      expect(docxResult.format).toBe('docx');
      expect(docxResult.mimeType).toBe(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
      expect(docxResult.filename).toContain('.docx');
      expect(docxResult.content).toBeDefined();
      expect(docxResult.content.length).toBeGreaterThan(500);
    });
  });

  describe('PdfDocumentGeneratorAdapter', () => {
    it('compiles AssembledContractDTO into a valid .pdf Buffer', async () => {
      const adapter = new PdfDocumentGeneratorAdapter();
      const pdfResult = await adapter.generatePdf(sampleContract);

      expect(pdfResult.format).toBe('pdf');
      expect(pdfResult.mimeType).toBe('application/pdf');
      expect(pdfResult.filename).toContain('.pdf');
      expect(pdfResult.content).toBeDefined();
      expect(pdfResult.content.length).toBeGreaterThan(500);

      // Verify PDF Magic Bytes (%PDF-)
      const magicBytes = Buffer.from(pdfResult.content).subarray(0, 4).toString('utf-8');
      expect(magicBytes).toBe('%PDF');
    });
  });
});
