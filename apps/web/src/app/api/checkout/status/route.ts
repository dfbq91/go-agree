import { NextResponse } from 'next/server';
import { getServerAuthAdapter } from '@/lib/auth';
import { getServerPaymentRepository } from '@/lib/payments';
import { GetTransactionStatusUseCase } from '@go-agree/application';

export async function GET(request: Request) {
  try {
    const authAdapter = getServerAuthAdapter();
    const session = await authAdapter.getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'No authenticated session found' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference') || searchParams.get('id');

    if (!reference) {
      return NextResponse.json(
        { code: 'MISSING_REFERENCE', message: 'Reference parameter is required' },
        { status: 400 }
      );
    }

    const paymentRepo = getServerPaymentRepository();
    const useCase = new GetTransactionStatusUseCase(paymentRepo);
    const result = await useCase.execute({
      reference,
      userId: session.userId,
    });

    if (!result) {
      return NextResponse.json(
        { code: 'TRANSACTION_NOT_FOUND', message: 'Transacción no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: error?.message || 'Error checking transaction status' },
      { status: 500 }
    );
  }
}
