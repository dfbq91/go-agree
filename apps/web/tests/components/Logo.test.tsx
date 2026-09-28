import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Logo } from '../../src/components/ui/Logo';
import { es } from '../../src/locales/es';

describe('Logo Component', () => {
  it('renders default full logo with accessible text and title', () => {
    const { container } = render(<Logo />);

    expect(screen.getByText(es.brand.name)).toBeDefined();
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 352 92');

    const textElements = container.querySelectorAll('text');
    expect(textElements.length).toBe(2);
    expect(textElements[0].textContent).toBe('goagree');
    expect(textElements[1].textContent).toBe('SMART AGREEMENT INTELLIGENCE');
  });

  it('renders dark variant with white text fill', () => {
    const { container } = render(<Logo variant="dark" />);

    const textElements = container.querySelectorAll('text');
    expect(textElements[0].getAttribute('fill')).toBe('#FFFFFF');
  });

  it('renders iconOnly mode with compact viewBox', () => {
    const { container } = render(<Logo iconOnly />);

    expect(screen.getByText(es.brand.name)).toBeDefined();
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 88 88');
    const textElements = container.querySelectorAll('text');
    expect(textElements.length).toBe(0);
  });

  it('applies custom className to the SVG element', () => {
    const { container } = render(<Logo className="h-12 w-auto custom-class" />);

    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('class')).toContain('h-12');
    expect(svg?.getAttribute('class')).toContain('custom-class');
  });
});
