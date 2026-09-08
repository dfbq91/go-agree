import type { Metadata } from 'next';
import './globals.css';
import { es } from '@/locales/es';

export const metadata = {
  title: es.brand.name,
  description: es.brand.tagline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
