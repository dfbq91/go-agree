import type { AssembledContractDTO } from '@go-agree/application';
import { describe, expect, it } from 'vitest';
import { DocxDocumentGeneratorAdapter } from '../../src/adapters/document/DocxDocumentGeneratorAdapter.js';
import { PdfDocumentGeneratorAdapter } from '../../src/adapters/document/PdfDocumentGeneratorAdapter.js';
import { CONTRACT_DRAFTING_SYSTEM_PROMPT } from '../../src/adapters/llm/AiContractDraftingAdapter.js';

describe('Contract Anatomy, Legal Disclaimers, and Signature Blocks (US5)', () => {
  const sampleContract: AssembledContractDTO = {
    contractId: 'contract-anatomy-test',
    title: 'CONTRATO DE PRESTACIÓN DE SERVICIOS PROFESIONALES',
    client: {
      name: 'Carlos Andrés Morales',
      entityType: 'individual',
      idNumber: 'C.C. 1.020.345.678 de Bogotá',
      address: 'Calle 100 # 15-20, Bogotá',
      details: 'En calidad de Contratante',
    },
    provider: {
      name: 'Soluciones Digitales S.A.S.',
      entityType: 'legal_entity',
      idNumber: 'NIT 901.234.567-8',
      address: 'Carrera 7 # 72-10, Bogotá',
      details: 'Representada legalmente por Diana Marcela Pérez',
    },
    declarations: [
      'Que el CONTRATANTE requiere la contratación de servicios de consultoría.',
      'Que el CONTRATISTA cuenta con la idoneidad técnica requerida.',
    ],
    operativeClauses: [
      {
        number: 1,
        title: 'Objeto',
        text: 'El CONTRATISTA se obliga para con el CONTRATANTE a prestar servicios de desarrollo.',
      },
      {
        number: 2,
        title: 'Precio y Forma de Pago',
        text: 'El precio total asciende a la suma de $10.000.000 COP pagaderos en dos cuotas.',
      },
      {
        number: 3,
        title: 'Vigencia',
        text: 'El presente contrato tendrá una duración de seis (6) meses contados a partir de su firma.',
      },
    ],
    dynamicClauses: [
      {
        id: 'dyn_1',
        title: 'Acuerdo de Confidencialidad Reforzado',
        text: 'Las partes se comprometen a custodiar el secreto empresarial durante 5 años.',
      },
    ],
    signatureBlocks: [
      {
        role: 'client',
        partyName: 'Carlos Andrés Morales',
        representativeName: 'EL CONTRATANTE',
        idNumber: 'C.C. 1.020.345.678',
        date: 'Fecha: 19 de septiembre de 2026',
      },
      {
        role: 'provider',
        partyName: 'Soluciones Digitales S.A.S.',
        representativeName: 'Diana Marcela Pérez - Representante Legal',
        idNumber: 'NIT 901.234.567-8',
        date: 'Fecha: 19 de septiembre de 2026',
      },
    ],
  };

  describe('LLM Prompt Rules', () => {
    it('instructs LLM to omit platform disclaimers and include structured signature blocks', () => {
      // Must instruct prompt to omit disclaimer
      expect(CONTRACT_DRAFTING_SYSTEM_PROMPT).toContain('NO incluyas descargos de responsabilidad');
      expect(CONTRACT_DRAFTING_SYSTEM_PROMPT).toContain('Bloques de Firma');
      expect(CONTRACT_DRAFTING_SYSTEM_PROMPT).toContain(
        'Comparecientes / Identificación de Partes'
      );
      expect(CONTRACT_DRAFTING_SYSTEM_PROMPT).toContain('Cláusulas Operativas Numeradas');
    });
  });

  describe('DocxDocumentGeneratorAdapter', () => {
    it('generates signature-ready Word document without platform disclaimers', async () => {
      const adapter = new DocxDocumentGeneratorAdapter();
      const result = await adapter.generateDocx(sampleContract);

      expect(result.format).toBe('docx');
      expect(result.content).toBeDefined();
      expect(result.content.length).toBeGreaterThan(1000);

      // Verify that the document binary does not contain the UI platform disclaimer text
      const rawContent = result.content.toString('latin1');
      expect(rawContent).not.toContain('No constituye asesoría jurídica');
      expect(rawContent).not.toContain('go-agree no es una firma de abogados');
    });
  });

  describe('PdfDocumentGeneratorAdapter', () => {
    it('generates signature-ready PDF document without platform disclaimers', async () => {
      const adapter = new PdfDocumentGeneratorAdapter();
      const result = await adapter.generatePdf(sampleContract);

      expect(result.format).toBe('pdf');
      expect(result.content).toBeDefined();
      expect(result.content.length).toBeGreaterThan(1000);

      // Verify PDF binary does not embed the platform disclaimer
      const rawContent = result.content.toString('latin1');
      expect(rawContent).not.toContain('No constituye asesoría jurídica');
      expect(rawContent).not.toContain('go-agree no es una firma de abogados');
    });
  });
});
