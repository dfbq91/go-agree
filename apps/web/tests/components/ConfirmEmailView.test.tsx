import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmEmailView } from '../../src/components/auth/ConfirmEmailView';
import { es } from '../../src/locales/es';

describe('ConfirmEmailView Component', () => {
  it('renders confirmation view with email and instructions in Spanish', () => {
    render(<ConfirmEmailView email="test@example.com" />);

    expect(screen.getByRole('heading', { level: 1, name: es.auth.confirmEmailTitle })).toBeDefined();
    expect(screen.getByText(es.auth.confirmEmailSubtitle)).toBeDefined();
    expect(screen.getByText('test@example.com')).toBeDefined();
    expect(screen.getByText(es.auth.confirmEmailInstructions('test@example.com'))).toBeDefined();
    expect(screen.getByText(es.auth.confirmEmailSpamNotice)).toBeDefined();
    expect(screen.getByRole('button', { name: es.auth.resendEmailButton })).toBeDefined();
    expect(screen.getByRole('link', { name: es.auth.backToLogin })).toBeDefined();
    expect(screen.getByRole('link', { name: es.auth.backToRegister })).toBeDefined();
  });

  it('renders email input if initial email is not provided', () => {
    render(<ConfirmEmailView />);

    expect(screen.getByLabelText(es.auth.emailLabel)).toBeDefined();
    expect(screen.getByPlaceholderText(es.auth.emailPlaceholder)).toBeDefined();
  });

  it('triggers onResend callback and starts cooldown countdown', async () => {
    const onResend = vi.fn().mockResolvedValue(undefined);
    render(<ConfirmEmailView email="test@example.com" onResend={onResend} />);

    const button = screen.getByRole('button', { name: es.auth.resendEmailButton });
    fireEvent.click(button);

    await waitFor(() => {
      expect(onResend).toHaveBeenCalledWith('test@example.com');
    });

    const statusMessage = await screen.findByRole('status');
    expect(statusMessage.textContent).toContain(es.auth.resendEmailSuccess);

    // Button should now be disabled and show cooldown text
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(button.textContent).toContain('Reenviar en');
  });

  it('validates email format before triggering resend when input is manually entered', async () => {
    const onResend = vi.fn();
    render(<ConfirmEmailView onResend={onResend} />);

    const input = screen.getByLabelText(es.auth.emailLabel);
    fireEvent.change(input, { target: { value: 'invalid-email' } });

    const button = screen.getByRole('button', { name: es.auth.resendEmailButton });
    fireEvent.click(button);

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain(es.errors.invalidEmail);
    expect(onResend).not.toHaveBeenCalled();
  });

  it('preserves redirect param in login link', () => {
    render(<ConfirmEmailView email="test@example.com" redirectUrl="/questionnaire" />);

    const loginLink = screen.getByRole('link', { name: es.auth.backToLogin });
    expect(loginLink.getAttribute('href')).toBe('/login?redirect=%2Fquestionnaire');
  });
});
