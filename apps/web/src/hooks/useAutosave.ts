import { useState, useRef, useCallback, useEffect } from 'react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface UseAutosaveOptions<T> {
  onSave: (data: T) => Promise<void>;
  debounceMs?: number;
  localFallbackKey?: string;
}

export function useAutosave<T>({
  onSave,
  debounceMs = 400,
  localFallbackKey,
}: UseAutosaveOptions<T>) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const latestDataRef = useRef<T | null>(null);
  const resetSavedTimerRef = useRef<NodeJS.Timeout | null>(null);

  const saveDirectly = useCallback(
    async (data: T) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      try {
        setSaveStatus('saving');
        await onSave(data);
        setSaveStatus('saved');

        if (localFallbackKey && typeof window !== 'undefined') {
          try {
            localStorage.removeItem(localFallbackKey);
          } catch {
            // Ignore localStorage errors
          }
        }

        if (resetSavedTimerRef.current) {
          clearTimeout(resetSavedTimerRef.current);
        }
        resetSavedTimerRef.current = setTimeout(() => {
          setSaveStatus((s) => (s === 'saved' ? 'idle' : s));
        }, 2000);
      } catch {
        setSaveStatus('error');
        if (localFallbackKey && typeof window !== 'undefined') {
          try {
            localStorage.setItem(localFallbackKey, JSON.stringify(data));
          } catch {
            // Ignore localStorage errors
          }
        }
      }
    },
    [onSave, localFallbackKey]
  );

  const triggerAutosave = useCallback(
    (data: T) => {
      latestDataRef.current = data;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        saveDirectly(data);
      }, debounceMs);
    },
    [saveDirectly, debounceMs]
  );

  const flush = useCallback(() => {
    if (timerRef.current && latestDataRef.current !== null) {
      saveDirectly(latestDataRef.current);
    }
  }, [saveDirectly]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (resetSavedTimerRef.current) {
        clearTimeout(resetSavedTimerRef.current);
      }
    };
  }, []);

  return {
    saveStatus,
    triggerAutosave,
    saveDirectly,
    flush,
  };
}
