'use client';

import { es } from '@/locales/es';
import type { ContractDashboardItemDTO } from '@go-agree/application';
import { useEffect, useRef } from 'react';

export interface DeleteContractModalProps {
  isOpen: boolean;
  contract: ContractDashboardItemDTO | null;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  isDeleting?: boolean;
  errorMessage?: string | null;
}

export function DeleteContractModal({
  isOpen,
  contract,
  onClose,
  onConfirm,
  isDeleting = false,
  errorMessage = null,
}: DeleteContractModalProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Close on Escape unless in middle of deleting
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen && !isDeleting) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Auto-focus cancel button for safety
      setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 50);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen || !contract) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-40 transition-opacity"
        onClick={() => {
          if (!isDeleting) onClose();
        }}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div
          className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left shadow-xl transition-all border border-gray-200 animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Warning Icon & Title */}
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-red-100 text-red-600">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 id="delete-dialog-title" className="text-lg font-semibold text-gray-900">
                {es.dashboard.deleteModal.title}
              </h3>
              <p id="delete-dialog-description" className="mt-2 text-sm text-gray-600">
                {es.dashboard.deleteModal.message}
              </p>
              <div className="mt-3 p-2 bg-gray-50 rounded border border-gray-200">
                <span className="text-xs text-gray-500 font-medium">Contrato: </span>
                <span className="text-xs font-semibold text-gray-800">{contract.title}</span>
              </div>
              {errorMessage && (
                <p className="mt-2 text-xs text-red-600 font-medium" role="alert">
                  {errorMessage}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              ref={cancelButtonRef}
              type="button"
              disabled={isDeleting}
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {es.dashboard.deleteModal.cancel}
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => onConfirm()}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {es.dashboard.deleteModal.deleting}
                </>
              ) : (
                es.dashboard.deleteModal.confirm
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
