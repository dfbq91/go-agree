import { es } from '@/locales/es';
import type React from 'react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      badge: es.landing.howItWorks.steps.step1.badge,
      title: es.landing.howItWorks.steps.step1.title,
      description: es.landing.howItWorks.steps.step1.description,
      footerText: 'Tiempo estimado: 5 - 8 minutos',
      footerIcon: (
        <svg
          className="w-4 h-4 text-primary-600 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      icon: (
        <svg
          className="w-6 h-6 text-primary-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      iconBg: 'bg-blue-50 border-blue-100 text-primary-600',
    },
    {
      badge: es.landing.howItWorks.steps.step2.badge,
      title: es.landing.howItWorks.steps.step2.title,
      description: es.landing.howItWorks.steps.step2.description,
      footerText: 'Reglas de consistencia comercial',
      footerIcon: (
        <svg
          className="w-4 h-4 text-primary-600 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      icon: (
        <svg
          className="w-6 h-6 text-primary-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
      ),
      iconBg: 'bg-blue-50 border-blue-100 text-primary-600',
    },
    {
      badge: es.landing.howItWorks.steps.step3.badge,
      title: es.landing.howItWorks.steps.step3.title,
      description: es.landing.howItWorks.steps.step3.description,
      footerText: 'Firma manual o física externa',
      footerIcon: (
        <svg
          className="w-4 h-4 text-emerald-600 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      icon: (
        <svg
          className="w-6 h-6 text-emerald-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
      ),
      iconBg: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    },
  ];

  return (
    <section
      id="como-funciona"
      aria-labelledby="how-it-works-heading"
      className="py-16 sm:py-24 bg-gray-50/60 border-t border-gray-100 scroll-mt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary-600">
            {es.landing.howItWorks.tagline}
          </p>
          <h2
            id="how-it-works-heading"
            className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight"
          >
            {es.landing.howItWorks.title}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed">
            {es.landing.howItWorks.subtitle}
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative flex flex-col justify-between bg-white border border-gray-200/80 hover:border-gray-300 rounded-2xl p-6 sm:p-8 shadow-xs hover:shadow-md transition-all duration-200"
            >
              <div>
                {/* Step Top Area */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`p-3 rounded-xl border ${step.iconBg}`}>{step.icon}</div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-100 text-primary-800">
                    {step.badge}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-3">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Step Footer Metric */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2 text-gray-500 text-xs sm:text-sm">
                {step.footerIcon}
                <span>{step.footerText}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Evidentiary Callout Note: Operative Certainty */}
        <div className="mt-12 bg-white border border-gray-200/80 rounded-2xl p-5 sm:p-6 flex items-start sm:items-center gap-4 max-w-4xl mx-auto shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary-600 border border-blue-100 flex items-center justify-center shrink-0">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            <strong className="text-gray-900 font-semibold">Certeza operativa:</strong> Todos los
            documentos generados se estructuran con lenguaje claro y jerarquía estándar, permitiendo
            que cualquiera de las partes pueda revisarlos e imprimirlos de inmediato.
          </p>
        </div>
      </div>
    </section>
  );
};
