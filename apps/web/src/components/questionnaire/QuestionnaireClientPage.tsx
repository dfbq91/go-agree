'use client';

import type { QuestionDTO } from '@go-agree/application';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { QuestionnaireContainer } from './QuestionnaireContainer';

export interface QuestionnaireClientPageProps {
  contractId: string;
  initialTitle: string;
  initialAnswers: Record<string, unknown>;
  initialQuestionIndex: number;
  initialIsReviewing?: boolean;
  isCompleted?: boolean;
  initialDynamicQuestions?: QuestionDTO[];
  hasGeneratedDocument?: boolean;
  isRegenerationPending?: boolean;
}

export const QuestionnaireClientPage: React.FC<QuestionnaireClientPageProps> = ({
  contractId,
  initialTitle,
  initialAnswers,
  initialQuestionIndex,
  initialIsReviewing = false,
  isCompleted = false,
  initialDynamicQuestions = [],
  hasGeneratedDocument,
  isRegenerationPending,
}) => {
  const router = useRouter();

  const handleSaveProgress = async (index: number, answers: Record<string, unknown>) => {
    try {
      const res = await fetch(`/api/contracts/${contractId}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionIndex: index, answers }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to save progress');
      }
    } catch (err) {
      console.error('Failed to save progress:', err);
      throw err;
    }
  };

  const handleSaveTitle = async (newTitle: string) => {
    try {
      const res = await fetch(`/api/contracts/${contractId}/title`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to save title');
      }
    } catch (err) {
      console.error('Failed to save title:', err);
      throw err;
    }
  };

  const handleComplete = async () => {
    if (isCompleted) {
      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard';
      } else {
        router.push('/dashboard');
      }
      return;
    }

    try {
      const res = await fetch(`/api/contracts/${contractId}/complete`, {
        method: 'POST',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const error = new Error(data.message || 'Failed to complete questionnaire');
        (error as any).code = data.code;
        (error as any).status = res.status;
        throw error;
      }
      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard';
      } else {
        router.refresh();
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Failed to complete questionnaire:', err);
      throw err;
    }
  };

  const handleRegenerate = async () => {
    try {
      const res = await fetch(`/api/contracts/${contractId}/regenerate`, {
        method: 'POST',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to regenerate contract documents');
      }
      router.refresh();
    } catch (err) {
      console.error('Failed to regenerate contract documents:', err);
      throw err;
    }
  };

  return (
    <QuestionnaireContainer
      contractId={contractId}
      initialTitle={initialTitle}
      initialAnswers={initialAnswers}
      initialQuestionIndex={initialQuestionIndex}
      initialIsReviewing={initialIsReviewing}
      isCompleted={isCompleted}
      initialDynamicQuestions={initialDynamicQuestions}
      hasGeneratedDocument={hasGeneratedDocument}
      isRegenerationPending={isRegenerationPending}
      onSaveProgress={handleSaveProgress}
      onSaveTitle={handleSaveTitle}
      onComplete={handleComplete}
      onRegenerate={handleRegenerate}
    />
  );
};
