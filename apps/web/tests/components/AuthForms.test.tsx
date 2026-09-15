import { fireEvent, render, screen } from '@testing-library/react';
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
