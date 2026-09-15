import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NavigationControls } from '../../src/components/questionnaire/NavigationControls';

describe('NavigationControls Component', () => {
  it('does not render Anterior button on the first question', () => {
    render(
      <NavigationControls
        isFirstQuestion={true}
        isLastQuestion={false}
        onNext={vi.fn()}
        onPrevious={vi.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: /Anterior/i })).toBeNull();
    expect(screen.getByRole('button', { name: /Siguiente/i })).toBeDefined();
  });

  it('renders Anterior button on subsequent questions and calls onPrevious when clicked', () => {
    const onPrevious = vi.fn();
    render(
      <NavigationControls
        isFirstQuestion={false}
        isLastQuestion={false}
        onNext={vi.fn()}
        onPrevious={onPrevious}
      />
    );

    const prevButton = screen.getByRole('button', { name: /Anterior/i });
    expect(prevButton).toBeDefined();
    fireEvent.click(prevButton);
    expect(onPrevious).toHaveBeenCalled();
  });

  it('renders review label on the last question', () => {
    render(
      <NavigationControls
        isFirstQuestion={false}
        isLastQuestion={true}
        onNext={vi.fn()}
        onPrevious={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /Revisar respuestas/i })).toBeDefined();
  });

  it('disables buttons when loading', () => {
    render(
      <NavigationControls
        isFirstQuestion={false}
        isLastQuestion={false}
        onNext={vi.fn()}
        onPrevious={vi.fn()}
        isLoading={true}
      />
    );

    const prevButton = screen.getByRole('button', { name: /Anterior/i });
    const nextButton = screen.getByRole('button', { name: /Guardando/i });
    expect((prevButton as HTMLButtonElement).disabled).toBe(true);
    expect((nextButton as HTMLButtonElement).disabled).toBe(true);
  });

  it('renders "Actualizar respuesta" button when isEditingFromSummary is true', () => {
    const onUpdateAnswer = vi.fn();
    render(
      <NavigationControls
        isFirstQuestion={false}
        isLastQuestion={false}
        onNext={vi.fn()}
        onPrevious={vi.fn()}
        isEditingFromSummary={true}
        onUpdateAnswer={onUpdateAnswer}
      />
    );

    const updateBtn = screen.getByRole('button', { name: /Actualizar respuesta/i });
    expect(updateBtn).toBeDefined();

    fireEvent.click(updateBtn);
    expect(onUpdateAnswer).toHaveBeenCalled();
  });
});
