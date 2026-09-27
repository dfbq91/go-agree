import { es } from '@/locales/es';
import Link from 'next/link';
import type React from 'react';

export interface HeroSectionProps {
  readonly isAuthenticated: boolean;
  readonly freeContractsCount?: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  isAuthenticated,
  freeContractsCount,
}) => {
  const trialBadge =
    freeContractsCount !== undefined && es.landing.hero.formatFreeTrialBadge
      ? es.landing.hero.formatFreeTrialBadge(freeContractsCount)
      : es.landing.hero.freeTrialBadge;

  const countNote =
    freeContractsCount !== undefined && es.landing.hero.formatContractCountNote
      ? es.landing.hero.formatContractCountNote(freeContractsCount)
      : es.landing.hero.contractCountNote;

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-gradient-to-b from-white via-primary-50/30 to-gray-50/80 pt-12 pb-20 md:pt-16 md:pb-28 border-b border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Hero Text & CTAs */}
          <div className="lg:col-span-6 flex flex-col items-start space-y-6">
            {/* Value Prop Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 shadow-2xs">
              <span className="text-xs" aria-hidden="true">✨</span>
              <span className="text-xs sm:text-sm font-semibold tracking-wide">{trialBadge}</span>
            </div>

            {/* Main Heading H1 */}
            <h1
              id="hero-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight"
            >
              {es.landing.hero.title}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-gray-600 max-w-xl leading-relaxed">
              {es.landing.hero.subtitle}
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 w-full sm:w-auto">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm sm:text-base font-semibold rounded-xl shadow-xs text-white bg-primary-600 hover:bg-primary-700 active:bg-primary-800 transition-all gap-2"
                >
                  <span>{es.landing.hero.ctaDashboard}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm sm:text-base font-semibold rounded-xl shadow-xs text-white bg-primary-600 hover:bg-primary-700 active:bg-primary-800 transition-all gap-2"
                  >
                    <span>{es.landing.hero.ctaPrimary}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center px-5 py-3 border border-gray-300 text-sm sm:text-base font-semibold rounded-xl shadow-2xs text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    {es.landing.hero.ctaSecondary}
                  </Link>
                  <Link
                    href="#como-funciona"
                    className="inline-flex items-center justify-center px-4 py-3 text-sm font-semibold rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors gap-1.5"
                  >
                    <span>Ver cómo funciona</span>
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Link>
                </>
              )}
            </div>

            {/* Contract Count Note */}
            {!isAuthenticated && (
              <p className="text-xs sm:text-sm text-gray-500 font-normal">{countNote}</p>
            )}

            {/* Evidentiary Trust Metrics */}
            <div className="pt-4 flex flex-wrap items-center gap-6 border-t border-gray-200/80 w-full text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-600 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs sm:text-sm font-medium">Cláusulas estructuradas</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="text-xs sm:text-sm font-medium">Formatos .docx y .pdf</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="text-xs sm:text-sm font-medium">Sin tarjeta</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero UI Mockup (Questionnaire & Generated Document) */}
          <div className="lg:col-span-6 relative">
            {/* Step Questionnaire Mockup Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 sm:p-8 relative z-10">
              {/* Header & Autosave status */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-600 animate-pulse" aria-hidden="true" />
                  <span className="text-xs font-semibold text-gray-600">Paso 3 de 7: Prestación de Servicios</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800">
                  <svg className="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[11px] font-semibold">Guardado en servidor seguro</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
                <div className="bg-primary-600 h-full w-[42%] rounded-full" />
              </div>

              {/* Question Heading */}
              <div className="mt-5">
                <p className="text-base font-bold text-gray-900 leading-snug">
                  ¿Cómo se estructurará el pago de los honorarios pactados?
                </p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Selecciona la fórmula comercial acordada entre las partes para calcular las obligaciones dinerarias.
                </p>
              </div>

              {/* Mock Radio Choices */}
              <div className="mt-4 space-y-2.5">
                {/* Selected Choice */}
                <div className="p-3.5 rounded-xl border-2 border-primary-600 bg-blue-50/40 flex items-start gap-3">
                  <div className="mt-0.5 w-4 h-4 rounded-full bg-primary-600 flex items-center justify-center text-white shrink-0">
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs sm:text-sm font-semibold text-gray-900">Pago contra entregables aprobados</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-blue-100 text-primary-700 shrink-0">
                        Recomendado
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                      Condiciona el desembolso a la validación formal de cada hito técnico documentado.
                    </p>
                  </div>
                </div>

                {/* Unselected Choice 2 */}
                <div className="p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors flex items-start gap-3">
                  <div className="mt-0.5 w-4 h-4 rounded-full border border-gray-300 bg-white shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs sm:text-sm font-medium text-gray-800">Pago mensual fijo recurrente</span>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                      Compromiso de cobro periódico en fecha fija independiente de hitos intermedios.
                    </p>
                  </div>
                </div>

                {/* Unselected Choice 3 */}
                <div className="p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors flex items-start gap-3">
                  <div className="mt-0.5 w-4 h-4 rounded-full border border-gray-300 bg-white shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs sm:text-sm font-medium text-gray-800">Anticipo del 50% y liquidación al cierre</span>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                      Requiere abono inicial para comenzar y pago final previo a la entrega definitiva.
                    </p>
                  </div>
                </div>
              </div>

              {/* Mock Micro Navigation */}
              <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium flex items-center gap-1 cursor-default">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Anterior</span>
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-semibold shadow-2xs cursor-default">
                  <span>Guardar y continuar</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Floating Generated Document Pill / Card */}
            <div className="hidden sm:flex absolute -bottom-5 -left-4 z-20 bg-white border border-gray-200 rounded-xl p-3.5 shadow-xl items-center gap-3.5 max-w-xs">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Documento Generado
                </span>
                <span className="text-xs font-semibold text-gray-900 truncate block">
                  Contrato_Servicios_v1
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 text-[10px] font-bold">
                    .DOCX
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 text-[10px] font-bold">
                    .PDF
                  </span>
                </div>
              </div>
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
