/**
 * @file MockContractDraftingAdapter.ts
 * @description Fast, deterministic test mock for LlmContractDraftingPort.
 */

import type {
  AssembledContractDTO,
  DraftContractInput,
  LlmContractDraftingPort,
} from '@go-agree/application';

export class MockContractDraftingAdapter implements LlmContractDraftingPort {
  public lastInput: DraftContractInput | null = null;
  public customResult: Partial<AssembledContractDTO> | null = null;

  async draftContract(input: DraftContractInput): Promise<AssembledContractDTO> {
    this.lastInput = input;

    if (this.customResult) {
      return {
        contractId: input.contractId,
        title: input.title,
        client: {
          name: 'Contratante Mock S.A.S.',
          entityType: 'legal_entity',
          idNumber: '900.111.222-3',
          address: 'Bogotá, Colombia',
        },
        provider: {
          name: 'Contratista Mock',
          entityType: 'individual',
          idNumber: '1.020.304.050',
          address: 'Medellín, Colombia',
        },
        declarations: ['Declaración 1: Ambas partes cuentan con capacidad legal.'],
        operativeClauses: [
          { number: 1, title: 'Objeto', text: `Objeto del contrato: ${input.title}` },
          { number: 2, title: 'Plazo', text: 'Plazo de ejecución pactado.' },
          { number: 3, title: 'Precio', text: 'Precio y condiciones de pago acordadas.' },
        ],
        dynamicClauses: [],
        signatureBlocks: [
          { role: 'client', partyName: 'Contratante Mock S.A.S.', idNumber: '900.111.222-3' },
          { role: 'provider', partyName: 'Contratista Mock', idNumber: '1.020.304.050' },
        ],
        ...this.customResult,
      };
    }

    return {
      contractId: input.contractId,
      title: input.title,
      client: {
        name: 'Contratante Mock S.A.S.',
        entityType: 'legal_entity',
        idNumber: '900.111.222-3',
        address: 'Bogotá, Colombia',
      },
      provider: {
        name: 'Contratista Mock',
        entityType: 'individual',
        idNumber: '1.020.304.050',
        address: 'Medellín, Colombia',
      },
      declarations: ['Declaración primera: Las partes se reconocen mutuamente capacidad legal.'],
      operativeClauses: [
        {
          number: 1,
          title: 'Cláusula Primera - Objeto',
          text: `El presente contrato tiene por objeto regular los términos acordados en: ${input.title}.`,
        },
        {
          number: 2,
          title: 'Cláusula Segunda - Plazo y Vigencia',
          text: 'El plazo de ejecución será el establecido en las respuestas del cuestionario.',
        },
        {
          number: 3,
          title: 'Cláusula Tercera - Precio y Forma de Pago',
          text: 'El precio convenido se pagará de conformidad con las condiciones estipuladas.',
        },
      ],
      dynamicClauses: [
        {
          number: 4,
          title: 'Cláusula Cuarta - Acuerdos Particulares',
          text: 'Términos adicionales derivados del análisis de riesgos.',
        },
      ],
      signatureBlocks: [
        {
          role: 'client',
          partyName: 'Contratante Mock S.A.S.',
          idNumber: 'NIT 900.111.222-3',
          representativeName: 'Representante Legal',
        },
        {
          role: 'provider',
          partyName: 'Contratista Mock',
          idNumber: 'C.C. 1.020.304.050',
        },
      ],
    };
  }
}
