import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { es } from '@/locales/es';
import Link from 'next/link';

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: Promise<{ redirect?: string }>;
}) {
  const params = (await searchParams) || {};
  const loginUrl = params.redirect
    ? `/login?redirect=${encodeURIComponent(params.redirect)}`
    : '/login';

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
          {es.auth.registerTitle}
        </h1>
        <p className="text-sm text-gray-500 mt-1.5">{es.auth.registerSubtitle}</p>
      </div>

      <div className="mb-6">
        <GoogleAuthButton redirectUrl={params.redirect} />
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-border-subtle" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-surface-card px-3 text-gray-400 font-medium">
            o regístrate con tu correo
          </span>
        </div>
      </div>

      <RegisterForm redirectUrl={params.redirect} />

      <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-600">
        <span>{es.auth.haveAccount} </span>
        <Link
          href={loginUrl}
          className="font-semibold text-primary hover:text-primary-hover hover:underline focus:outline-none focus:ring-1 focus:ring-primary rounded"
        >
          {es.auth.signInHere}
        </Link>
      </div>
    </div>
  );
}
