import React, { useState, useMemo, useEffect } from 'react';
import { QuestionnaireDefinition } from '@go-agree/domain';
import type { QuestionDTO } from '@go-agree/application';
import { QuestionCard } from './QuestionCard';
import { NavigationControls } from './NavigationControls';
import { SummaryReview } from './SummaryReview';
import { QuestionnaireHeader } from './QuestionnaireHeader';
import { NetworkStatusBanner } from './NetworkStatusBanner';
import { es } from '../../locales/es';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

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
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  // Temporizador para resetear "Guardado" a "idle" tras 2 segundos
  useEffect(() => {
    if (saveStatus === 'saved') {
      const timer = setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  // Calcular las preguntas visibles según las respuestas actuales
  const visibleQuestions = useMemo(() => {
    return questionnaire.getVisibleQuestions(answers);
  }, [questionnaire, answers]);

  const safeIndex = Math.min(Math.max(0, currentIndex), Math.max(0, visibleQuestions.length - 1));
  const currentQuestion = visibleQuestions[safeIndex];

  // 1. handleAnswerChange: SOLO actualiza la memoria local de React
  const handleAnswerChange = (val: unknown) => {
    if (!currentQuestion) return;
    setError(undefined);

    const updatedAnswers = {
      ...answers,
      [currentQuestion.id]: val,
    };

    const pruned = questionnaire.pruneObsoleteAnswers(updatedAnswers);
    setAnswers(pruned);
  };

  // 2. handleNext: Realiza el guardado de forma exclusiva al dar clic en Siguiente
  const handleNext = async () => {
    if (!currentQuestion || isSaving) return;

    const answer = answers[currentQuestion.id];
    const validation = currentQuestion.validate(answer);

    if (!validation.isValid) {
      setError(validation.error || es.questionnaire.requiredField);
      return;
    }

    if (currentQuestion.id === 'q0_party_role' && answer === 'contractor') {
      setError(es.questionnaire.contractorNotice.error);
      return;
    }

    setError(undefined);

    const isLast = safeIndex >= visibleQuestions.length - 1;
    const nextIndex = isLast ? safeIndex : safeIndex + 1;

    // Persistencia exclusiva en "Siguiente"
    if (onSaveProgress) {
      setIsSaving(true);
      setSaveStatus('saving');
      try {
        await onSaveProgress(nextIndex, answers);
        setSaveStatus('saved');
      } catch (err) {
        setSaveStatus('error');
        setError('Error al guardar tu respuesta. Por favor intenta de nuevo.');
        return; // DETENCIÓN: No avanza si falló el guardado
      } finally {
        setIsSaving(false);
      }
    }

    if (isLast) {
      setIsReviewing(true);
      setIsEditingFromSummary(false);
    } else {
      setCurrentIndex(nextIndex);
      setIsEditingFromSummary(false);
    }
  };

  // 3. handlePrevious: Navegación simple hacia atrás (sin guardar)
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

  // 4. Actualizar respuesta cuando viene desde la pantalla de Resumen
  const handleUpdateAndReturnToSummary = async () => {
    if (!currentQuestion || isSaving) return;

    const answer = answers[currentQuestion.id];
    const validation = currentQuestion.validate(answer);

    if (!validation.isValid) {
      setError(validation.error || es.questionnaire.requiredField);
      return;
    }

    if (currentQuestion.id === 'q0_party_role' && answer === 'contractor') {
      setError(es.questionnaire.contractorNotice.error);
      return;
    }

    setError(undefined);

    if (onSaveProgress) {
      setIsSaving(true);
      setSaveStatus('saving');
      try {
        await onSaveProgress(safeIndex, answers);
        setSaveStatus('saved');
      } catch (err) {
        setSaveStatus('error');
        setError('Error al guardar tu respuesta. Por favor intenta de nuevo.');
        return;
      } finally {
        setIsSaving(false);
      }
    }

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

  const handleTitleSave = async (newTitle: string) => {
    setTitle(newTitle);
    if (onSaveTitle) {
      await onSaveTitle(newTitle);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Cabecera con título y estado visual de guardado */}
      <QuestionnaireHeader
        title={title}
        saveStatus={saveStatus}
        onSaveTitle={handleTitleSave}
      />

      <NetworkStatusBanner
        hasError={saveStatus === 'error'}
        onRetry={handleNext}
      />

      {/* Flujo Principal del Cuestionario */}
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
              error={error}
            />

            <NavigationControls
              isFirstQuestion={safeIndex === 0}
              isLastQuestion={safeIndex === visibleQuestions.length - 1}
              onNext={handleNext}
              onPrevious={handlePrevious}
              error={error}
              isLoading={isSaving}
              isEditingFromSummary={isEditingFromSummary}
              onUpdateAnswer={handleUpdateAndReturnToSummary}
            />
          </div>
        )
      )}
    </div>
  );
};
