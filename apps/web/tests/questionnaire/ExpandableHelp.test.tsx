import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExpandableHelp } from '../../src/components/questionnaire/ExpandableHelp';

describe('ExpandableHelp Component', () => {
  it('toggles expansion state and accessibility attributes', () => {
    render(
      <ExpandableHelp
        questionId="q1_legal_personality"
        helpText="Determina la capacidad jurídica y el régimen aplicable."
      />
    );

    const toggle = screen.getByRole('button', { name: /¿Por qué te preguntamos esto?/i });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByText('Determina la capacidad jurídica y el régimen aplicable.')).toBeNull();

    // Click to expand
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('Determina la capacidad jurídica y el régimen aplicable.')).toBeDefined();

    // Click to collapse
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByText('Determina la capacidad jurídica y el régimen aplicable.')).toBeNull();
  });
});
