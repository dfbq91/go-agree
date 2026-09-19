import { createApiErrorResponse, withCorrelationContext } from '@/lib/api-error';
import { getServerAuthAdapter } from '@/lib/auth';
import { getRegenerateContractDocumentUseCase } from '@/lib/document-generation';
import { logger } from '@/lib/logger';
import {
  ContractNotFoundError,
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

      const useCase = await getRegenerateContractDocumentUseCase();
      const result = await useCase.execute({
        contractId: id,
        userId: session.userId,
      });

      logger.info('Contract document regenerated successfully', {
        contractId: id,
        userId: session.userId,
        formats: result.availableFormats,
        regeneratedAt: result.regeneratedAt,
      });

      try {
        revalidatePath('/dashboard');
        revalidatePath(`/questionnaire?id=${id}`);
      } catch {
        // Safe fallback in test environments
      }

      return NextResponse.json(result, {
        headers: {
          'x-correlation-id': correlationStorage.getCorrelationId(),
        },
      });
    } catch (error: any) {
      logger.error('Failed to regenerate contract documents', { error });

      if (error instanceof IncompleteQuestionnaireError || error?.code === 'INCOMPLETE_QUESTIONNAIRE') {
        return createApiErrorResponse('INCOMPLETE_QUESTIONNAIRE', error.message, {
          status: 400,
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
