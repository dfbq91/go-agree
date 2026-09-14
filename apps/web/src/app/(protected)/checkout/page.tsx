import React from 'react';
import { redirect } from 'next/navigation';
import { getServerAuthAdapter } from '@/lib/auth';
import { getServerSubscriptionStatus } from '@/lib/subscription';
import { CountryPricingRegistry } from '@go-agree/domain';
import { ListPaymentProvidersUseCase } from '@go-agree/application';
import { CheckoutClientPage } from '@/components/checkout/CheckoutClientPage';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams?: { country?: string };
}) {
  const authAdapter = getServerAuthAdapter();
  const session = await authAdapter.getCurrentSession();

  if (!session) {
    redirect('/login?redirectTo=/checkout');
  }

  const countryCode = searchParams?.country?.toUpperCase() || 'CO';
  const listProvidersUseCase = new ListPaymentProvidersUseCase();
  const providers = await listProvidersUseCase.execute({ countryCode });
  const plan = CountryPricingRegistry.getPlanForCountry(countryCode);

  const subscription = await getServerSubscriptionStatus(session.userId);

  return (
    <CheckoutClientPage
      providers={providers}
      subscription={subscription}
      countryCode={countryCode}
      plan={plan}
    />
  );
}
