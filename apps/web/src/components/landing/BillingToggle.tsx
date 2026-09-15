import { es } from '@/locales/es';
import type { BillingCycle } from '@go-agree/domain';
import type React from 'react';
import { useRef } from 'react';

export interface BillingToggleProps {
  readonly selectedCycle: BillingCycle;
  readonly onCycleChange: (cycle: BillingCycle) => void;
  readonly annualDiscountPercent?: number;
}

export const BillingToggle: React.FC<BillingToggleProps> = ({
  selectedCycle,
  onCycleChange,
  annualDiscountPercent: _annualDiscountPercent = 20,
}) => {
  const monthlyRef = useRef<HTMLButtonElement>(null);
  const annualRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, current: BillingCycle) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      onCycleChange('annual');
      annualRef.current?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      onCycleChange('monthly');
      monthlyRef.current?.focus();
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onCycleChange(current);
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={es.landing.pricing.billingCycle.label}
      className="inline-flex items-center p-1 bg-gray-100 rounded-full border border-gray-200 shadow-inner"
    >
      {/* Monthly Option */}
      <button
        ref={monthlyRef}
        type="button"
        role="radio"
        aria-checked={selectedCycle === 'monthly'}
        tabIndex={selectedCycle === 'monthly' ? 0 : -1}
        onClick={() => onCycleChange('monthly')}
        onKeyDown={(e) => handleKeyDown(e, 'monthly')}
        className={`px-5 py-2 text-sm font-semibold rounded-full transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
          selectedCycle === 'monthly'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        {es.landing.pricing.billingCycle.monthly}
      </button>

      {/* Annual Option */}
      <button
        ref={annualRef}
        type="button"
        role="radio"
        aria-checked={selectedCycle === 'annual'}
        tabIndex={selectedCycle === 'annual' ? 0 : -1}
        onClick={() => onCycleChange('annual')}
        onKeyDown={(e) => handleKeyDown(e, 'annual')}
        className={`inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-full transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
          selectedCycle === 'annual'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <span>{es.landing.pricing.billingCycle.annual}</span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
          {es.landing.pricing.billingCycle.saveBadge}
        </span>
      </button>
    </div>
  );
};
