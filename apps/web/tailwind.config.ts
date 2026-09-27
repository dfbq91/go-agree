import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          hover: '#1d4ed8',
          active: '#1e40af',
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        'surface-canvas': '#f9fafb',
        'surface-card': '#ffffff',
        'surface-muted': '#f3f4f6',
        'surface-inset': '#eff6ff',
        'border-subtle': '#e5e7eb',
        'border-strong': '#d1d5db',
        'status-draft-bg': '#fef3c7',
        'status-draft-text': '#92400e',
        'status-draft-border': '#fcd34d',
        'status-completed-bg': '#ecfdf5',
        'status-completed-text': '#065f46',
        'status-completed-border': '#a7f3d0',
        'status-review-bg': '#eff6ff',
        'status-review-text': '#1e40af',
        'status-review-border': '#bfdbfe',
      },
    },
  },
  plugins: [],
};

export default config;
