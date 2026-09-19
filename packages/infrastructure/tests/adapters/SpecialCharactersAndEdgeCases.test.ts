import type { AssembledContractDTO } from '@go-agree/application';
import { describe, expect, it } from 'vitest';
import { DocxDocumentGeneratorAdapter } from '../../src/adapters/document/DocxDocumentGeneratorAdapter.js';
import { PdfDocumentGeneratorAdapter } from '../../src/adapters/document/PdfDocumentGeneratorAdapter.js';

describe('Special Characters and Long Open-Text Edge Cases (T047)', () => {
  const docxAdapter = new DocxDocumentGeneratorAdapter();
  const pdfAdapter = new PdfDocumentGeneratorAdapter();

  const complexEdgeCaseContract: AssembledContractDTO = {
    contractId: 'contract-edge-cases-999',
    title: 'CONTRATO DE PRESTACIÓN DE SERVICIOS Y CESIÓN DE DERECHOS — EDICIÓN ESPECIAL «2026»',
    client: {
      name: 'María José Peña-Gómez & Cía. S.A.S.',
      entityType: 'legal_entity',
      idNumber: 'NIT 900.123.456-7 (Bogotá D.C., Colombia)',
      address: 'Avenida 19 # 104-62, Edificio «El Bosque», Apto. 502, Bogotá D.C.',
      details: 'Representada por el Dr. Álvaro Núñez (C.C. 19.876.543 de Ibagué, Tolima)',
    },
    provider: {
      name: 'Ingeniería & Diseños Acústicos Güepsa Ltda.',
      entityType: 'legal_entity',
      idNumber: 'NIT 800.987.654-3 (Bucaramanga, Santander)',
      address: 'Calle 36 # 24-18, Oficina 301, Bucaramanga',
      details: 'Representada legalmente por doña Inés Cañón de Piñeres (C.C. 63.456.789)',
    },
    declarations: [
      '¿Las partes declaran bajo la gravedad de juramento que la información suministrada es verídica?',
      '¡Sí! Se confirma expresamente la veracidad de cada dato, anexo y cláusula aquí convenida.',
      'Que el proveedor dispone de software con licencia número #84920/2026-Ñ y símbolos especiales: § 1, 2, ©, ®, ™, €, $, %, &, *, +, =, <, >, [, ], {, }, |, ~, ^.',
    ],
    operativeClauses: [
      {
        number: 1,
        title: 'Objeto y Especificaciones Técnicas con Caracteres Especiales',
        text: [
          'El CONTRATISTA se compromete a realizar la consultoría técnica integral:',
          '1. Análisis de vibración acústica en frecuencias de 20 Hz a 20.000 Hz, considerando parámetros de temperatura (0°C a 45°C) y humedad relativa (95%).',
          '2. Elaboración del informe técnico con citas textuales: «Las mediciones no superarán los 65 dB(A) según la Resolución 0627 de 2006».',
          '3. Revisión de términos en idiomas mixtos: "state-of-the-art" engineering, "know-how" patentado y protocolos anti-phishing.',
          '4. Vocales acentuadas mayúsculas y minúsculas: Á, É, Í, Ó, Ú, á, é, í, ó, ú, Ü, ü, Ñ, ñ, ¿, ¡, —, –, “ ”, ‘ ’.\n',
        ].join('\n\n'),
      },
      {
        number: 2,
        title: 'Cláusula Extensa (Stress Test de Texto Abierto)',
        // 4,000+ characters of text with multiple linebreaks to simulate extensive user answers
        text: [
          'Esta cláusula evalúa la capacidad del generador para maquetar textos extremadamente largos sin desbordamientos de memoria ni truncamiento de caracteres.',
          'Párrafo A: '.repeat(25),
          `Párrafo B con puntuación y acentos: ¿Está seguro de cumplir con los plazos estipulados? ¡Absolutamente! Cada hito será entregado oportunamente en las fechas límite: primera entrega (día 15), segunda entrega (día 30), entrega final con acta de liquidación (día 45). ${'Todos los entregables deberán ser suscritos por el interventor y acompañados de sus respectivas pólizas de cumplimiento, salarios y prestaciones sociales. '.repeat(5)}`,
          'Párrafo C con listas detalladas:\n- Sub-ítem 1.1: Revisión de planos arquitectónicos y estructurales.\n- Sub-ítem 1.2: Pruebas de carga e informes de estabilidad estática.\n- Sub-ítem 1.3: Certificación RETIE / RETILAP aplicable a instalaciones eléctricas.\n- Sub-ítem 1.4: Protocolo de bioseguridad, emergencias y plan de contingencia.',
          'Fin del anexo técnico extendido con total indemnidad legal para las partes involucradas.',
        ].join('\n\n'),
      },
      {
        number: 3,
        title: 'Honorarios, Divisas y Retenciones',
        text: 'El valor acordado es de $45.500.000 COP (cuarenta y cinco millones quinientos mil pesos m/cte), más IVA del 19%, con retención en la fuente del 4% (servicios) u 11% (honorarios profesionales especializados).',
      },
    ],
    dynamicClauses: [
      {
        id: 'dyn_special_prop_int',
        title: 'Propiedad Intelectual y Licenciamiento Recíproco',
        text: 'Los derechos patrimoniales sobre las creaciones, códigos fuente, diseños y metodologías («Software y Know-How») pertenecerán al CONTRATANTE según lo dispuesto en la Decisión Andina 351 de 1993 y la Ley 23 de 1982.',
      },
    ],
    signatureBlocks: [
      {
        role: 'client',
        partyName: 'María José Peña-Gómez & Cía. S.A.S.',
        representativeName: 'Dr. Álvaro Núñez — Representante Legal',
        idNumber: 'C.C. 19.876.543 de Ibagué',
        date: 'Fecha: 19 de septiembre de 2026',
      },
      {
        role: 'provider',
        partyName: 'Ingeniería & Diseños Acústicos Güepsa Ltda.',
        representativeName: 'Doña Inés Cañón de Piñeres — Gerente General',
        idNumber: 'C.C. 63.456.789 de Bucaramanga',
        date: 'Fecha: 19 de septiembre de 2026',
      },
    ],
  };

  describe('DocxDocumentGeneratorAdapter Resilience', () => {
    it('successfully generates Word document containing all special characters and long text without throwing', async () => {
      const result = await docxAdapter.generateDocx(complexEdgeCaseContract);

      expect(result.format).toBe('docx');
      expect(result.mimeType).toBe(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
      expect(result.content).toBeInstanceOf(Buffer);
      expect(result.content.length).toBeGreaterThan(5000);
      expect(result.filename).toMatch(/\.docx$/);
    });
  });

  describe('PdfDocumentGeneratorAdapter Resilience', () => {
    it('successfully generates PDF document containing all special characters and long text without throwing', async () => {
      const result = await pdfAdapter.generatePdf(complexEdgeCaseContract);

      expect(result.format).toBe('pdf');
      expect(result.mimeType).toBe('application/pdf');
      expect(result.content).toBeInstanceOf(Buffer);
      expect(result.content.length).toBeGreaterThan(3000);
      // Verify valid PDF header magic bytes
      const header = result.content.subarray(0, 5).toString('ascii');
      expect(header).toBe('%PDF-');
      expect(result.filename).toMatch(/\.pdf$/);
    });
  });
});
