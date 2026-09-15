'use client';

import type { TransactionStatusResult } from '@go-agree/application';
import Link from 'next/link';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { es } from '../../locales/es';

export interface PaymentResultViewProps {
  readonly initialStatus: TransactionStatusResult | null;
  readonly reference: string;
}

export const PaymentResultView: React.FC<PaymentResultViewProps> = ({
  initialStatus,
  reference,
}) => {
  const [currentStatus, setCurrentStatus] = useState<TransactionStatusResult | null>(initialStatus);
  const [isChecking, setIsChecking] = useState(false);

  const status = currentStatus?.status || 'pending';
  const isPending = status === 'pending';
  const isApproved = status === 'approved';
  const isRejected =
    status === 'rejected' ||
    status === 'rejected_duplicate' ||
    status === 'expired' ||
    status === 'flagged_mismatch';

  const checkStatus = useCallback(async () => {
    setIsChecking(true);
    try {
      const res = await fetch(`/api/checkout/status?reference=${encodeURIComponent(reference)}`);
      if (res.ok) {
        const data: TransactionStatusResult = await res.json();
        setCurrentStatus(data);
      }
    } catch {
      // Ignore network errors during polling
    } finally {
      setIsChecking(false);
    }
  }, [reference]);

  // Client polling with timeout: Polls every 4 seconds up to 30s while pending
  useEffect(() => {
    if (!isPending) return;

    let elapsedMs = 0;
    const intervalMs = 4000;
    const maxDurationMs = 30000;

    const timer = setInterval(() => {
      elapsedMs += intervalMs;
      checkStatus();
      if (elapsedMs >= maxDurationMs) {
        clearInterval(timer);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPending, checkStatus]);

  const getRejectionMessage = () => {
    if (currentStatus?.rejectionReason) {
      return currentStatus.rejectionReason;
    }
    if (status === 'rejected_duplicate') {
      return es.paymentResult.reasons.duplicate;
    }
    if (status === 'expired') {
      return es.paymentResult.reasons.expired;
    }
    return es.paymentResult.reasons.generic;
  };

  return (
    <div className="mx-auto max-w-xl py-8 sm:py-14 px-4 text-center">
      {/* 1. Approved State */}
      {isApproved && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mb-5">
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-extrabold text-foreground">
            {es.paymentResult.approvedTitle}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {es.paymentResult.approvedSubtitle}
          </p>

          <div className="mt-4 rounded-xl bg-background/80 border border-border p-3 text-xs text-muted-foreground font-mono">
            <span>{es.paymentResult.referenceLabel} </span>
            <span className="font-semibold text-foreground">{reference}</span>
          </div>

          <div className="mt-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {es.paymentResult.backToDashboard}
            </Link>
          </div>
        </div>
      )}

      {/* 2. Pending State */}
      {isPending && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 mb-5">
            <svg
              className="h-8 w-8 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-extrabold text-foreground">
            {es.paymentResult.pendingTitle}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            {es.paymentResult.pendingSubtitle}
          </p>

          <div className="mt-4 rounded-xl bg-background/80 border border-border p-3 text-xs text-muted-foreground font-mono">
            <span>{es.paymentResult.referenceLabel} </span>
            <span className="font-semibold text-foreground">{reference}</span>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              disabled={isChecking}
              onClick={checkStatus}
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60"
            >
              {isChecking ? es.paymentResult.verifying : es.paymentResult.verifyStatusButton}
            </button>
            <Link
              href="/dashboard"
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-input bg-background px-5 py-3 text-sm font-medium text-foreground hover:bg-muted/60 transition-colors"
            >
              {es.paymentResult.backToDashboard}
            </Link>
          </div>
        </div>
      )}

      {/* 3. Rejected State */}
      {isRejected && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-5">
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-extrabold text-foreground">
            {es.paymentResult.rejectedTitle}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {es.paymentResult.rejectedSubtitle}
          </p>

          <div className="mt-4 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive max-w-md mx-auto">
            {getRejectionMessage()}
          </div>

          <div className="mt-3 text-xs text-muted-foreground font-mono">
            <span>{es.paymentResult.referenceLabel} </span>
            <span className="font-semibold text-foreground">{reference}</span>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/checkout"
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {es.paymentResult.retryButton}
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-input bg-background px-5 py-3 text-sm font-medium text-foreground hover:bg-muted/60 transition-colors"
            >
              {es.paymentResult.backToDashboard}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
