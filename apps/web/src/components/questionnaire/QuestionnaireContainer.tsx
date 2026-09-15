import type { QuestionDTO } from '@go-agree/application';
import { ConditionRule, Question, QuestionOption, QuestionnaireDefinition } from '@go-agree/domain';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDynamicQuestionsSubscription } from '../../hooks/useDynamicQuestionsSubscription';
import { es } from '../../locales/es';
import { NavigationControls } from './NavigationControls';
import { NetworkStatusBanner } from './NetworkStatusBanner';
import { QuestionCard } from './QuestionCard';
import { QuestionnaireHeader } from './QuestionnaireHeader';
import { SummaryReview } from './SummaryReview';
import { ANALYSIS_CHECKPOINTS } from './checkpoints';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface QuestionnaireContainerProps {
  contractId: string;
  initialTitle?: string;
  initialAnswers?: Record<string, unknown>;
  initialQuestionIndex?: number;
  initialIsReviewing?: boolean;
  isCompleted?: boolean;
  initialDynamicQuestions?: QuestionDTO[];
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
  initialDynamicQuestions = [],
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
  const [dynamicQuestions, setDynamicQuestions] = useState<Question[]>(() => {
    if (!initialDynamicQuestions || initialDynamicQuestions.length === 0) return [];
    return initialDynamicQuestions.map(
      (dto) =>
        new Question({
          id: dto.id,
          order: dto.order,
          prompt: dto.prompt,
          type: dto.type,
          isRequired: dto.isRequired,
          helpText: dto.helpText,
          tooltip: dto.tooltip,
          options: dto.options?.map((opt) => new QuestionOption(opt)),
          condition: dto.condition ? new ConditionRule(dto.condition) : undefined,
        })
    );
  });
  const [analysisError, setAnalysisError] = useState<string | undefined>(undefined);
  const [failedStage, setFailedStage] = useState<number | null>(null);
  const triggeredStagesRef = useRef<Set<number>>(new Set());

  // Temporizador para resetear "Guardado" a "idle" tras 2 segundos
  useEffect(() => {
    if (saveStatus === 'saved') {
      const timer = setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  const handleNewQuestion = useCallback((newQuestionDTO: QuestionDTO) => {
    setDynamicQuestions((prev) => {
      if (prev.some((q) => q.id === newQuestionDTO.id)) return prev;
      const questionEntity = new Question({
        id: newQuestionDTO.id,
        order: newQuestionDTO.order,
        prompt: newQuestionDTO.prompt,
        type: newQuestionDTO.type,
        isRequired: newQuestionDTO.isRequired,
        helpText: newQuestionDTO.helpText,
        tooltip: newQuestionDTO.tooltip,
        options: newQuestionDTO.options?.map((opt) => new QuestionOption(opt)),
        condition: newQuestionDTO.condition
          ? new ConditionRule(newQuestionDTO.condition)
          : undefined,
      });
      return [...prev, questionEntity];
    });
  }, []);

  // Suscripción en tiempo real a Supabase para recibir preguntas generadas por LLM
  useDynamicQuestionsSubscription({
    contractId,
    onNewQuestion: handleNewQuestion,
  });

  // Calcular las preguntas visibles combinando las estándar con las dinámicas recibidas
  const visibleQuestions = useMemo(() => {
    const standard = questionnaire.getVisibleQuestions(answers);
    const dynamic = dynamicQuestions.filter((q) => q.isVisible(answers));
    return [...standard, ...dynamic].sort((a, b) => a.order - b.order);
  }, [questionnaire, answers, dynamicQuestions]);

  const safeIndex = Math.min(Math.max(0, currentIndex), Math.max(0, visibleQuestions.length - 1));
  const currentQuestion = visibleQuestions[safeIndex];

  // Disparar el análisis en segundo plano tras guardar
  const triggerAnalysisInBackground = async (stage: number) => {
    try {
      setAnalysisError(undefined);
      setFailedStage(null);
      const res = await fetch(`/api/contracts/${contractId}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage }),
      });
      if (!res.ok) {
        throw new Error('Error en el análisis de preguntas');
      }

      const data = await res.json().catch(() => null);
      if (data && data.status === 'generated' && Array.isArray(data.questions)) {
        for (const q of data.questions) {
          handleNewQuestion({
            id: q.questionKey || q.id,
            order: q.orderIndex ?? q.order ?? 20,
            prompt: q.prompt,
            type: q.type,
            isRequired: q.isRequired,
            helpText: q.helpText,
            tooltip: q.tooltip,
            options: q.options,
            condition: q.condition,
          });
        }
      }
    } catch (_err) {
      setAnalysisError('No pudimos generar algunas preguntas adicionales personalizadas.');
      setFailedStage(stage);
    }
  };

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

        // Detectar si la pregunta que acabamos de responder es un checkpoint de análisis
        const checkpoint = ANALYSIS_CHECKPOINTS.find(
          (cp) => cp.triggerQuestionId === currentQuestion.id
        );
        if (checkpoint && !triggeredStagesRef.current.has(checkpoint.stage)) {
          triggeredStagesRef.current.add(checkpoint.stage);
          // Se ejecuta en segundo plano: el usuario avanza de inmediato sin ser bloqueado
          triggerAnalysisInBackground(checkpoint.stage);
        }
      } catch (_err) {
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
      } catch (_err) {
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

  const handleBackToDashboard = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
  };

  const handleConfirmSummary = async () => {
    if (isCompleted) {
      handleBackToDashboard();
      return;
    }
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
      <QuestionnaireHeader title={title} saveStatus={saveStatus} onSaveTitle={handleTitleSave} />

      <NetworkStatusBanner hasError={saveStatus === 'error'} onRetry={handleNext} />

      {/* Flujo Principal del Cuestionario */}
      {isReviewing ? (
        <SummaryReview
          questions={visibleQuestions.map((q) => q.toJSON() as QuestionDTO)}
          answers={answers}
          onEdit={handleEditFromSummary}
          onConfirm={handleConfirmSummary}
          onBackToDashboard={handleBackToDashboard}
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
      {analysisError && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs sm:text-sm text-amber-800 flex items-center justify-between gap-2 animate-fade-in">
          <span>⚠️ {analysisError}</span>
          <button
            type="button"
            onClick={() => triggerAnalysisInBackground(failedStage ?? 1)}
            className="text-xs font-semibold text-amber-900 underline hover:no-underline"
          >
            Reintentar análisis
          </button>
        </div>
      )}
    </div>
  );
};
