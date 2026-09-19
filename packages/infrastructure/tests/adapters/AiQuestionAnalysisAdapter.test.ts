import { describe, expect, it, vi } from 'vitest';
import { AiQuestionAnalysisAdapter } from '../../src/adapters/llm/AiQuestionAnalysisAdapter.js';

describe('AiQuestionAnalysisAdapter (Unified Vercel AI SDK Adapter)', () => {
  it('formats user answers into context and returns 5 valid QuestionDTOs', async () => {
    const mockGeneratedQuestions = [
      {
        id: 'dyn_milestones',
        order: 20,
        prompt: '¿Cómo se estructuran los hitos de entrega?',
        type: 'open_text' as const,
        isRequired: true,
        helpText: 'Permite definir fechas claras.',
      },
      {
        id: 'dyn_payment_method',
        order: 21,
        prompt: '¿Cuál será la forma de pago acordada?',
        type: 'single_choice' as const,
        isRequired: true,
        helpText: 'Protege contra impagos.',
        options: [
          { id: 'opt_1', label: '50% anticipo, 50% entrega', value: '50_50' },
          { id: 'opt_other', label: 'Otro (especificar)', value: 'other' },
        ],
      },
      {
        id: 'dyn_transport_costs',
        order: 22,
        prompt: '¿Quién asumirá los costos de transporte o fletes?',
        type: 'single_choice' as const,
        isRequired: true,
        helpText: 'Evita sobrecostos ocultos.',
        options: [
          { id: 'opt_client', label: 'Contratante', value: 'client' },
          { id: 'opt_provider', label: 'Proveedor', value: 'provider' },
        ],
      },
      {
        id: 'dyn_confidentiality',
        order: 23,
        prompt: '¿Se requiere cláusula de confidencialidad estricta?',
        type: 'single_choice' as const,
        isRequired: true,
        helpText: 'Protege secretos industriales y datos del cliente.',
        options: [
          { id: 'opt_conf_yes', label: 'Sí, acuerdo estricto con penalidad', value: 'strict' },
          { id: 'opt_conf_no', label: 'No se requiere confidencialidad adicional', value: 'none' },
        ],
      },
      {
        id: 'dyn_warranty_period',
        order: 24,
        prompt: '¿Cuál es el tiempo de garantía técnica del entregable?',
        type: 'open_text' as const,
        isRequired: true,
        helpText: 'Define el soporte posterior a la entrega.',
      },
    ];

    const mockGenerateText = vi.fn().mockResolvedValue({
      output: {
        questions: mockGeneratedQuestions,
      },
    });

    // Creamos el adaptador pasando el mock de generateText y un modelo simulado
    const adapter = new AiQuestionAnalysisAdapter({
      model: {} as any,
      generateTextFn: mockGenerateText as any,
    });

    const result = await adapter.generateQuestions({
      answers: {
        q0_party_role: 'client',
        q1_legal_personality: 'individual',
        q2_description_conditions: 'Transporte de alimentos refrigerados',
        q3_domicile: 'Medellín',
        q4_breach_impact: 'Pérdida de la mercancía perecedera',
        q5_modality: 'recurring',
      },
      stage: 1,
    });

    expect(result.questions).toHaveLength(5);
    expect(result.questions[0].id).toBe('dyn_milestones');
    expect(result.questions[1].type).toBe('single_choice');
    expect(mockGenerateText).toHaveBeenCalledTimes(1);

    const callArgs = mockGenerateText.mock.calls[0][0];
    expect(callArgs.prompt).toContain('Transporte de alimentos refrigerados');
    expect(callArgs.prompt).toContain('Medellín');
  });

  it('throws an error if the AI SDK fails', async () => {
    const mockGenerateText = vi.fn().mockRejectedValue(new Error('AI Provider Quota Exceeded'));

    const adapter = new AiQuestionAnalysisAdapter({
      model: {} as any,
      generateTextFn: mockGenerateText as any,
    });

    await expect(
      adapter.generateQuestions({
        answers: { q2_description_conditions: 'Consultoría' },
      })
    ).rejects.toThrow('AI Provider Quota Exceeded');
  });

  it('throws an error if model is not provided', () => {
    expect(() => new AiQuestionAnalysisAdapter({} as any)).toThrow(
      'AiQuestionAnalysisAdapter requires a valid LanguageModel instance.'
    );
  });
});
