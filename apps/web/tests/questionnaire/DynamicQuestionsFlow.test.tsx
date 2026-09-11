import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { QuestionnaireContainer } from '../../src/components/questionnaire/QuestionnaireContainer';
import type { QuestionDTO } from '@go-agree/application';

describe('Dynamic Questions Flow Integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('hydrates initialDynamicQuestions on render and displays in summary', () => {
    const dynamicQuestions: QuestionDTO[] = [
      {
        id: 'dyn_test_question',
        order: 25,
        prompt: '¿Cuáles son los hitos de entrega del software?',
        type: 'open_text',
        isRequired: true,
        helpText: 'Necesario para definir cronograma',
      },
    ];

    render(
      <QuestionnaireContainer
        contractId="contract-test-123"
        initialTitle="Mi Contrato"
        initialIsReviewing={true}
        initialDynamicQuestions={dynamicQuestions}
      />
    );

    expect(
      screen.getByText('¿Cuáles son los hitos de entrega del software?')
    ).toBeDefined();
  });

  it('appends dynamic questions returned by /api/contracts/[id]/analyze to the questionnaire', async () => {
    const onSaveProgress = vi.fn().mockResolvedValue(undefined);

    // Mock fetch for /api/contracts/contract-test-123/analyze
    const mockDynamicQuestionsResponse = {
      status: 'generated',
      questions: [
        {
          id: 'uuid-db-1',
          questionKey: 'dyn_milestone_payments',
          orderIndex: 20,
          prompt: '¿Cómo se realizarán los pagos de los entregables?',
          type: 'open_text',
          isRequired: true,
          helpText: 'Blindaje financiero',
        },
      ],
    };

    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/analyze')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockDynamicQuestionsResponse),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });
    });

    const answers: Record<string, unknown> = {
      q0_party_role: 'client',
      q1_legal_personality: 'natural',
      q2_description_conditions: 'Desarrollo de software a la medida',
      q3_domicile: 'Bogotá',
      q4_breach_impact: 'Pérdida operativa',
      q5_modality: 'one_time',
      q5a_delivery_timeframe: '30 días',
      q6_service_profile: ['not_applicable'],
      q8_termination_notice: '30 días',
      q9_renewal: 'fixed_term',
      q10_additional_termination: 'Ninguna adicional',
      q11_dispute_resolution: 'ordinary_courts',
    };

    render(
      <QuestionnaireContainer
        contractId="contract-test-123"
        initialTitle="Mi Contrato"
        initialQuestionIndex={5} // q5_modality
        initialAnswers={answers}
        onSaveProgress={onSaveProgress}
      />
    );

    // Answer q5_modality by clicking Siguiente
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));
    });

    // Wait for the background analyze fetch to resolve and React state to update
    await act(async () => {
      await Promise.resolve();
    });

    // Verify analyze fetch was called
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/contracts/contract-test-123/analyze',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ stage: 1 }),
      })
    );

    // Click Siguiente through the remaining standard questions (q5a, q6, q8, q9, q10, q11)
    for (let i = 0; i < 6; i++) {
      await act(async () => {
        const nextBtn = screen.getByRole('button', { name: /Siguiente/i });
        fireEvent.click(nextBtn);
      });
    }

    // Now the active question MUST be the dynamic question
    expect(
      screen.getByText('¿Cómo se realizarán los pagos de los entregables?')
    ).toBeDefined();
  });
});
