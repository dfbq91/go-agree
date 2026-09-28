import { Logo } from '@/components/ui/Logo';
import { es } from '@/locales/es';
import Link from 'next/link';
import type React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-surface-card antialiased font-sans">
      {/* Columna Izquierda (45% en desktop): Showcase Corporativo Stitch */}
      <section className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-slate-900 text-white p-12 lg:p-16 shrink-0 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        {/* Brand Anchor */}
        <div className="relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg p-1"
          >
            <Logo variant="dark" className="h-12 sm:h-[50px] w-auto" />
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">
              LEGAL STUDIO
            </span>
          </Link>
        </div>

        {/* Central Value Proposition */}
        <div className="relative z-10 my-auto py-8">
          <h1 className="text-2xl xl:text-3xl font-bold tracking-tight text-white leading-tight">
            Genera contratos comerciales personalizados a partir de respuestas guiadas.
          </h1>
          <p className="mt-4 text-base text-slate-300 leading-relaxed font-normal">
            Crea, guarda y descarga tus contratos legales en formato Word y PDF en minutos.
          </p>

          {/* Real Value Pillars (go-agree actual capabilities) */}
          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                <svg
                  className="w-4 h-4 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  3 contratos gratuitos al registrarte
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Explora todas las funcionalidades sin costo inicial ni compromiso.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                <svg
                  className="w-4 h-4 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Cuestionario guiado con autoguardado
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Retoma tus borradores en cualquier momento sin perder ningún dato.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                <svg
                  className="w-4 h-4 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Descarga inmediata en Word (.docx) y PDF
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Documentos estructurados listos para revisión y formalización.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer columna izquierda */}
        <div className="relative z-10 pt-6 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>
            © {new Date().getFullYear()} {es.brand.name}. Todos los derechos reservados.
          </span>
        </div>
      </section>

      {/* Columna Derecha (55%): Formulario */}
      <main className="w-full lg:w-[55%] flex flex-col justify-between bg-surface-card px-6 sm:px-12 md:px-16 xl:px-24 py-8 sm:py-12 min-h-screen">
        {/* Header solo visible en móvil / botón volver */}
        <div className="w-full flex items-center justify-between pb-6">
          <div className="lg:hidden flex items-center">
            <Link href="/" className="flex items-center">
              <Logo className="h-10 w-auto" />
            </Link>
          </div>
          <div className="ml-auto">
            <Link
              href="/"
              className="text-xs font-semibold text-gray-500 hover:text-primary transition-colors flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-100"
            >
              <span>← Volver al inicio</span>
            </Link>
          </div>
        </div>

        {/* Contenedor central del Formulario */}
        <div className="w-full max-w-md mx-auto my-auto py-4">{children}</div>

        {/* Pie inferior de la columna derecha */}
        <div className="w-full text-center text-xs text-gray-400 pt-6 border-t border-gray-100">
          <span>Conexión segura SSL con cifrado estándar de datos.</span>
        </div>
      </main>
    </div>
  );
}
