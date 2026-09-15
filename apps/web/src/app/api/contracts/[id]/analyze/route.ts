import { getAnalyzeContractUseCase } from '@/lib/analysis';
import { createApiErrorResponse, withCorrelationContext } from '@/lib/api-error';
import { getServerAuthAdapter } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { correlationStorage } from '@go-agree/infrastructure';
import { NextResponse } from 'next/server';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withCorrelationContext(request, async () => {
    try {
      const { id: contractId } = await params;
      correlationStorage.setContractId(contractId);

      const authAdapter = await getServerAuthAdapter();
      const session = await authAdapter.getCurrentSession();

      if (!session) {
        return createApiErrorResponse('UNAUTHORIZED', 'Unauthorized', { status: 401 });
      }

      correlationStorage.setUserId(session.userId);

      const body = await request.json().catch(() => ({}));
      const stage = typeof body.stage === 'number' ? body.stage : 1;

      logger.info('Analyzing contract answers', { contractId, stage, userId: session.userId });

      const useCase = await getAnalyzeContractUseCase();
      const result = await useCase.execute({
        contractId,
        userId: session.userId,
        stage,
      });

      return NextResponse.json(result, {
        status: 200,
        headers: {
          'x-correlation-id': correlationStorage.getCorrelationId(),
        },
      });
    } catch (error: any) {
      logger.error('Error executing contract analysis', { error });
      return createApiErrorResponse(
        'ANALYSIS_ERROR',
        error?.message || 'Error executing contract analysis',
        { status: 500 }
      );
    }
  });
}
