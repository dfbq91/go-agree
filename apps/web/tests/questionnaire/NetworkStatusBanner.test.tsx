import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { NetworkStatusBanner } from '../../src/components/questionnaire/NetworkStatusBanner';
import { es } from '../../src/locales/es';

describe('NetworkStatusBanner Component', () => {
  it('does not render when online and hasError is false', () => {
    const { container } = render(<NetworkStatusBanner hasError={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders Spanish warning banner when hasError is true', () => {
    render(<NetworkStatusBanner hasError={true} />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeDefined();
    expect(alert.textContent).toContain(es.questionnaire.saveError);
  });

  it('renders retry button and calls onRetry when clicked', () => {
    const onRetry = vi.fn();
    render(<NetworkStatusBanner hasError={true} onRetry={onRetry} />);

    const retryBtn = screen.getByRole('button', { name: /Reintentar/i });
    expect(retryBtn).toBeDefined();

    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('displays retrying state when isRetrying is true', () => {
    render(<NetworkStatusBanner hasError={true} onRetry={vi.fn()} isRetrying={true} />);

    const retryBtn = screen.getByRole('button', { name: /Reintentando.../i });
    expect(retryBtn).toBeDefined();
    expect(retryBtn.hasAttribute('disabled')).toBe(true);
  });

  it('renders when offline window event fires and hides when online window event fires', () => {
    const { container } = render(<NetworkStatusBanner />);
    expect(container.firstChild).toBeNull();

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(screen.getByRole('alert')).toBeDefined();

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(container.firstChild).toBeNull();
  });
});
