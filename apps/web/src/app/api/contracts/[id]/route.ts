import { NextResponse } from 'next/server';
import { getServerAuthAdapter } from '@/lib/auth';
import { getServerContractRepository } from '@/lib/contracts';
import type { ContractProgressPort } from '@go-agree/application';

export async function GET(
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
    const contract = await repo.getContractById(params.id, session.userId);

    if (!contract) {
      return NextResponse.json(
        { code: 'NOT_FOUND', message: `Contract with ID ${params.id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(contract);
  } catch (err: any) {
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: err.message },
      { status: 500 }
    );
  }
}
