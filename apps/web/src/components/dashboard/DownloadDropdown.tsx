'use client';

import { es } from '@/locales/es';
import type { DocumentFormat } from '@go-agree/application';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export interface DownloadDropdownProps {
  contractId: string;
  hasGeneratedDocument: boolean;
  isRegenerationPending?: boolean;
  availableFormats?: DocumentFormat[];
  className?: string;
}

export function DownloadDropdown({
  contractId,
  hasGeneratedDocument,
  isRegenerationPending = false,
  availableFormats = ['pdf', 'docx'],
  className = '',
}: DownloadDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Focus management when menu opens
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const firstItem = menuRef.current.querySelector<HTMLElement>('[role="menuitem"]');
      firstItem?.focus();
    }
  }, [isOpen]);

  // Keyboard navigation on trigger button
  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(true);
    }
  };

  // Keyboard navigation within the menu
  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!menuRef.current) return;

    const items = Array.from(menuRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]'));
    if (items.length === 0) return;

    const currentIndex = items.indexOf(document.activeElement as HTMLElement);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      items[nextIndex]?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      items[prevIndex]?.focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      items[0]?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      items[items.length - 1]?.focus();
    } else if (event.key === 'Tab') {
      setIsOpen(false);
    }
  };

  if (isRegenerationPending) {
    return (
      <div className={`relative inline-block text-left ${className}`}>
        <Link
          href={`/questionnaire?id=${contractId}&mode=summary`}
          title={es.dashboard.download.pendingRegenerationTooltip}
          className="inline-flex items-center text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded px-2.5 py-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1"
        >
          <span
            className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse"
            aria-hidden="true"
          />
          {es.dashboard.download.pendingRegenerationBadge}
        </Link>
      </div>
    );
  }

  if (!hasGeneratedDocument) {
    return (
      <div className={`relative inline-block text-left ${className}`}>
        <button
          type="button"
          disabled
          title={es.dashboard.download.tooltipNotGenerated}
          className="inline-flex items-center text-xs font-medium text-gray-400 bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 cursor-not-allowed transition-colors"
        >
          <svg
            className="w-3.5 h-3.5 mr-1 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          {es.dashboard.download.action}
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="inline-flex items-center text-xs font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded px-2.5 py-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
      >
        <svg
          className="w-3.5 h-3.5 mr-1 text-primary-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        {es.dashboard.download.action}
        <svg
          className={`w-3 h-3 ml-1 text-primary-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          tabIndex={-1}
          onKeyDown={handleMenuKeyDown}
          aria-orientation="vertical"
          className="absolute left-0 z-20 mt-1 w-52 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none py-1 border border-gray-100 divide-y divide-gray-50 animate-in fade-in zoom-in-95 duration-100"
        >
          {availableFormats.includes('pdf') && (
            <a
              role="menuitem"
              href={`/api/contracts/${contractId}/download?format=pdf`}
              download
              onClick={() => setIsOpen(false)}
              className="group flex items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus:bg-gray-100 focus:outline-none transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 mr-2" aria-hidden="true" />
              {es.dashboard.download.pdf}
            </a>
          )}
          {availableFormats.includes('docx') && (
            <a
              role="menuitem"
              href={`/api/contracts/${contractId}/download?format=docx`}
              download
              onClick={() => setIsOpen(false)}
              className="group flex items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus:bg-gray-100 focus:outline-none transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-2" aria-hidden="true" />
              {es.dashboard.download.docx}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
