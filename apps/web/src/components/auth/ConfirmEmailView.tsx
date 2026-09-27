'use client';

import { es } from '@/locales/es';
import Link from 'next/link';
import type React from 'react';
import { useEffect, useState } from 'react';

interface ConfirmEmailViewProps {
  email?: string;
  redirectUrl?: string;
  onResend?: (email: string) => Promise<void> | void;
}

export function ConfirmEmailView({ email: initialEmail = '', redirectUrl, onResend }: ConfirmEmailViewProps) {
  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0 || isLoading) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    const targetEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!targetEmail || !emailRegex.test(targetEmail)) {
      setErrorMessage(es.errors.invalidEmail);
      return;
    }

    setIsLoading(true);

    try {
      if (onResend) {
        await onResend(targetEmail);
      } else {
        const response = await fetch('/api/auth/resend-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: targetEmail, redirect: redirectUrl }),
        });

        const data = await response.json();
        if (!response.ok) {
          if (response.status === 429 || data.code === 'RATE_LIMIT_EXCEEDED') {
            setCooldown(60);
          }
          setErrorMessage(data.message || es.auth.resendEmailError);
          return;
        }
      }

      setSuccessMessage(es.auth.resendEmailSuccess);
      setCooldown(30);
    } catch {
      setErrorMessage(es.auth.resendEmailError);
    } finally {
      setIsLoading(false);
    }
  };

  const loginUrl = redirectUrl
    ? `/login?redirect=${encodeURIComponent(redirectUrl)}`
    : '/login';

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Visual icon */}
      <div className="flex justify-center mb-4">
        <div
          className="w-14 h-14 bg-blue-50 text-primary rounded-2xl flex items-center justify-center border border-blue-100 shadow-xs"
          aria-hidden="true"
        >
          <svg
            className="w-7 h-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>

      {/* Headings */}
      <div className="text-center mb-6">
        <h1 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">{es.auth.confirmEmailTitle}</h1>
        <p className="text-sm text-slate-500 mt-1">{es.auth.confirmEmailSubtitle}</p>
      </div>

      {/* Target email badge (if available) */}
      {email && (
        <div className="mb-5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
          <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
            {es.auth.emailLabel}
          </span>
          <span className="text-base font-semibold text-slate-900 break-all">{email}</span>
        </div>
      )}

      {/* Main explanation */}
      <p className="text-sm text-slate-600 leading-relaxed text-center mb-5">
        {es.auth.confirmEmailInstructions(email || undefined)}
      </p>

      {/* Spam notice callout */}
      <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2.5 mb-6">
        <span className="text-base leading-none" aria-hidden="true">
          💡
        </span>
        <p className="leading-snug">{es.auth.confirmEmailSpamNotice}</p>
      </div>

      {/* Feedback alerts */}
      {errorMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="p-3.5 mb-4 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl"
        >
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          aria-live="polite"
          className="p-3.5 mb-4 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl"
        >
          {successMessage}
        </div>
      )}

      {/* Resend Action */}
      <form onSubmit={handleResend} className="space-y-3" noValidate>
        {!initialEmail && (
          <div>
            <label htmlFor="confirm-email-input" className="block text-xs font-medium text-slate-700 mb-1">
              {es.auth.emailLabel}
            </label>
            <input
              id="confirm-email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={es.auth.emailPlaceholder}
              required
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-slate-900 transition-colors"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || cooldown > 0}
          className="w-full flex justify-center py-2.5 px-4 border border-slate-200 rounded-xl shadow-xs text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        >
          {isLoading
            ? es.auth.resendingEmail
            : cooldown > 0
              ? es.auth.resendEmailCooldown(cooldown)
              : es.auth.resendEmailButton}
        </button>
      </form>

      {/* Separator */}
      <div className="mt-6 pt-6 border-t border-slate-200 space-y-3 text-center text-sm">
        <div>
          <Link
            href={loginUrl}
            className="font-semibold text-primary hover:text-blue-700 focus:outline-none focus:underline"
          >
            {es.auth.backToLogin}
          </Link>
        </div>

        <div>
          <Link
            href="/register"
            className="text-xs font-medium text-slate-500 hover:text-slate-700 focus:outline-none focus:underline"
          >
            {es.auth.backToRegister}
          </Link>
        </div>
      </div>
    </div>
  );
}
