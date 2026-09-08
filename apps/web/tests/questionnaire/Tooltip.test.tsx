import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tooltip } from '../../src/components/questionnaire/Tooltip';

describe('Tooltip Component', () => {
  it('renders trigger and shows tooltip content on hover or focus', () => {
    render(
      <Tooltip content="Explicación legal detallada">
        <button type="button">Info</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button', { name: 'Info' });
    expect(screen.queryByRole('tooltip')).toBeNull();

    fireEvent.mouseEnter(trigger);
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeDefined();
    expect(tooltip.textContent).toContain('Explicación legal detallada');

    fireEvent.mouseLeave(trigger);
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('dismisses tooltip on Escape key press', () => {
    render(
      <Tooltip content="Explicación legal detallada">
        <button type="button">Info</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button', { name: 'Info' });
    fireEvent.focus(trigger);

    expect(screen.getByRole('tooltip')).toBeDefined();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('tooltip')).toBeNull();
  });
});
