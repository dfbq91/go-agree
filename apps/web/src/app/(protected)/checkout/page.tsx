import { CheckoutClientPage } from '@/components/checkout/CheckoutClientPage';
import { getServerAuthAdapter } from '@/lib/auth';
import { getServerSubscriptionStatus } from '@/lib/subscription';
import { ListPaymentProvidersUseCase } from '@go-agree/application';
import { CountryPricingRegistry } from '@go-agree/domain';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams?: Promise<{ country?: string }>;
}) {
  const resolvedParams = (await searchParams) || {};
  const authAdapter = await getServerAuthAdapter();
  const session = await authAdapter.getCurrentSession();

  if (!session) {
    redirect('/login?redirectTo=/checkout');
  }

  const countryCode = resolvedParams?.country?.toUpperCase() || 'CO';
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
