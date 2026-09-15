import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { LoginForm } from '@/components/auth/LoginForm';
import { es } from '@/locales/es';
import Link from 'next/link';

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ redirect?: string }>;
}) {
  const params = (await searchParams) || {};
  const registerUrl = params.redirect
    ? `/register?redirect=${encodeURIComponent(params.redirect)}`
    : '/register';

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">{es.auth.loginTitle}</h1>
        <p className="text-sm text-gray-600 mt-1">{es.auth.loginSubtitle}</p>
      </div>

      <LoginForm redirectUrl={params.redirect} />

      <div className="mt-6 relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">o</span>
        </div>
      </div>

      <div className="mt-6">
        <GoogleAuthButton redirectUrl={params.redirect} />
      </div>

      <div className="mt-6 text-center text-sm text-gray-600">
        <span>{es.auth.noAccount} </span>
        <Link
          href={registerUrl}
          className="font-medium text-primary-600 hover:text-primary-500 focus:outline-none focus:underline"
        >
          {es.auth.registerHere}
        </Link>
      </div>
    </div>
  );
}
