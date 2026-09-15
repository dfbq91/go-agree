import { es } from '@/locales/es';
import type React from 'react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      badge: es.landing.howItWorks.steps.step1.badge,
      title: es.landing.howItWorks.steps.step1.title,
      description: es.landing.howItWorks.steps.step1.description,
      icon: (
        <svg
          className="w-8 h-8 text-primary-600"
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
    },
    {
      badge: es.landing.howItWorks.steps.step2.badge,
      title: es.landing.howItWorks.steps.step2.title,
      description: es.landing.howItWorks.steps.step2.description,
      icon: (
        <svg
          className="w-8 h-8 text-primary-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
    {
      badge: es.landing.howItWorks.steps.step3.badge,
      title: es.landing.howItWorks.steps.step3.title,
      description: es.landing.howItWorks.steps.step3.description,
      icon: (
        <svg
          className="w-8 h-8 text-primary-600"
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
    },
  ];

  return (
    <section
      id="como-funciona"
      aria-labelledby="how-it-works-heading"
      className="py-16 sm:py-24 bg-white border-t border-gray-100 scroll-mt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">
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
              className="relative flex flex-col bg-gray-50/70 hover:bg-white border border-gray-200/80 rounded-xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-200"
            >
              {/* Step Top Area */}
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 bg-primary-100/70 rounded-lg">{step.icon}</div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-600 text-white">
                  {step.badge}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-3">{step.title}</h3>

              {/* Description */}
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed flex-1">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
