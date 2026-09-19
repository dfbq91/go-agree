import { QuestionnaireClientPage } from '@/components/questionnaire/QuestionnaireClientPage';
import { getServerDynamicQuestionRepository } from '@/lib/analysis';
import { getServerAuthAdapter } from '@/lib/auth';
import { getServerContractRepository } from '@/lib/contracts';
import { getServerSubscriptionStatus } from '@/lib/subscription';
import type { QuestionDTO } from '@go-agree/application';
import { ContractId } from '@go-agree/domain';
import { redirect } from 'next/navigation';

interface QuestionnairePageProps {
  searchParams: Promise<{ id?: string; contractId?: string; mode?: string }>;
}

export default async function QuestionnairePage({ searchParams }: QuestionnairePageProps) {
  const resolvedSearchParams = (await searchParams) || {};
  const authAdapter = await getServerAuthAdapter();
  const session = await authAdapter.getCurrentSession();

  if (!session) {
    redirect('/login');
  }

  const contractRepo = await getServerContractRepository();
  let contract = null;
  const targetId = resolvedSearchParams.id || resolvedSearchParams.contractId;

  if (targetId) {
    contract = await contractRepo.getByIdAndUserId(targetId, session.userId);
  }

  if (!contract) {
    // Verify subscription quota before creating a new contract
    const subStatus = await getServerSubscriptionStatus(session.userId);
    if (!subStatus.canGenerateContract) {
      redirect('/dashboard');
    }

    // Create new contract generation draft
    const existing = await contractRepo.listByUserId(session.userId);
    const defaultTitle = `Mi Contrato ${existing.length + 1}`;
    const newId = ContractId.generate().value;

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
  const shouldReview = isCompleted || resolvedSearchParams.mode === 'summary';

  const dynamicRepo = getServerDynamicQuestionRepository();
  const existingDynamic = await dynamicRepo.getQuestionsByContractId(contract.id, session.userId);

  const initialDynamicQuestions: QuestionDTO[] = existingDynamic.map((q) => ({
    id: q.questionKey,
    order: q.orderIndex,
    prompt: q.prompt,
    type: q.type,
    isRequired: q.isRequired,
    helpText: q.helpText,
    tooltip: q.tooltip,
    options: q.options,
    condition: q.condition,
  }));

  return (
    <QuestionnaireClientPage
      contractId={contract.id}
      initialTitle={contract.title}
      initialAnswers={contract.answers}
      initialQuestionIndex={contract.currentQuestionIndex}
      initialIsReviewing={shouldReview}
      isCompleted={isCompleted}
      initialDynamicQuestions={initialDynamicQuestions}
      hasGeneratedDocument={isCompleted}
    />
  );
}
