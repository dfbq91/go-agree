import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSessionSync } from '../../src/hooks/useSessionSync';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/dashboard',
}));

describe('useSessionSync Hook', () => {
  it('saves, recovers and clears in-progress questionnaire drafts', () => {
    const { result } = renderHook(() => useSessionSync());

    const draft = {
      contractId: 'draft-1',
      currentStep: 3,
      answers: { clientName: 'Empresa Test' },
      savedAt: Date.now(),
    };

    act(() => {
      result.current.saveDraft(draft);
    });

    const recovered = result.current.recoverDraft();
    expect(recovered).toEqual(draft);

    act(() => {
      result.current.clearDraft();
    });

    expect(result.current.recoverDraft()).toBeNull();
  });
});
