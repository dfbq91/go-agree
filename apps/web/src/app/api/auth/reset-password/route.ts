import { NextResponse } from 'next/server';
import { RequestPasswordResetUseCase } from '@go-agree/application';
import { InvalidEmailError, DomainAuthError } from '@go-agree/domain';
import { getServerAuthAdapter } from '@/lib/auth';
import { es } from '@/locales/es';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const authAdapter = getServerAuthAdapter();
    const useCase = new RequestPasswordResetUseCase(authAdapter);

    await useCase.execute({
      email: body.email,
    });

    // Enumeration-safe: Always return standard message
    return NextResponse.json({
      message: es.auth.resetEmailSentSuccess,
    });
  } catch (error: any) {
    if (error instanceof InvalidEmailError) {
      return NextResponse.json(
        { error: error.code, message: es.errors.invalidEmail },
        { status: 400 }
      );
    }
    if (error instanceof DomainAuthError) {
      return NextResponse.json(
        { error: error.code, message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: es.errors.genericError },
      { status: 500 }
    );
  }
}
