/**
 * @file AiContractDraftingAdapter.ts
 * @description Adapter invoking Google Gemini via Vercel AI SDK to draft structured legal contract clauses.
 */

import {
  type AssembledContractDTO,
  type DraftContractInput,
  type LlmContractDraftingPort,
} from '@go-agree/application';
import { generateText as defaultGenerateText, Output, type LanguageModel } from 'ai';
import { z } from 'zod';

export const CONTRACT_DRAFTING_SYSTEM_PROMPT = `Eres un abogado experto en redacción de contratos comerciales y civiles en Colombia.
Tu objetivo es redactar un contrato formal, completo y jurídicamente sólido con base en las respuestas suministradas por el usuario en el cuestionario.

### Estructura Contractual Obligatoria:
1. Título formal en mayúsculas sostenidas acorde a la naturaleza del negocio (ej. CONTRATO DE PRESTACIÓN DE SERVICIOS).
2. Comparecientes / Identificación de Partes: Contratante y Contratista (personas naturales o jurídicas, domicilios, documentos).
3. Declaraciones y Antecedentes: Objeto del acuerdo y contexto comercial.
4. Cláusulas Operativas Numeradas:
   - Cláusula Primera: Objeto detallado.
   - Cláusula Segunda: Lugar y condiciones de entrega/ejecución.
   - Cláusula Tercera: Plazo de ejecución, vigencia y preaviso de terminación.
   - Cláusula Cuarta: Precio, forma de pago y mecanismo de reajuste (si aplica).
   - Cláusula Quinta: Obligaciones del Contratista y asignación de personal/recursos.
   - Cláusula Sexta: Obligaciones del Contratante.
   - Cláusula Séptima: Régimen de incumplimiento y cláusula penal.
   - Cláusula Octava: Causales de terminación anticipada.
   - Cláusula Novena: Mecanismo de solución de controversias.
5. Cláusulas Particulares: Cláusulas adicionales derivadas de las preguntas de profundización respondidas.
6. Bloques de Firma: Espacios formales con líneas de firma, nombre, documento de identidad y fecha para ambas partes.

### Reglas Estrictas:
- NO incluyas descargos de responsabilidad ("disclaimers") dentro del cuerpo del contrato. Los avisos legales de la plataforma se muestran exclusivamente en la interfaz de usuario.
- Redacta en español formal y jurídico colombiano.
- No inventes obligaciones que contradigan las respuestas suministradas.`;

export const contractDraftSchema = z.object({
  title: z.string(),
  client: z.object({
    name: z.string(),
    entityType: z.enum(['individual', 'legal_entity']),
    idNumber: z.string().optional(),
    address: z.string().optional(),
    details: z.string().optional(),
  }),
  provider: z.object({
    name: z.string(),
    entityType: z.enum(['individual', 'legal_entity']),
    idNumber: z.string().optional(),
    address: z.string().optional(),
    details: z.string().optional(),
  }),
  declarations: z.array(z.string()),
  operativeClauses: z.array(
    z.object({
      number: z.number(),
      title: z.string(),
      text: z.string(),
    })
  ),
  dynamicClauses: z.array(
    z.object({
      number: z.number(),
      title: z.string(),
      text: z.string(),
    })
  ),
  signatureBlocks: z.array(
    z.object({
      role: z.enum(['client', 'provider']),
      partyName: z.string(),
      idNumber: z.string().optional(),
      representativeName: z.string().optional(),
    })
  ),
});

export interface AiContractDraftingAdapterOptions {
  model?: LanguageModel;
  generateTextFn?: typeof defaultGenerateText;
}

export class AiContractDraftingAdapter implements LlmContractDraftingPort {
  private readonly model?: LanguageModel;
  private readonly generateTextFn: typeof defaultGenerateText;

  constructor(options?: AiContractDraftingAdapterOptions) {
    this.model = options?.model;
    this.generateTextFn = options?.generateTextFn ?? defaultGenerateText;
  }

  async draftContract(input: DraftContractInput): Promise<AssembledContractDTO> {
    if (!this.model && !this.generateTextFn) {
      throw new Error('AiContractDraftingAdapter requires a valid model or generateTextFn.');
    }

    const { output } = await this.generateTextFn({
      model: this.model as LanguageModel,
      system: CONTRACT_DRAFTING_SYSTEM_PROMPT,
      prompt: `Título sugerido: ${input.title}\n\nRegistro de Respuestas:\n${input.transcript}`,
      output: Output.object({ schema: contractDraftSchema }),
    });

    return {
      contractId: input.contractId,
      title: output.title,
      client: output.client,
      provider: output.provider,
      declarations: output.declarations,
      operativeClauses: output.operativeClauses,
      dynamicClauses: output.dynamicClauses,
      signatureBlocks: output.signatureBlocks,
    };
  }
}
