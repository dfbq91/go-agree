import { createApiErrorResponse, withCorrelationContext } from '@/lib/api-error';
import { getServerAuthAdapter } from '@/lib/auth';
import { getServerContractRepository } from '@/lib/contracts';
import { logger } from '@/lib/logger';
import { DeleteContractUseCase } from '@go-agree/application';
import type { ContractProgressPort } from '@go-agree/application';
import { correlationStorage } from '@go-agree/infrastructure';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
      const contract = await repo.getContractById(id, session.userId);

      if (!contract) {
        logger.warn('Contract not found', { contractId: id, userId: session.userId });
        return createApiErrorResponse('NOT_FOUND', `Contract with ID ${id} not found`, {
          status: 404,
        });
      }

      logger.debug('Contract retrieved successfully', { contractId: id, userId: session.userId });
      return NextResponse.json(contract, {
        headers: {
          'x-correlation-id': correlationStorage.getCorrelationId(),
        },
      });
    } catch (err: any) {
      logger.error('Failed to retrieve contract', { error: err });
      return createApiErrorResponse(
        'INTERNAL_ERROR',
        err.message || 'Failed to retrieve contract',
        { status: 500 }
      );
    }
  });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

      const repo = await getServerContractRepository();
      const deleteUseCase = new DeleteContractUseCase(repo);

      await deleteUseCase.execute({ contractId: id, userId: session.userId });

      logger.info('Contract deleted successfully', { contractId: id, userId: session.userId });
      return NextResponse.json(
        { success: true, contractId: id, deletedId: id },
        {
          headers: {
            'x-correlation-id': correlationStorage.getCorrelationId(),
          },
        }
      );
    } catch (err: any) {
      logger.error('Failed to delete contract', { error: err });
      if (err.message?.includes('not found')) {
        return createApiErrorResponse('NOT_FOUND', err.message, { status: 404 });
      }
      return createApiErrorResponse('INTERNAL_ERROR', err.message || 'Failed to delete contract', {
        status: 500,
      });
    }
  });
}
