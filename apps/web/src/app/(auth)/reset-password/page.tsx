import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { es } from '@/locales/es';

export default function ResetPasswordPage() {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
          {es.auth.resetPasswordTitle}
        </h1>
        <p className="text-sm text-gray-500 mt-1.5">{es.auth.resetPasswordSubtitle}</p>
      </div>

      <ResetPasswordForm />
    </div>
  );
}
