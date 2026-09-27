import { ConfirmEmailView } from '@/components/auth/ConfirmEmailView';

export default async function ConfirmEmailPage({
  searchParams,
}: {
  searchParams?: Promise<{ email?: string; redirect?: string }>;
}) {
  const params = (await searchParams) || {};

  return <ConfirmEmailView email={params.email} redirectUrl={params.redirect} />;
}
