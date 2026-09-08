import React from 'react';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { es } from '@/locales/es';

export default function ResetPasswordPage() {
  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">{es.auth.resetPasswordTitle}</h1>
        <p className="text-sm text-gray-600 mt-1">{es.auth.resetPasswordSubtitle}</p>
      </div>

      <ResetPasswordForm />
    </div>
  );
}
