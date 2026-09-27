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
          className="p-3.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl shadow-2xs"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          aria-live="polite"
          className="p-3.5 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl shadow-2xs"
        >
          {success}
        </div>
      )}

      <div>
        <label htmlFor="reset-email" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
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
          className="w-full px-3.5 py-2.5 bg-surface-canvas/60 border border-border-strong rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-2xs"
        />
      </div>

      <div className="pt-1">
        <AuthSubmitButton
          isLoading={isLoading}
          loadingText={es.auth.loadingReset}
          defaultText={es.auth.submitReset}
        />
      </div>

      <div className="text-center pt-2">
        <Link
          href="/login"
          className="text-sm font-semibold text-primary hover:text-primary-hover hover:underline focus:outline-none focus:ring-1 focus:ring-primary rounded"
        >
          {es.auth.backToLogin}
        </Link>
      </div>
    </form>
  );
}
