'use client';

import { es } from '@/locales/es';
import type React from 'react';
import { useState } from 'react';
import { AuthSubmitButton } from './AuthSubmitButton';

interface RegisterFormProps {
  onSubmit?: (credentials: { email: string; password: string }) => Promise<void> | void;
  redirectUrl?: string;
}

export function RegisterForm({ onSubmit, redirectUrl }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setError(es.errors.invalidEmail);
      return;
    }

    // Validate password length
    if (!password || password.length < 8) {
      setError(es.errors.weakPassword);
      return;
    }

    setIsLoading(true);

    try {
      if (onSubmit) {
        await onSubmit({ email: email.trim(), password });
      } else {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password, redirect: redirectUrl }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || es.errors.genericError);
          return;
        }

        const fallbackUrl = `/confirm-email?email=${encodeURIComponent(email.trim())}${
          redirectUrl ? `&redirect=${encodeURIComponent(redirectUrl)}` : ''
        }`;
        const destination = data.redirectTo || fallbackUrl;
        window.location.href = destination;
      }
    } catch {
      setError(es.errors.networkError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4" noValidate>
      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="p-3.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl space-y-1.5 shadow-2xs"
        >
          {error}
        </div>
      )}

      <div>
        <label htmlFor="register-email" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
          {es.auth.emailLabel}
        </label>
        <input
          id="register-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={es.auth.emailPlaceholder}
          required
          autoComplete="email"
          className="w-full px-3.5 py-2.5 bg-surface-canvas/60 border border-border-strong rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-2xs"
        />
      </div>

      <div>
        <label htmlFor="register-password" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
          {es.auth.passwordLabel}
        </label>
        <input
          id="register-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={es.auth.passwordPlaceholder}
          required
          minLength={8}
          autoComplete="new-password"
          aria-describedby="password-hint"
          className="w-full px-3.5 py-2.5 bg-surface-canvas/60 border border-border-strong rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-2xs"
        />
        <p id="password-hint" className="text-xs text-gray-500 mt-1.5">
          {es.auth.passwordHint}
        </p>
      </div>

      <div className="pt-1">
        <AuthSubmitButton
          isLoading={isLoading}
          loadingText={es.auth.loadingRegister}
          defaultText={es.auth.submitRegister}
        />
      </div>
    </form>
  );
}
