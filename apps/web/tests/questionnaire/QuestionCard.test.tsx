import type { QuestionDTO } from '@go-agree/application';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { QuestionCard } from '../../src/components/questionnaire/QuestionCard';

describe('QuestionCard Component', () => {
  const mockOpenTextQuestion: QuestionDTO = {
    id: 'q0_description',
    order: 0,
    prompt: 'Describe el bien o servicio que necesitas',
    type: 'open_text',
    isRequired: true,
    helpText: 'Esta descripción inicial nos permite identificar la naturaleza.',
  };

  const mockChoiceQuestion: QuestionDTO = {
    id: 'q1_legal_personality',
    order: 1,
    prompt: '¿Eres persona natural o persona jurídica?',
    type: 'single_choice',
    isRequired: true,
    options: [
      { id: 'opt_1', label: 'Persona natural', value: 'individual' },
      { id: 'opt_2', label: 'Persona jurídica', value: 'legal_entity' },
    ],
  };

  it('renders open text question prompt and textarea with character count', () => {
    const onChange = vi.fn();
    render(
      <QuestionCard
        question={mockOpenTextQuestion}
        value="Servicio de consultoría"
        onChange={onChange}
      />
    );

    expect(screen.getByText('Describe el bien o servicio que necesitas')).toBeDefined();
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.value).toBe('Servicio de consultoría');
    expect(screen.getByText(/caracteres/i)).toBeDefined();
  });

  it('renders single choice question options and calls onChange upon selection', () => {
    const onChange = vi.fn();
    render(<QuestionCard question={mockChoiceQuestion} value="" onChange={onChange} />);

    expect(
      screen.getByRole('heading', { name: '¿Eres persona natural o persona jurídica?' })
    ).toBeDefined();
    expect(screen.getByText('Persona natural')).toBeDefined();
    expect(screen.getByText('Persona jurídica')).toBeDefined();

    fireEvent.click(screen.getByLabelText('Persona natural'));
    expect(onChange).toHaveBeenCalledWith('individual');
  });

  it('renders inline error message with role="alert"', () => {
    render(
      <QuestionCard
        question={mockOpenTextQuestion}
        value=""
        onChange={vi.fn()}
        error="Este campo es requerido."
      />
    );

    const alert = screen.getByRole('alert');
    expect(alert).toBeDefined();
    expect(alert.textContent).toContain('Este campo es requerido.');
  });

  it('programmatically shifts focus to question heading on mount or question transition', () => {
    const { rerender } = render(
      <QuestionCard question={mockOpenTextQuestion} value="" onChange={vi.fn()} />
    );

    const heading = screen.getByRole('heading', {
      name: 'Describe el bien o servicio que necesitas',
    });
    expect(document.activeElement).toBe(heading);

    rerender(<QuestionCard question={mockChoiceQuestion} value="" onChange={vi.fn()} />);

    const nextHeading = screen.getByRole('heading', {
      name: '¿Eres persona natural o persona jurídica?',
    });
    expect(document.activeElement).toBe(nextHeading);
  });

  it('renders QuestionGuidance panel when question has guidance in dictionary', () => {
    const mockGuidanceQuestion: QuestionDTO = {
      id: 'q2_description_conditions',
      order: 2,
      prompt: 'Describe el bien o servicio que necesitas y en qué condiciones lo requieres',
      type: 'open_text',
      isRequired: true,
    };

    render(<QuestionCard question={mockGuidanceQuestion} value="" onChange={vi.fn()} />);

    expect(screen.getByText('Recomendaciones para describir el bien o servicio')).toBeDefined();
    expect(screen.getByText(/Esta descripción es fundamental porque se enviará como prompt/i)).toBeDefined();
    expect(screen.getByText('Detalla el objeto')).toBeDefined();
    expect(screen.getByText('Condiciones de entrega y plazos')).toBeDefined();
    expect(screen.getByText('Criterios de calidad y aceptación')).toBeDefined();
  });

  it('allows clicking an example in QuestionGuidance and using it as template', () => {
    const onChange = vi.fn();
    const mockGuidanceQuestion: QuestionDTO = {
      id: 'q2_description_conditions',
      order: 2,
      prompt: 'Describe el bien o servicio que necesitas y en qué condiciones lo requieres',
      type: 'open_text',
      isRequired: true,
    };

    render(<QuestionCard question={mockGuidanceQuestion} value="" onChange={onChange} />);

    // Click on example pill
    const exampleButton = screen.getByRole('button', { name: /Ejemplo de Servicio/i });
    fireEvent.click(exampleButton);

    // Example content should be visible
    expect(screen.getByText(/Contratación de servicios de desarrollo de software/i)).toBeDefined();

    // Click "Usar como plantilla"
    const useTemplateButton = screen.getByRole('button', { name: /Usar como plantilla/i });
    fireEvent.click(useTemplateButton);

    expect(onChange).toHaveBeenCalledWith(
      expect.stringContaining('Contratación de servicios de desarrollo de software')
    );
  });

  it('renders contractor notice alert when contractor role is selected', () => {
    const mockPartyRoleQuestion: QuestionDTO = {
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

    const { rerender } = render(
      <QuestionCard question={mockPartyRoleQuestion} value="client" onChange={vi.fn()} />
    );

    expect(screen.queryByText('Flujo para contratistas en desarrollo')).toBeNull();

    rerender(
      <QuestionCard question={mockPartyRoleQuestion} value="contractor" onChange={vi.fn()} />
    );

    expect(screen.getByText('Flujo para contratistas en desarrollo')).toBeDefined();
    expect(
      screen.getByText(
        /Actualmente la generación de contratos está habilitada únicamente para la parte contratante/i
      )
    ).toBeDefined();
  });
});
