'use client';

import { PROTECTED_ROUTES } from '@/middleware';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const DRAFT_STORAGE_KEY = 'go_agree_questionnaire_draft';

export interface QuestionnaireDraftState {
  contractId?: string;
  currentStep: number;
  answers: Record<string, unknown>;
  savedAt: number;
}

export function useSessionSync() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Multi-tab logout listener via storage events
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'go_agree_auth_event' && e.newValue === 'LOGOUT') {
        const isProtected = PROTECTED_ROUTES.some((route) => pathname?.startsWith(route));
        if (isProtected) {
          router.push('/login?reason=session_terminated');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [pathname, router]);

  const broadcastLogout = () => {
    try {
      localStorage.setItem('go_agree_auth_event', 'LOGOUT');
      // Reset immediately so subsequent logouts also fire change events
      setTimeout(() => {
        localStorage.removeItem('go_agree_auth_event');
      }, 100);
    } catch {
      // Storage access disabled in some environments
    }
  };

  const saveDraft = (draft: QuestionnaireDraftState) => {
    try {
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Session storage disabled or full
    }
  };

  const recoverDraft = (): QuestionnaireDraftState | null => {
    try {
      const data = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data) as QuestionnaireDraftState;
    } catch {
      return null;
    }
  };

  const clearDraft = () => {
    try {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  return {
    broadcastLogout,
    saveDraft,
    recoverDraft,
    clearDraft,
  };
}
