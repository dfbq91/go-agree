import React, { useState, useMemo, useEffect, useRef } from 'react';
import { QuestionnaireDefinition } from '@go-agree/domain';
import type { QuestionDTO } from '@go-agree/application';
import { QuestionCard } from './QuestionCard';
import { NavigationControls } from './NavigationControls';
import { SummaryReview } from './SummaryReview';
import { QuestionnaireHeader } from './QuestionnaireHeader';
import { NetworkStatusBanner } from './NetworkStatusBanner';
import { es } from '../../locales/es';

import { useAutosave } from '../../hooks/useAutosave';

export interface QuestionnaireContainerProps {
  contractId: string;
  initialTitle?: string;
  initialAnswers?: Record<string, unknown>;
  initialQuestionIndex?: number;
  initialIsReviewing?: boolean;
  isCompleted?: boolean;
  onSaveProgress?: (index: number, answers: Record<string, unknown>) => Promise<void>;
  onSaveTitle?: (newTitle: string) => Promise<void>;
  onComplete?: () => Promise<void>;
}

export const QuestionnaireContainer: React.FC<QuestionnaireContainerProps> = ({
  contractId,
  initialTitle = 'Mi Contrato',
  initialAnswers = {},
  initialQuestionIndex = 0,
  initialIsReviewing = false,
  isCompleted = false,
  onSaveProgress,
  onSaveTitle,
  onComplete,
}) => {
  const questionnaire = useMemo(() => QuestionnaireDefinition.createStandard(), []);

  const [answers, setAnswers] = useState<Record<string, unknown>>(initialAnswers);
  const [currentIndex, setCurrentIndex] = useState<number>(initialQuestionIndex);
  const [isReviewing, setIsReviewing] = useState<boolean>(initialIsReviewing);
  const [isEditingFromSummary, setIsEditingFromSummary] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState<string>(initialTitle);
  const [isCompleting, setIsCompleting] = useState<boolean>(false);

  // Compute visible questions based on current answers
  const visibleQuestions = useMemo(() => {
    return questionnaire.getVisibleQuestions(answers);
  }, [questionnaire, answers]);

  // Ensure index is within visible range
  const safeIndex = Math.min(Math.max(0, currentIndex), Math.max(0, visibleQuestions.length - 1));
  const currentQuestion = visibleQuestions[safeIndex];

  const {
    saveStatus,
    triggerAutosave,
    saveDirectly,
    flush,
  } = useAutosave<{ index: number; answers: Record<string, unknown> }>({
    onSave: async ({ index, answers: toSave }) => {
      if (onSaveProgress) {
        await onSaveProgress(index, toSave);
      }
    },
    debounceMs: 400,
    localFallbackKey: `draft_contract_${contractId}`,
  });

  const handleAnswerChange = (val: unknown) => {
    if (!currentQuestion) return;
    setError(undefined);

    const updatedAnswers = {
      ...answers,
      [currentQuestion.id]: val,
    };

    // Prune obsolete answers if conditions changed
    const pruned = questionnaire.pruneObsoleteAnswers(updatedAnswers);
    setAnswers(pruned);

    // If choice question, save immediately
    if (currentQuestion.type === 'single_choice' || currentQuestion.type === 'checkbox') {
      saveDirectly({ index: safeIndex, answers: pruned });
    } else {
      // Debounce autosave for text input (400ms)
      triggerAutosave({ index: safeIndex, answers: pruned });
    }
  };

  const handleBlur = () => {
    flush();
  };

  const handleNext = () => {
    if (!currentQuestion) return;

    const answer = answers[currentQuestion.id];
    const validation = currentQuestion.validate(answer);

    if (!validation.isValid) {
      setError(validation.error || es.questionnaire.requiredField);
      return;
    }

    setError(undefined);

    if (safeIndex >= visibleQuestions.length - 1) {
      setIsReviewing(true);
      setIsEditingFromSummary(false);
      saveDirectly({ index: safeIndex, answers });
    } else {
      const nextIndex = safeIndex + 1;
      setCurrentIndex(nextIndex);
      setIsEditingFromSummary(false);
      saveDirectly({ index: nextIndex, answers });
    }
  };

  const handlePrevious = () => {
    setError(undefined);
    if (isReviewing) {
      setIsReviewing(false);
      setIsEditingFromSummary(false);
      return;
    }
    if (safeIndex > 0) {
      const prevIndex = safeIndex - 1;
      setCurrentIndex(prevIndex);
      setIsEditingFromSummary(false);
      saveDirectly({ index: prevIndex, answers });
    }
  };

  const handleEditFromSummary = (questionId: string) => {
    const targetIndex = visibleQuestions.findIndex((q) => q.id === questionId);
    if (targetIndex >= 0) {
      setCurrentIndex(targetIndex);
      setIsReviewing(false);
      setIsEditingFromSummary(true);
    }
  };

  const handleUpdateAndReturnToSummary = () => {
    if (!currentQuestion) return;

    const answer = answers[currentQuestion.id];
    const validation = currentQuestion.validate(answer);

    if (!validation.isValid) {
      setError(validation.error || es.questionnaire.requiredField);
      return;
    }

    setError(undefined);
    saveDirectly({ index: safeIndex, answers });
    setIsReviewing(true);
    setIsEditingFromSummary(false);
  };

  const handleConfirmSummary = async () => {
    if (onComplete) {
      setIsCompleting(true);
      try {
        await onComplete();
      } finally {
        setIsCompleting(false);
      }
    }
  };

  // Title editing handler
  const handleTitleSave = async (newTitle: string) => {
    setTitle(newTitle);
    if (onSaveTitle) {
      await onSaveTitle(newTitle);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header with Title and Autosave Status */}
      <QuestionnaireHeader
        title={title}
        saveStatus={saveStatus}
        onSaveTitle={handleTitleSave}
      />

      <NetworkStatusBanner
        hasError={saveStatus === 'error'}
        onRetry={handleBlur}
      />

      {/* Main Questionnaire Flow */}
      {isReviewing ? (
        <SummaryReview
          questions={visibleQuestions.map((q) => q.toJSON() as QuestionDTO)}
          answers={answers}
          onEdit={handleEditFromSummary}
          onConfirm={handleConfirmSummary}
          isSubmitting={isCompleting}
          isCompleted={isCompleted}
        />
      ) : (
        currentQuestion && (
          <div>
            <QuestionCard
              question={currentQuestion.toJSON() as QuestionDTO}
              value={answers[currentQuestion.id]}
              onChange={handleAnswerChange}
              onBlur={handleBlur}
              error={error}
            />

            <NavigationControls
              isFirstQuestion={safeIndex === 0}
              isLastQuestion={safeIndex === visibleQuestions.length - 1}
              onNext={handleNext}
              onPrevious={handlePrevious}
              error={error}
              isEditingFromSummary={isEditingFromSummary}
              onUpdateAnswer={handleUpdateAndReturnToSummary}
            />
          </div>
        )
      )}
    </div>
  );
};
