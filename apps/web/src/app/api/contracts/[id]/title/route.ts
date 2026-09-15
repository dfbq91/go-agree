import { createApiErrorResponse, withCorrelationContext } from '@/lib/api-error';
import { getServerAuthAdapter } from '@/lib/auth';
import { getServerContractRepository } from '@/lib/contracts';
import { logger } from '@/lib/logger';
import { UpdateTitleUseCase } from '@go-agree/application';
import type { ContractProgressPort } from '@go-agree/application';
import {
  ContractNotFoundError,
  EmptyTitleError,
  UnauthorizedContractAccessError,
} from '@go-agree/domain';
import { correlationStorage } from '@go-agree/infrastructure';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

      const body = await request.json();
      const repo = (await getServerContractRepository()) as unknown as ContractProgressPort;
      const useCase = new UpdateTitleUseCase(repo);

      const updated = await useCase.execute({
        contractId: id,
        userId: session.userId,
        title: body.title,
      });

      logger.info('Contract title updated via title route', {
        contractId: id,
        userId: session.userId,
      });

      return NextResponse.json(updated, {
        headers: {
          'x-correlation-id': correlationStorage.getCorrelationId(),
        },
      });
    } catch (error: any) {
      logger.error('Failed to update contract title', { error });
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
      if (error instanceof EmptyTitleError || error?.code === 'EMPTY_TITLE') {
        return createApiErrorResponse(error.code || 'EMPTY_TITLE', error.message, { status: 400 });
      }
      return createApiErrorResponse('INTERNAL_ERROR', error.message || 'Internal server error', {
        status: 500,
      });
    }
  });
}
