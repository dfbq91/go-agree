'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import type { QuestionDTO } from '@go-agree/application';
import { QuestionnaireContainer } from './QuestionnaireContainer';

export interface QuestionnaireClientPageProps {
  contractId: string;
  initialTitle: string;
  initialAnswers: Record<string, unknown>;
  initialQuestionIndex: number;
  initialIsReviewing?: boolean;
  isCompleted?: boolean;
  initialDynamicQuestions?: QuestionDTO[];
}

export const QuestionnaireClientPage: React.FC<QuestionnaireClientPageProps> = ({
  contractId,
  initialTitle,
  initialAnswers,
  initialQuestionIndex,
  initialIsReviewing = false,
  isCompleted = false,
  initialDynamicQuestions = [],
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
        throw new Error(data.message || 'Failed to complete questionnaire');
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

  return (
    <QuestionnaireContainer
      contractId={contractId}
      initialTitle={initialTitle}
      initialAnswers={initialAnswers}
      initialQuestionIndex={initialQuestionIndex}
      initialIsReviewing={initialIsReviewing}
      isCompleted={isCompleted}
      initialDynamicQuestions={initialDynamicQuestions}
      onSaveProgress={handleSaveProgress}
      onSaveTitle={handleSaveTitle}
      onComplete={handleComplete}
    />
  );
};
