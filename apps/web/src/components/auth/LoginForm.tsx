'use client';

import { es } from '@/locales/es';
import Link from 'next/link';
import type React from 'react';
import { useState } from 'react';
import { AuthSubmitButton } from './AuthSubmitButton';

interface LoginFormProps {
  onSubmit?: (credentials: { email: string; password: string }) => Promise<void> | void;
  redirectUrl?: string;
}

export function LoginForm({ onSubmit, redirectUrl }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isUnconfirmed, setIsUnconfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsUnconfirmed(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setError(es.errors.invalidEmail);
      return;
    }

    if (!password) {
      setError(es.errors.invalidCredentials);
      return;
    }

    setIsLoading(true);

    try {
      if (onSubmit) {
        await onSubmit({ email: email.trim(), password });
      } else {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.code === 'EMAIL_NOT_CONFIRMED') {
            setIsUnconfirmed(true);
          }
          setError(data.message || es.errors.invalidCredentials);
          return;
        }

        const destination = redirectUrl || data.redirectTo || '/dashboard';
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
          <p>{error}</p>
          {isUnconfirmed && (
            <p>
              <Link
                href={`/confirm-email?email=${encodeURIComponent(email.trim())}`}
                className="font-semibold underline hover:text-red-900 focus:outline-none focus:ring-1 focus:ring-red-500 rounded"
              >
                {es.auth.goToConfirmEmail}
              </Link>
            </p>
          )}
        </div>
      )}

      <div>
        <label htmlFor="login-email" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
          {es.auth.emailLabel}
        </label>
        <input
          id="login-email"
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
        <div className="flex justify-between items-center mb-1.5">
          <label htmlFor="login-password" className="block text-xs font-bold uppercase tracking-wider text-gray-700">
            {es.auth.passwordLabel}
          </label>
          <Link
            href="/reset-password"
            className="text-xs font-semibold text-primary hover:text-primary-hover focus:outline-none focus:underline"
          >
            {es.auth.forgotPasswordLink}
          </Link>
        </div>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={es.auth.passwordPlaceholder}
          required
          autoComplete="current-password"
          className="w-full px-3.5 py-2.5 bg-surface-canvas/60 border border-border-strong rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-2xs"
        />
      </div>

      <div className="pt-1">
        <AuthSubmitButton
          isLoading={isLoading}
          loadingText={es.auth.loadingLogin}
          defaultText={es.auth.submitLogin}
        />
      </div>
    </form>
  );
}
