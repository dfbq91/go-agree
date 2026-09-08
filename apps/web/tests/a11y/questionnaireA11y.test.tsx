import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import axe from 'axe-core';
import type { QuestionDTO } from '@go-agree/application';
import { QuestionCard } from '../../src/components/questionnaire/QuestionCard';
import { NavigationControls } from '../../src/components/questionnaire/NavigationControls';
import { SummaryReview } from '../../src/components/questionnaire/SummaryReview';
import { InlineTitleEditor } from '../../src/components/questionnaire/InlineTitleEditor';
import { QuestionnaireHeader } from '../../src/components/questionnaire/QuestionnaireHeader';
import { NetworkStatusBanner } from '../../src/components/questionnaire/NetworkStatusBanner';
import { QuestionnaireContainer } from '../../src/components/questionnaire/QuestionnaireContainer';

describe('Questionnaire WCAG 2.1 AA Accessibility Audit (axe-core)', () => {
  const axeOptions: axe.RunOptions = {
    rules: {
      // happy-dom / jsdom does not calculate CSS render trees for contrast
      'color-contrast': { enabled: false },
    },
  };

  const mockOpenTextQuestion: QuestionDTO = {
    id: 'q0_description',
    order: 0,
    prompt: 'Describe el bien o servicio que necesitas',
    type: 'open_text',
    isRequired: true,
    helpText: 'Esta descripción inicial nos permite identificar la naturaleza.',
  };

  const mockSingleChoiceQuestion: QuestionDTO = {
    id: 'q1_legal_personality',
    order: 1,
    prompt: '¿Eres persona natural o persona jurídica?',
    type: 'single_choice',
    isRequired: true,
    helpText: 'Determina las capacidades legales de la parte.',
    options: [
      { id: 'opt_1', label: 'Persona natural', value: 'individual', tooltip: 'Individuo humano actuando por cuenta propia.' },
      { id: 'opt_2', label: 'Persona jurídica', value: 'legal_entity', tooltip: 'Empresa, sociedad o entidad constituida legalmente.' },
    ],
  };

  const mockMultipleChoiceQuestion: QuestionDTO = {
    id: 'q5_service_profile',
    order: 6,
    prompt: '¿El servicio involucra personal asignado, vehículos o uso de instalaciones del cliente?',
    type: 'multiple_choice',
    isRequired: true,
    helpText: 'Ayuda a determinar riesgos laborales y de seguridad.',
    options: [
      { id: 'opt_staff', label: 'Personal asignado', value: 'staff' },
      { id: 'opt_vehicles', label: 'Vehículos de transporte', value: 'vehicles' },
      { id: 'opt_facilities', label: 'Uso de instalaciones del cliente', value: 'facilities' },
      { id: 'opt_none', label: 'No aplica ninguna de las anteriores', value: 'not_applicable' },
    ],
  };

  const mockCheckboxQuestion: QuestionDTO = {
    id: 'q10_penalty_clause',
    order: 12,
    prompt: '¿Deseas incluir una cláusula penal por incumplimiento?',
    type: 'checkbox',
    isRequired: false,
    helpText: 'Establece una sanción económica directa en caso de incumplimiento.',
  };

  it('QuestionCard with OpenTextQuestion passes accessibility audit', async () => {
    const { container } = render(
      <QuestionCard
        question={mockOpenTextQuestion}
        value="Servicio de asesoría contable"
        onChange={vi.fn()}
      />
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it('QuestionCard with SingleChoiceQuestion and Tooltips passes accessibility audit', async () => {
    const { container } = render(
      <QuestionCard
        question={mockSingleChoiceQuestion}
        value="individual"
        onChange={vi.fn()}
      />
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it('QuestionCard with MultipleChoiceQuestion passes accessibility audit', async () => {
    const { container } = render(
      <QuestionCard
        question={mockMultipleChoiceQuestion}
        value={['staff']}
        onChange={vi.fn()}
      />
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it('QuestionCard with CheckboxQuestion passes accessibility audit', async () => {
    const { container } = render(
      <QuestionCard
        question={mockCheckboxQuestion}
        value={true}
        onChange={vi.fn()}
      />
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it('QuestionCard with validation error alert passes accessibility audit', async () => {
    const { container } = render(
      <QuestionCard
        question={mockOpenTextQuestion}
        value=""
        onChange={vi.fn()}
        error="Este campo es requerido."
      />
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it('NavigationControls passes accessibility audit', async () => {
    const { container } = render(
      <NavigationControls
        isFirstQuestion={false}
        isLastQuestion={false}
        onNext={vi.fn()}
        onPrevious={vi.fn()}
      />
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it('InlineTitleEditor passes accessibility audit', async () => {
    const { container } = render(
      <InlineTitleEditor initialTitle="Mi Contrato 1" onSave={vi.fn()} />
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it('QuestionnaireHeader passes accessibility audit', async () => {
    const { container } = render(
      <QuestionnaireHeader
        title="Mi Contrato 1"
        saveStatus="saved"
        onSaveTitle={vi.fn()}
      />
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it('NetworkStatusBanner passes accessibility audit in active error state', async () => {
    const { container } = render(
      <NetworkStatusBanner hasError={true} onRetry={vi.fn()} />
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it('SummaryReview screen passes accessibility audit', async () => {
    const { container } = render(
      <SummaryReview
        questions={[mockOpenTextQuestion, mockSingleChoiceQuestion]}
        answers={{
          q0_description: 'Servicio de desarrollo de software',
          q1_legal_personality: 'individual',
        }}
        onEdit={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it('QuestionnaireContainer initial state passes accessibility audit', async () => {
    const { container } = render(
      <QuestionnaireContainer
        contractId="test-contract-id"
        initialTitle="Mi Contrato 1"
      />
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });
});
