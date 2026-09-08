import { NextResponse } from 'next/server';
import { getServerAuthAdapter } from '@/lib/auth';
import { getServerContractRepository } from '@/lib/contracts';
import { CompleteQuestionnaireUseCase } from '@go-agree/application';
import type { ContractProgressPort } from '@go-agree/application';
import {
  ContractNotFoundError,
  UnauthorizedContractAccessError,
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
    const useCase = new CompleteQuestionnaireUseCase(repo);

    const completed = await useCase.execute({
      contractId: params.id,
      userId: session.userId,
    });

    return NextResponse.json(completed);
  } catch (error: any) {
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
