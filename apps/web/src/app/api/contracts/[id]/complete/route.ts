import { createApiErrorResponse, withCorrelationContext } from '@/lib/api-error';
import { getServerAuthAdapter } from '@/lib/auth';
import { getGenerateContractDocumentUseCase } from '@/lib/document-generation';
import { logger } from '@/lib/logger';
import {
  ContractNotFoundError,
  FreeQuotaExceededError,
  IncompleteQuestionnaireError,
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

      const useCase = await getGenerateContractDocumentUseCase();
      const result = await useCase.execute({
        contractId: id,
        userId: session.userId,
      });

      logger.info('Contract document generated successfully upon completion', {
        contractId: id,
        userId: session.userId,
        formats: result.availableFormats,
      });

      try {
        revalidatePath('/dashboard');
      } catch {
        // Safe fallback in test environments
      }

      return NextResponse.json(result, {
        headers: {
          'x-correlation-id': correlationStorage.getCorrelationId(),
        },
      });
    } catch (error: any) {
      logger.error('Failed to complete contract and generate documents', { error });

      if (
        error instanceof IncompleteQuestionnaireError ||
        error?.code === 'INCOMPLETE_QUESTIONNAIRE'
      ) {
        return createApiErrorResponse('INCOMPLETE_QUESTIONNAIRE', error.message, {
          status: 400,
        });
      }
      if (error instanceof FreeQuotaExceededError || error?.code === 'FREE_QUOTA_EXCEEDED') {
        return createApiErrorResponse('FREE_QUOTA_EXCEEDED', error.message, {
          status: 403,
        });
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
