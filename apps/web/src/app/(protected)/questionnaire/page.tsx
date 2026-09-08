import React from 'react';
import Link from 'next/link';
import { es } from '@/locales/es';

export default function QuestionnairePage() {
  return (
    <div className="bg-white shadow rounded-lg p-6 sm:p-8">
      <div className="border-b border-gray-200 pb-4 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cuestionario de Generación Contractual</h1>
          <p className="mt-1 text-sm text-gray-500">
            Responde las preguntas estructuradas para preparar el acuerdo.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          ← {es.nav.dashboard}
        </Link>
      </div>

      <div className="rounded-md bg-blue-50 p-4 mb-6">
        <div className="flex">
          <div className="ml-3 flex-1 md:flex md:justify-between">
            <p className="text-sm text-blue-700">
              Esta sección está protegida y vinculada a tu cuenta de usuario autenticado.
            </p>
          </div>
        </div>
      </div>

      <div className="py-12 text-center text-gray-500">
        <p>Módulo de preguntas dinámicas y análisis legal en desarrollo (Contexto 002).</p>
      </div>
    </div>
  );
}
