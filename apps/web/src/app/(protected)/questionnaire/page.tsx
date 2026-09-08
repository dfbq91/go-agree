import React from 'react';
import { redirect } from 'next/navigation';
import { getServerAuthAdapter } from '@/lib/auth';
import { getServerContractRepository } from '@/lib/contracts';
import { QuestionnaireClientPage } from '@/components/questionnaire/QuestionnaireClientPage';

interface QuestionnairePageProps {
  searchParams: { id?: string; contractId?: string; mode?: string };
}

export default async function QuestionnairePage({ searchParams }: QuestionnairePageProps) {
  const authAdapter = getServerAuthAdapter();
  const session = await authAdapter.getCurrentSession();

  if (!session) {
    redirect('/login');
  }

  const contractRepo = getServerContractRepository();
  let contract = null;
  const targetId = searchParams.id || searchParams.contractId;

  if (targetId) {
    contract = await contractRepo.getByIdAndUserId(targetId, session.userId);
  }

  if (!contract) {
    // Create new contract generation draft
    const existing = await contractRepo.listByUserId(session.userId);
    const defaultTitle = `Mi Contrato ${existing.length + 1}`;
    const newId = crypto.randomUUID();

    contract = await contractRepo.create({
      id: newId,
      userId: session.userId,
      title: defaultTitle,
      status: 'in_progress',
      currentQuestionIndex: 0,
      answers: {},
    });
  }

  const isCompleted = contract.status === 'completed';
  const shouldReview = isCompleted || searchParams.mode === 'summary';

  return (
    <QuestionnaireClientPage
      contractId={contract.id}
      initialTitle={contract.title}
      initialAnswers={contract.answers}
      initialQuestionIndex={contract.currentQuestionIndex}
      initialIsReviewing={shouldReview}
      isCompleted={isCompleted}
    />
  );
}
