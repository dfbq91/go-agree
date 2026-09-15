'use client';

import { es } from '@/locales/es';
import Link from 'next/link';
import type React from 'react';
import { useState } from 'react';
import { AuthSubmitButton } from './AuthSubmitButton';

interface ResetPasswordFormProps {
  onSubmit?: (email: string) => Promise<void> | void;
}

export function ResetPasswordForm({ onSubmit }: ResetPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setError(es.errors.invalidEmail);
      return;
    }

    setIsLoading(true);

    try {
      if (onSubmit) {
        await onSubmit(email.trim());
      } else {
        await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim() }),
        });
      }

      setSuccess(es.auth.resetEmailSentSuccess);
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

      {success && (
        <div
          role="status"
          aria-live="polite"
          className="p-3 text-sm text-green-700 bg-green-100 border border-green-300 rounded-md"
        >
          {success}
        </div>
      )}

      <div>
        <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">
          {es.auth.emailLabel}
        </label>
        <input
          id="reset-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={es.auth.emailPlaceholder}
          required
          autoComplete="email"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <AuthSubmitButton
        isLoading={isLoading}
        loadingText={es.auth.loadingReset}
        defaultText={es.auth.submitReset}
      />

      <div className="text-center mt-4">
        <Link
          href="/login"
          className="text-sm text-primary-600 hover:text-primary-700 focus:outline-none focus:underline"
        >
          {es.auth.backToLogin}
        </Link>
      </div>
    </form>
  );
}
