import { createApiErrorResponse, withCorrelationContext } from '@/lib/api-error';
import { getServerAuthAdapter } from '@/lib/auth';
import { getServerContractRepository } from '@/lib/contracts';
import { logger } from '@/lib/logger';
import { correlationStorage } from '@go-agree/infrastructure';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withCorrelationContext(request, async () => {
    try {
      const { id } = await params;
      correlationStorage.setContractId(id);

      const url = new URL(request.url);
      const format = url.searchParams.get('format')?.toLowerCase();

      if (!format || (format !== 'pdf' && format !== 'docx')) {
        logger.error('Invalid format requested for contract download', { contractId: id, format });
        return createApiErrorResponse(
          'VALIDATION_ERROR',
          'Formato no soportado. Los formatos disponibles son pdf y docx.',
          { status: 400 }
        );
      }

      const authAdapter = await getServerAuthAdapter();
      const session = await authAdapter.getCurrentSession();
      if (!session) {
        logger.error('No authenticated session found for contract download', { contractId: id });
        return createApiErrorResponse('UNAUTHORIZED', 'No authenticated session found', {
          status: 401,
        });
      }

      correlationStorage.setUserId(session.userId);

      const repo = await getServerContractRepository();
      const contract = await repo.getByIdAndUserId(id, session.userId);

      if (!contract) {
        logger.warn('Contract not found for download', { contractId: id, userId: session.userId });
        return createApiErrorResponse('NOT_FOUND', `Contract with ID ${id} not found`, {
          status: 404,
        });
      }

      if (contract.status === 'in_progress') {
        logger.warn('Attempted to download contract document while still in progress', {
          contractId: id,
        });
        return createApiErrorResponse(
          'BAD_REQUEST',
          'El documento aún no ha sido generado para este contrato',
          { status: 400 }
        );
      }

      // Generate downloadable representation
      const correlationId = correlationStorage.getCorrelationId();
      if (format === 'pdf') {
        const dummyPdfContent = `%PDF-1.4\n1 0 obj\n<< /Title (${contract.title}) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF`;
        return new NextResponse(dummyPdfContent, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="contrato-${id}.pdf"`,
            'x-correlation-id': correlationId,
          },
        });
      }

      // format === 'docx'
      const dummyDocxContent = `PK\x03\x04Contract Document: ${contract.title}`;
      return new NextResponse(dummyDocxContent, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="contrato-${id}.docx"`,
          'x-correlation-id': correlationId,
        },
      });
    } catch (err: any) {
      logger.error('Failed to download contract document', { error: err });
      return createApiErrorResponse(
        'INTERNAL_ERROR',
        err.message || 'Failed to download contract document',
        { status: 500 }
      );
    }
  });
}
