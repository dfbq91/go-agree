import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GoogleAuthButton } from '../../src/components/auth/GoogleAuthButton';
import { LoginForm } from '../../src/components/auth/LoginForm';
import { RegisterForm } from '../../src/components/auth/RegisterForm';
import { ResetPasswordForm } from '../../src/components/auth/ResetPasswordForm';
import { es } from '../../src/locales/es';

describe('Auth Forms (Spanish UI & Accessibility)', () => {
  describe('LoginForm', () => {
    it('should render Spanish labels and accessible inputs', () => {
      render(<LoginForm onSubmit={vi.fn()} />);

      expect(screen.getByLabelText(es.auth.emailLabel)).toBeDefined();
      expect(screen.getByLabelText(es.auth.passwordLabel)).toBeDefined();
      expect(screen.getByRole('button', { name: es.auth.submitLogin })).toBeDefined();
      expect(screen.getByText(es.auth.forgotPasswordLink)).toBeDefined();
    });

    it('should show error when submitting invalid email', async () => {
      render(<LoginForm onSubmit={vi.fn()} />);

      const emailInput = screen.getByLabelText(es.auth.emailLabel);
      fireEvent.change(emailInput, { target: { value: 'not-an-email' } });

      const submitButton = screen.getByRole('button', { name: es.auth.submitLogin });
      fireEvent.click(submitButton);

      const alert = await screen.findByRole('alert');
      expect(alert.textContent).toContain(es.errors.invalidEmail);
    });

    it('should display link to confirm-email when API returns EMAIL_NOT_CONFIRMED', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          code: 'EMAIL_NOT_CONFIRMED',
          message: es.errors.emailNotConfirmed,
        }),
      });

      render(<LoginForm />);

      fireEvent.change(screen.getByLabelText(es.auth.emailLabel), {
        target: { value: 'unconfirmed@example.com' },
      });
      fireEvent.change(screen.getByLabelText(es.auth.passwordLabel), {
        target: { value: 'Password123!' },
      });

      fireEvent.click(screen.getByRole('button', { name: es.auth.submitLogin }));

      const alert = await screen.findByRole('alert');
      expect(alert.textContent).toContain(es.errors.emailNotConfirmed);

      const link = screen.getByRole('link', { name: es.auth.goToConfirmEmail });
      expect(link.getAttribute('href')).toBe('/confirm-email?email=unconfirmed%40example.com');
    });
  });

  describe('RegisterForm', () => {
    it('should render registration form with Spanish copy', () => {
      render(<RegisterForm onSubmit={vi.fn()} />);

      expect(screen.getByLabelText(es.auth.emailLabel)).toBeDefined();
      expect(screen.getByLabelText(es.auth.passwordLabel)).toBeDefined();
      expect(screen.getByRole('button', { name: es.auth.submitRegister })).toBeDefined();
      expect(screen.getByText(es.auth.passwordHint)).toBeDefined();
    });

    it('should show error when password is under 8 characters', async () => {
      render(<RegisterForm onSubmit={vi.fn()} />);

      fireEvent.change(screen.getByLabelText(es.auth.emailLabel), {
        target: { value: 'valid@example.com' },
      });
      fireEvent.change(screen.getByLabelText(es.auth.passwordLabel), {
        target: { value: 'short' },
      });

      fireEvent.click(screen.getByRole('button', { name: es.auth.submitRegister }));

      const alert = await screen.findByRole('alert');
      expect(alert.textContent).toContain(es.errors.weakPassword);
    });

    it('should submit registration and navigate to /confirm-email', async () => {
      const originalLocation = window.location;
      Object.defineProperty(window, 'location', {
        configurable: true,
        writable: true,
        value: { href: '' },
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          user: { id: 'u-1', email: 'valid@example.com' },
          redirectTo: '/confirm-email?email=valid%40example.com',
        }),
      });

      render(<RegisterForm />);

      fireEvent.change(screen.getByLabelText(es.auth.emailLabel), {
        target: { value: 'valid@example.com' },
      });
      fireEvent.change(screen.getByLabelText(es.auth.passwordLabel), {
        target: { value: 'Password123!' },
      });

      fireEvent.click(screen.getByRole('button', { name: es.auth.submitRegister }));

      await waitFor(() => {
        expect(window.location.href).toBe('/confirm-email?email=valid%40example.com');
      });

      Object.defineProperty(window, 'location', {
        configurable: true,
        writable: true,
        value: originalLocation,
      });
    });
  });

  describe('ResetPasswordForm', () => {
    it('should render password reset request form in Spanish', () => {
      render(<ResetPasswordForm onSubmit={vi.fn()} />);

      expect(screen.getByLabelText(es.auth.emailLabel)).toBeDefined();
      expect(screen.getByRole('button', { name: es.auth.submitReset })).toBeDefined();
      expect(screen.getByText(es.auth.backToLogin)).toBeDefined();
    });
  });

  describe('GoogleAuthButton', () => {
    it('should render accessible Google authentication button in Spanish', () => {
      render(<GoogleAuthButton />);

      const button = screen.getByRole('button', { name: es.auth.continueWithGoogle });
      expect(button).toBeDefined();
      expect(button.textContent).toContain(es.auth.continueWithGoogle);
    });
  });
});
