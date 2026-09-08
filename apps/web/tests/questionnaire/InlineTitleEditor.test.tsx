import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { InlineTitleEditor } from '../../src/components/questionnaire/InlineTitleEditor';

describe('InlineTitleEditor Component', () => {
  it('renders title with edit control and switches to input on click', () => {
    render(<InlineTitleEditor initialTitle="Mi Contrato 1" onSave={vi.fn()} />);

    expect(screen.getByText('Mi Contrato 1')).toBeDefined();
    const editBtn = screen.getByRole('button', { name: /Editar título/i });
    fireEvent.click(editBtn);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input).toBeDefined();
    expect(input.value).toBe('Mi Contrato 1');
  });

  it('saves new title on Enter key', () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<InlineTitleEditor initialTitle="Mi Contrato 1" onSave={onSave} />);

    fireEvent.click(screen.getByRole('button', { name: /Editar título/i }));
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Contrato de Arriendo' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onSave).toHaveBeenCalledWith('Contrato de Arriendo');
    expect(screen.getByText('Contrato de Arriendo')).toBeDefined();
  });

  it('reverts to previous title when blank string is entered', () => {
    const onSave = vi.fn();
    render(<InlineTitleEditor initialTitle="Mi Contrato 1" onSave={onSave} />);

    fireEvent.click(screen.getByRole('button', { name: /Editar título/i }));
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '    ' } });
    fireEvent.blur(input);

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText('Mi Contrato 1')).toBeDefined();
  });
});
