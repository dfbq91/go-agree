import type { QuestionDTO } from '@go-agree/application';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { QuestionRenderer } from '../../src/components/questionnaire/QuestionRenderer';
import { MultipleChoiceQuestion } from '../../src/components/questionnaire/types/MultipleChoiceQuestion';
import { OpenTextQuestion } from '../../src/components/questionnaire/types/OpenTextQuestion';
import { SingleChoiceQuestion } from '../../src/components/questionnaire/types/SingleChoiceQuestion';

describe('Polymorphic Question Renderers', () => {
  it('renders OpenTextQuestion with character counter and triggers onChange', () => {
    const onChange = vi.fn();
    render(<OpenTextQuestion id="q0" value="Texto inicial" onChange={onChange} maxLength={2000} />);

    const textarea = screen.getByRole('textbox');
    expect((textarea as HTMLTextAreaElement).value).toBe('Texto inicial');
    expect(screen.getByText(/caracteres/i)).toBeDefined();

    fireEvent.change(textarea, { target: { value: 'Nuevo texto' } });
    expect(onChange).toHaveBeenCalledWith('Nuevo texto');
  });

  it('renders SingleChoiceQuestion and triggers onChange', () => {
    const onChange = vi.fn();
    const options = [
      { id: '1', label: 'Opción A', value: 'opt_a' },
      { id: '2', label: 'Opción B', value: 'opt_b' },
    ];

    render(<SingleChoiceQuestion id="q1" value="opt_a" options={options} onChange={onChange} />);

    const radioB = screen.getByLabelText('Opción B');
    fireEvent.click(radioB);
    expect(onChange).toHaveBeenCalledWith('opt_b');
  });

  it('renders MultipleChoiceQuestion and enforces mutually exclusive not_applicable', () => {
    const onChange = vi.fn();
    const options = [
      { id: '1', label: 'Empleará personal', value: 'employs_people' },
      { id: '2', label: 'Utilizará vehículos', value: 'uses_vehicles' },
      { id: '3', label: 'No aplica', value: 'not_applicable' },
    ];

    // Case 1: Selecting not_applicable clears other selections
    const { rerender } = render(
      <MultipleChoiceQuestion
        id="q5"
        value={['employs_people']}
        options={options}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByLabelText('No aplica'));
    expect(onChange).toHaveBeenCalledWith(['not_applicable']);

    // Case 2: Selecting regular option clears not_applicable
    rerender(
      <MultipleChoiceQuestion
        id="q5"
        value={['not_applicable']}
        options={options}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByLabelText('Empleará personal'));
    expect(onChange).toHaveBeenCalledWith(['employs_people']);
  });

  it('dispatches polymorphic rendering through QuestionRenderer', () => {
    const question: QuestionDTO = {
      id: 'q0_test',
      order: 0,
      prompt: 'Describe tu necesidad',
      type: 'open_text',
      isRequired: true,
    };

    render(<QuestionRenderer question={question} value="Valor prueba" onChange={vi.fn()} />);

    expect(screen.getByRole('textbox')).toBeDefined();
  });

  it('renders custom specification input when selecting option with "other" or "especificar"', () => {
    const onChange = vi.fn();
    const options = [
      { id: '1', label: '30 días calendario', value: 'days_30' },
      { id: '2', label: 'Otro plazo a especificar', value: 'other' },
    ];

    // Initially not selected
    const { rerender } = render(
      <SingleChoiceQuestion id="q8" value="days_30" options={options} onChange={onChange} />
    );

    expect(screen.queryByPlaceholderText(/Escribe el valor específico aquí/i)).toBeNull();

    // Select "other"
    const radioOther = screen.getByLabelText('Otro plazo a especificar');
    fireEvent.click(radioOther);
    expect(onChange).toHaveBeenCalledWith({ selection: 'other', customValue: '' });

    // When value has other selected, input should be rendered
    rerender(
      <SingleChoiceQuestion
        id="q8"
        value={{ selection: 'other', customValue: '45 días' }}
        options={options}
        onChange={onChange}
      />
    );

    const customInput = screen.getByPlaceholderText(/Escribe el valor específico aquí/i);
    expect(customInput).toBeDefined();
    expect((customInput as HTMLInputElement).value).toBe('45 días');

    fireEvent.change(customInput, { target: { value: '60 días hábiles' } });
    expect(onChange).toHaveBeenCalledWith({ selection: 'other', customValue: '60 días hábiles' });
  });

  it('renders custom specification input in MultipleChoiceQuestion when selecting option with "other" or "especificar"', () => {
    const onChange = vi.fn();
    const options = [
      { id: '1', label: 'Personal propio', value: 'staff' },
      { id: '2', label: 'Otro recurso a especificar', value: 'other' },
    ];

    const { rerender } = render(
      <MultipleChoiceQuestion id="q5_custom" value={[]} options={options} onChange={onChange} />
    );

    expect(screen.queryByPlaceholderText(/Escribe el valor específico aquí/i)).toBeNull();

    // Check "other"
    const checkOther = screen.getByLabelText('Otro recurso a especificar');
    fireEvent.click(checkOther);
    expect(onChange).toHaveBeenCalledWith([{ selection: 'other', customValue: '' }]);

    // Rerender with custom selected
    rerender(
      <MultipleChoiceQuestion
        id="q5_custom"
        value={[{ selection: 'other', customValue: 'Maquinaria pesada' }]}
        options={options}
        onChange={onChange}
      />
    );

    const input = screen.getByPlaceholderText(/Escribe el valor específico aquí/i);
    expect(input).toBeDefined();
    expect((input as HTMLInputElement).value).toBe('Maquinaria pesada');

    fireEvent.change(input, { target: { value: 'Drones' } });
    expect(onChange).toHaveBeenCalledWith([{ selection: 'other', customValue: 'Drones' }]);
  });
});
