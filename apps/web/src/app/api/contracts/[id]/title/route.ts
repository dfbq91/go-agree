import { NextResponse } from 'next/server';
import { getServerAuthAdapter } from '@/lib/auth';
import { getServerContractRepository } from '@/lib/contracts';
import { UpdateTitleUseCase } from '@go-agree/application';
import type { ContractProgressPort } from '@go-agree/application';
import {
  ContractNotFoundError,
  UnauthorizedContractAccessError,
  EmptyTitleError,
} from '@go-agree/domain';

export async function PATCH(
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

    const body = await request.json();
    const repo = getServerContractRepository() as unknown as ContractProgressPort;
    const useCase = new UpdateTitleUseCase(repo);

    const updated = await useCase.execute({
      contractId: params.id,
      userId: session.userId,
      title: body.title,
    });

    return NextResponse.json(updated);
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
    if (error instanceof EmptyTitleError || error?.code === 'EMPTY_TITLE') {
      return NextResponse.json(
        { code: error.code || 'EMPTY_TITLE', message: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: error.message },
      { status: 500 }
    );
  }
}
