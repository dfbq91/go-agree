import { createApiErrorResponse, withCorrelationContext } from '@/lib/api-error';
import { getServerAuthAdapter } from '@/lib/auth';
import { getServerContractRepository } from '@/lib/contracts';
import { logger } from '@/lib/logger';
import { getServerSubscriptionRepository } from '@/lib/subscription';
import { CompleteQuestionnaireUseCase, ConsumeContractQuotaUseCase } from '@go-agree/application';
import type { ContractProgressPort } from '@go-agree/application';
import {
  ContractNotFoundError,
  FreeQuotaExceededError,
  UnauthorizedContractAccessError,
} from '@go-agree/domain';
import { correlationStorage } from '@go-agree/infrastructure';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withCorrelationContext(request, async () => {
    try {
      const { id } = await params;
      correlationStorage.setContractId(id);

      const authAdapter = await getServerAuthAdapter();
      const session = await authAdapter.getCurrentSession();
      if (!session) {
        return createApiErrorResponse('UNAUTHORIZED', 'No authenticated session found', {
          status: 401,
        });
      }

      correlationStorage.setUserId(session.userId);

      const repo = (await getServerContractRepository()) as unknown as ContractProgressPort;
      const existing = await repo.getContractById(id, session.userId);
      if (!existing) {
        return createApiErrorResponse('CONTRACT_NOT_FOUND', 'Contract not found', { status: 404 });
      }

      // Idempotency: If contract is already completed, do not deduct quota again
      if (existing.status === 'completed') {
        try {
          revalidatePath('/dashboard');
        } catch {
          // Safe fallback in test environments
        }
        return NextResponse.json(existing, {
          headers: {
            'x-correlation-id': correlationStorage.getCorrelationId(),
          },
        });
      }

      // Consume contract generation quota only for uncompleted contracts
      const subRepo = await getServerSubscriptionRepository();
      const quotaUseCase = new ConsumeContractQuotaUseCase(subRepo);
      await quotaUseCase.execute({ userId: session.userId });

      const useCase = new CompleteQuestionnaireUseCase(repo);
      const completed = await useCase.execute({
        contractId: id,
        userId: session.userId,
      });

      logger.info('Contract completed successfully', { contractId: id, userId: session.userId });

      try {
        revalidatePath('/dashboard');
      } catch {
        // Safe fallback in test environments
      }

      return NextResponse.json(completed, {
        headers: {
          'x-correlation-id': correlationStorage.getCorrelationId(),
        },
      });
    } catch (error: any) {
      logger.error('Failed to complete contract', { error });
      if (error instanceof FreeQuotaExceededError || error?.code === 'FREE_QUOTA_EXCEEDED') {
        return createApiErrorResponse('FREE_QUOTA_EXCEEDED', error.message, { status: 403 });
      }
      if (error instanceof ContractNotFoundError || error?.code === 'CONTRACT_NOT_FOUND') {
        return createApiErrorResponse(error.code || 'CONTRACT_NOT_FOUND', error.message, {
          status: 404,
        });
      }
      if (
        error instanceof UnauthorizedContractAccessError ||
        error?.code === 'UNAUTHORIZED_ACCESS'
      ) {
        return createApiErrorResponse(error.code || 'UNAUTHORIZED_ACCESS', error.message, {
          status: 403,
        });
      }
      return createApiErrorResponse('INTERNAL_ERROR', error.message || 'Internal server error', {
        status: 500,
      });
    }
  });
}
