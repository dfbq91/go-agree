import { createApiErrorResponse, withCorrelationContext } from '@/lib/api-error';
import { getServerAuthAdapter } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { getServerPaymentRepository } from '@/lib/payments';
import { GetTransactionStatusUseCase } from '@go-agree/application';
import { correlationStorage } from '@go-agree/infrastructure';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  return withCorrelationContext(request, async () => {
    try {
      const authAdapter = await getServerAuthAdapter();
      const session = await authAdapter.getCurrentSession();
      if (!session) {
        return createApiErrorResponse('UNAUTHORIZED', 'No authenticated session found', {
          status: 401,
        });
      }

      correlationStorage.setUserId(session.userId);

      const { searchParams } = new URL(request.url);
      const reference = searchParams.get('reference') || searchParams.get('id');

      if (!reference) {
        return createApiErrorResponse('MISSING_REFERENCE', 'Reference parameter is required', {
          status: 400,
        });
      }

      const paymentRepo = await getServerPaymentRepository();
      const useCase = new GetTransactionStatusUseCase(paymentRepo);
      const result = await useCase.execute({
        reference,
        userId: session.userId,
      });

      if (!result) {
        logger.warn('Transaction not found', { reference, userId: session.userId });
        return createApiErrorResponse('TRANSACTION_NOT_FOUND', 'Transacción no encontrada', {
          status: 404,
        });
      }

      if (result.status === 'pending') {
        logger.debug('Transaction status polled (pending)', {
          reference,
          userId: session.userId,
        });
      } else {
        logger.info('Transaction status retrieved', {
          reference,
          userId: session.userId,
          status: result.status,
        });
      }

      return NextResponse.json(result, {
        headers: {
          'x-correlation-id': correlationStorage.getCorrelationId(),
        },
      });
    } catch (error: any) {
      logger.error('Error checking transaction status', { error });
      return createApiErrorResponse(
        'INTERNAL_ERROR',
        error?.message || 'Error checking transaction status',
        { status: 500 }
      );
    }
  });
}
