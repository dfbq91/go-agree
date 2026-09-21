import { describe, expect, it, vi } from 'vitest';
import { AiContractDraftingAdapter } from '../../src/adapters/llm/AiContractDraftingAdapter.js';

describe('AiContractDraftingAdapter', () => {
  it('calls generateText with structured schema and returns AssembledContractDTO', async () => {
    const mockOutput = {
      title: 'CONTRATO DE PRESTACIÓN DE SERVICIOS',
      client: {
        name: 'Inversiones ABC S.A.S.',
        entityType: 'legal_entity' as const,
        idNumber: '900.123.456-7',
        address: 'Bogotá',
      },
      provider: {
        name: 'Juan Pérez',
        entityType: 'individual' as const,
        idNumber: '1.020.304.050',
      },
      declarations: ['Primera: Ambas partes declaran contar con capacidad.'],
      operativeClauses: [
        { number: 1, title: 'Objeto', text: 'Desarrollo de plataforma digital.' },
        { number: 2, title: 'Precio', text: 'El valor total es de diez millones de pesos.' },
      ],
      dynamicClauses: [
        {
          number: 3,
          title: 'Propiedad Intelectual',
          text: 'Los derechos patrimoniales se ceden al cliente.',
        },
      ],
      signatureBlocks: [
        { role: 'client' as const, partyName: 'Inversiones ABC S.A.S.', idNumber: '900.123.456-7' },
        { role: 'provider' as const, partyName: 'Juan Pérez', idNumber: '1.020.304.050' },
      ],
    };

    const mockGenerateText = vi.fn().mockResolvedValue({
      output: mockOutput,
    });

    const adapter = new AiContractDraftingAdapter({
      model: {} as any,
      generateTextFn: mockGenerateText as any,
    });

    const result = await adapter.draftContract({
      contractId: 'cnt_123',
      title: 'Contrato de Servicios de Desarrollo',
      transcript: 'TÍTULO: Contrato de Servicios\n[q0] Contratante: Inversiones ABC...',
      answers: {},
    });

    expect(result.contractId).toBe('cnt_123');
    expect(result.title).toBe('CONTRATO DE PRESTACIÓN DE SERVICIOS');
    expect(result.client.name).toBe('Inversiones ABC S.A.S.');
    expect(result.operativeClauses).toHaveLength(2);
    expect(result.signatureBlocks).toHaveLength(2);

    expect(mockGenerateText).toHaveBeenCalledTimes(1);
    const callArgs = mockGenerateText.mock.calls[0][0];
    expect(callArgs.system).toContain('Eres un abogado experto en redacción de contratos');
    expect(callArgs.system).toContain('NO incluyas descargos de responsabilidad');
    expect(callArgs.prompt).toContain('Contrato de Servicios de Desarrollo');
  });

  it('throws an error if AI SDK call fails', async () => {
    const mockGenerateText = vi.fn().mockRejectedValue(new Error('AI Generation Timeout'));

    const adapter = new AiContractDraftingAdapter({
      model: {} as any,
      generateTextFn: mockGenerateText as any,
    });

    await expect(
      adapter.draftContract({
        contractId: 'cnt_123',
        title: 'Contrato Fallido',
        transcript: 'Transcript',
        answers: {},
      })
    ).rejects.toThrow('AI Generation Timeout');
  });
});
