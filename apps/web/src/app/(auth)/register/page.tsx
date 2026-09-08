import React from 'react';
import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { es } from '@/locales/es';

export default function RegisterPage({
  searchParams,
}: {
  searchParams?: { redirect?: string };
}) {
  const loginUrl = searchParams?.redirect
    ? `/login?redirect=${encodeURIComponent(searchParams.redirect)}`
    : '/login';

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">{es.auth.registerTitle}</h1>
        <p className="text-sm text-gray-600 mt-1">{es.auth.registerSubtitle}</p>
      </div>

      <RegisterForm redirectUrl={searchParams?.redirect} />

      <div className="mt-6 relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">o</span>
        </div>
      </div>

      <div className="mt-6">
        <GoogleAuthButton redirectUrl={searchParams?.redirect} />
      </div>

      <div className="mt-6 text-center text-sm text-gray-600">
        <span>{es.auth.haveAccount} </span>
        <Link
          href={loginUrl}
          className="font-medium text-primary-600 hover:text-primary-500 focus:outline-none focus:underline"
        >
          {es.auth.signInHere}
        </Link>
      </div>
    </div>
  );
}
