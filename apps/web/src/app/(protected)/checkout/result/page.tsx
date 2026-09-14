import React from 'react';
import { redirect } from 'next/navigation';
import { getServerAuthAdapter } from '@/lib/auth';
import { getServerPaymentRepository } from '@/lib/payments';
import { GetTransactionStatusUseCase } from '@go-agree/application';
import { PaymentResultView } from '@/components/checkout/PaymentResultView';

export const dynamic = 'force-dynamic';

interface CheckoutResultPageProps {
  searchParams: { id?: string; reference?: string };
}

export default async function CheckoutResultPage({ searchParams }: CheckoutResultPageProps) {
  const authAdapter = getServerAuthAdapter();
  const session = await authAdapter.getCurrentSession();

  if (!session) {
    redirect('/login?redirectTo=/checkout');
  }

  const queryParam = searchParams.reference || searchParams.id || '';

  let initialStatus = null;
  if (queryParam) {
    const paymentRepo = getServerPaymentRepository();
    const useCase = new GetTransactionStatusUseCase(paymentRepo);
    initialStatus = await useCase.execute({
      reference: queryParam,
      userId: session.userId,
    });
  }

  const reference = initialStatus?.reference || queryParam;

  return (
    <PaymentResultView
      initialStatus={initialStatus}
      reference={reference}
    />
  );
}
