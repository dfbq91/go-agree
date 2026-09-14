import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerAuthAdapter } from '@/lib/auth';
import { getServerContractRepository } from '@/lib/contracts';
import { getServerSubscriptionRepository } from '@/lib/subscription';
import { CompleteQuestionnaireUseCase, ConsumeContractQuotaUseCase } from '@go-agree/application';
import type { ContractProgressPort } from '@go-agree/application';
import {
  ContractNotFoundError,
  UnauthorizedContractAccessError,
  FreeQuotaExceededError,
} from '@go-agree/domain';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authAdapter = getServerAuthAdapter();
    const session = await authAdapter.getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'No authenticated session found' },
        { status: 401 }
      );
    }

    const repo = getServerContractRepository() as unknown as ContractProgressPort;
    const existing = await repo.getContractById(params.id, session.userId);
    if (!existing) {
      return NextResponse.json(
        { code: 'CONTRACT_NOT_FOUND', message: 'Contract not found' },
        { status: 404 }
      );
    }

    // Idempotency: If contract is already completed, do not deduct quota again
    if (existing.status === 'completed') {
      try {
        revalidatePath('/dashboard');
      } catch {
        // Safe fallback in test environments
      }
      return NextResponse.json(existing);
    }

    // Consume contract generation quota only for uncompleted contracts
    const subRepo = getServerSubscriptionRepository();
    const quotaUseCase = new ConsumeContractQuotaUseCase(subRepo);
    await quotaUseCase.execute({ userId: session.userId });

    const useCase = new CompleteQuestionnaireUseCase(repo);
    const completed = await useCase.execute({
      contractId: params.id,
      userId: session.userId,
    });

    try {
      revalidatePath('/dashboard');
    } catch {
      // Safe fallback in test environments
    }

    return NextResponse.json(completed);
  } catch (error: any) {
    if (error instanceof FreeQuotaExceededError || error?.code === 'FREE_QUOTA_EXCEEDED') {
      return NextResponse.json(
        { code: 'FREE_QUOTA_EXCEEDED', message: error.message },
        { status: 403 }
      );
    }
    if (error instanceof ContractNotFoundError || error?.code === 'CONTRACT_NOT_FOUND') {
      return NextResponse.json(
        { code: error.code || 'CONTRACT_NOT_FOUND', message: error.message },
        { status: 404 }
      );
    }
    if (error instanceof UnauthorizedContractAccessError || error?.code === 'UNAUTHORIZED_ACCESS') {
      return NextResponse.json(
        { code: error.code || 'UNAUTHORIZED_ACCESS', message: error.message },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: error.message },
      { status: 500 }
    );
  }
}
