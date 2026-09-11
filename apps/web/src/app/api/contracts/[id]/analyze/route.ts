import { getAnalyzeContractUseCase } from '@/lib/analysis';
import { getServerAuthAdapter } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authAdapter = getServerAuthAdapter();
    const session = await authAdapter.getCurrentSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contractId = params.id;
    const body = await request.json().catch(() => ({}));
    const stage = typeof body.stage === 'number' ? body.stage : 1;

    const useCase = getAnalyzeContractUseCase();
    const result = await useCase.execute({
      contractId,
      userId: session.userId,
      stage,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Error in /api/contracts/[id]/analyze:', error);
    return NextResponse.json(
      { error: error?.message || 'Error executing contract analysis' },
      { status: 500 }
    );
  }
}
