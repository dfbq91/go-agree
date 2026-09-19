import type { QuestionDTO } from '@go-agree/application';
import { render } from '@testing-library/react';
import axe from 'axe-core';
import { describe, expect, it, vi } from 'vitest';
import { InlineTitleEditor } from '../../src/components/questionnaire/InlineTitleEditor';
import { NavigationControls } from '../../src/components/questionnaire/NavigationControls';
import { NetworkStatusBanner } from '../../src/components/questionnaire/NetworkStatusBanner';
import { QuestionCard } from '../../src/components/questionnaire/QuestionCard';
import { QuestionnaireContainer } from '../../src/components/questionnaire/QuestionnaireContainer';
import { QuestionnaireHeader } from '../../src/components/questionnaire/QuestionnaireHeader';
import { SummaryReview } from '../../src/components/questionnaire/SummaryReview';

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
      {
        id: 'opt_1',
        label: 'Persona natural',
        value: 'individual',
        tooltip: 'Individuo humano actuando por cuenta propia.',
      },
      {
        id: 'opt_2',
        label: 'Persona jurídica',
        value: 'legal_entity',
        tooltip: 'Empresa, sociedad o entidad constituida legalmente.',
      },
    ],
  };

  const mockMultipleChoiceQuestion: QuestionDTO = {
    id: 'q5_service_profile',
    order: 6,
    prompt:
      '¿El servicio involucra personal asignado, vehículos o uso de instalaciones del cliente?',
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
      <QuestionCard question={mockSingleChoiceQuestion} value="individual" onChange={vi.fn()} />
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it('QuestionCard with MultipleChoiceQuestion passes accessibility audit', async () => {
    const { container } = render(
      <QuestionCard question={mockMultipleChoiceQuestion} value={['staff']} onChange={vi.fn()} />
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
      <QuestionnaireHeader title="Mi Contrato 1" saveStatus="saved" onSaveTitle={vi.fn()} />
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it('NetworkStatusBanner passes accessibility audit in active error state', async () => {
    const { container } = render(<NetworkStatusBanner hasError={true} onRetry={vi.fn()} />);
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

  it('QuestionCard with QuestionGuidance passes accessibility audit', async () => {
    const mockGuidanceQuestion: QuestionDTO = {
      id: 'q2_description_conditions',
      order: 2,
      prompt: 'Describe el bien o servicio que necesitas y en qué condiciones lo requieres',
      type: 'open_text',
      isRequired: true,
    };
    const { container } = render(
      <QuestionCard
        question={mockGuidanceQuestion}
        value="Servicio de desarrollo"
        onChange={vi.fn()}
      />
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it('QuestionCard with contractor alert notice passes accessibility audit', async () => {
    const mockRoleQuestion: QuestionDTO = {
      id: 'q0_party_role',
      order: 0,
      prompt: 'Indica si eres contratante o contratista',
      type: 'single_choice',
      isRequired: true,
      options: [
        { id: 'opt_1', label: 'Contratante', value: 'client' },
        { id: 'opt_2', label: 'Contratista', value: 'contractor' },
      ],
    };
    const { container } = render(
      <QuestionCard question={mockRoleQuestion} value="contractor" onChange={vi.fn()} />
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it('QuestionnaireContainer initial state passes accessibility audit', async () => {
    const { container } = render(
      <QuestionnaireContainer contractId="test-contract-id" initialTitle="Mi Contrato 1" />
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });
});
