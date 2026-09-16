import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ClickToEditTitle } from '../../src/components/dashboard/ClickToEditTitle';
import { es } from '../../src/locales/es';

describe('ClickToEditTitle Component (User Story 5)', () => {
  it('renders initial title and edit button with accessible label', () => {
    render(
      <ClickToEditTitle
        contractId="c-title-1"
        initialTitle="Mi Contrato de Servicios"
        resumeUrl="/questionnaire?id=c-title-1"
      />
    );

    expect(screen.getByText('Mi Contrato de Servicios')).toBeDefined();
    const editBtn = screen.getByRole('button', { name: es.dashboard.rename.ariaLabel });
    expect(editBtn).toBeDefined();
  });

  it('switches to input mode on clicking edit and auto-saves on Enter', async () => {
    const handleSave = vi.fn().mockResolvedValue(undefined);
    render(
      <ClickToEditTitle contractId="c-title-2" initialTitle="Título Inicial" onSave={handleSave} />
    );

    const editBtn = screen.getByRole('button', { name: es.dashboard.rename.ariaLabel });
    fireEvent.click(editBtn);

    const input = screen.getByRole('textbox');
    expect(input).toBeDefined();
    expect((input as HTMLInputElement).value).toBe('Título Inicial');

    // Change title and press Enter
    fireEvent.change(input, { target: { value: 'Nuevo Título Modificado' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(handleSave).toHaveBeenCalledWith('Nuevo Título Modificado');
    });
    expect(screen.getByText('Nuevo Título Modificado')).toBeDefined();
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('auto-saves on blur', async () => {
    const handleSave = vi.fn().mockResolvedValue(undefined);
    render(
      <ClickToEditTitle contractId="c-title-3" initialTitle="Título Original" onSave={handleSave} />
    );

    fireEvent.click(screen.getByRole('button', { name: es.dashboard.rename.ariaLabel }));
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: 'Título Guardado al Salir' } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(handleSave).toHaveBeenCalledWith('Título Guardado al Salir');
    });
    expect(screen.getByText('Título Guardado al Salir')).toBeDefined();
  });

  it('cancels editing on Escape without calling onSave and reverts title', () => {
    const handleSave = vi.fn();
    render(
      <ClickToEditTitle contractId="c-title-4" initialTitle="Título Firme" onSave={handleSave} />
    );

    fireEvent.click(screen.getByRole('button', { name: es.dashboard.rename.ariaLabel }));
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: 'Título Cancelado' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(handleSave).not.toHaveBeenCalled();
    expect(screen.getByText('Título Firme')).toBeDefined();
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('rejects empty or whitespace-only title with validation error', async () => {
    const handleSave = vi.fn();
    render(
      <ClickToEditTitle contractId="c-title-5" initialTitle="Título Válido" onSave={handleSave} />
    );

    fireEvent.click(screen.getByRole('button', { name: es.dashboard.rename.ariaLabel }));
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(handleSave).not.toHaveBeenCalled();
    expect(screen.getByText(es.dashboard.rename.emptyError)).toBeDefined();
    expect(screen.getByText('Título Válido')).toBeDefined();
  });
});
