import { es } from '@/locales/es';
import type React from 'react';
import { useId } from 'react';

export interface LogoProps extends React.SVGProps<SVGSVGElement> {
  variant?: 'light' | 'dark';
  iconOnly?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'light',
  iconOnly = false,
  className = 'h-11 sm:h-12 w-auto',
  ...props
}) => {
  const reactId = useId();
  // Sanitize useId() output for SVG id attribute
  const safeId = reactId.replace(/[^a-zA-Z0-9-_]/g, '');
  const cobaltGradId = `cobalt-${safeId}`;
  const iceGradId = `ice-${safeId}`;

  const isDark = variant === 'dark';
  const textColor = isDark ? '#FFFFFF' : '#141B2B';
  const taglineColor = isDark ? '#94A3B8' : '#555F6D';
  const accentColor = isDark ? '#60A5FA' : '#2563EB';

  if (iconOnly) {
    return (
      <span className="inline-flex items-center shrink-0">
        <svg
          viewBox="0 0 88 88"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-hidden="true"
          {...props}
        >
          <defs>
            <linearGradient
              id={cobaltGradId}
              x1="0"
              y1="0"
              x2="88"
              y2="88"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
            <linearGradient
              id={iceGradId}
              x1="18"
              y1="0"
              x2="72"
              y2="0"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#93C5FD" />
              <stop offset="100%" stopColor="#6EE7B7" />
            </linearGradient>
          </defs>
          <rect width="88" height="88" rx="24" fill={`url(#${cobaltGradId})`} />
          <path
            d="M 18 56 C 24 26 34 22 36 35 C 38 48 27 60 38 54 C 48 48 50 35 56 42 L 62 50 L 73 31"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 18 70 L 72 70"
            fill="none"
            stroke={`url(#${iceGradId})`}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="73" cy="31" r="2.5" fill="#A7F3D0" />
        </svg>
        <span className="sr-only">{es.brand.name}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center shrink-0">
      <svg
        viewBox="0 0 352 92"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
        {...props}
      >
        <defs>
          <linearGradient
            id={cobaltGradId}
            x1="0"
            y1="0"
            x2="88"
            y2="88"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient
            id={iceGradId}
            x1="18"
            y1="0"
            x2="72"
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#93C5FD" />
            <stop offset="100%" stopColor="#6EE7B7" />
          </linearGradient>
        </defs>

        <g transform="translate(2, 2)">
          {/* Main Icon Badge Container: Rich Cobalt Gradient with soft radius */}
          <rect width="88" height="88" rx="24" fill={`url(#${cobaltGradId})`} />

          {/* Signature Curve with integrated execution check flourish at terminal */}
          <path
            d="M 18 56 C 24 26 34 22 36 35 C 38 48 27 60 38 54 C 48 48 50 35 56 42 L 62 50 L 73 31"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Base Rule with smooth gradient transitioning into consensus emerald */}
          <path
            d="M 18 70 L 72 70"
            fill="none"
            stroke={`url(#${iceGradId})`}
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Consensus Integrity Pin */}
          <circle cx="73" cy="31" r="2.5" fill="#A7F3D0" />
        </g>

        {/* Typography: Calibrated for optical hierarchy and high legibility */}
        <g transform="translate(108, 54)">
          <text
            fontFamily="Inter, -apple-system, BlinkMacSystemFont, sans-serif"
            fontSize="48"
            fontWeight="800"
            letterSpacing="-0.035em"
            fill={textColor}
          >
            go<tspan fill={accentColor}>agree</tspan>
          </text>

          {/* Micro Tagline / Category Definition */}
          <text
            x="2"
            y="25"
            fontFamily="Inter, -apple-system, BlinkMacSystemFont, sans-serif"
            fontSize="11.5"
            fontWeight="700"
            letterSpacing="0.11em"
            fill={taglineColor}
          >
            SMART AGREEMENT INTELLIGENCE
          </text>
        </g>
      </svg>
      <span className="sr-only">{es.brand.name}</span>
    </span>
  );
};
