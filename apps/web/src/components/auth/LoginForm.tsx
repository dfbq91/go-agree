'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { es } from '@/locales/es';
import { AuthSubmitButton } from './AuthSubmitButton';

interface LoginFormProps {
  onSubmit?: (credentials: { email: string; password: string }) => Promise<void> | void;
  redirectUrl?: string;
}

export function LoginForm({ onSubmit, redirectUrl }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
          className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md"
        >
          {error}
        </div>
      )}

      <div>
        <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">
            {es.auth.passwordLabel}
          </label>
          <Link
            href="/reset-password"
            className="text-xs text-primary-600 hover:text-primary-700 focus:outline-none focus:underline"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <AuthSubmitButton
        isLoading={isLoading}
        loadingText={es.auth.loadingLogin}
        defaultText={es.auth.submitLogin}
      />
    </form>
  );
}
