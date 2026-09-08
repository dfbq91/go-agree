import { NextResponse } from 'next/server';
import { LoginWithEmailUseCase } from '@go-agree/application';
import { InvalidCredentialsError, InvalidEmailError, DomainAuthError } from '@go-agree/domain';
import { getServerAuthAdapter } from '@/lib/auth';
import { es } from '@/locales/es';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const authAdapter = getServerAuthAdapter();
    const useCase = new LoginWithEmailUseCase(authAdapter);

    const result = await useCase.execute({
      email: body.email,
      password: body.password,
    });

    return NextResponse.json({
      user: result.user,
      redirectTo: '/dashboard',
    });
  } catch (error: any) {
    if (error instanceof InvalidCredentialsError) {
      return NextResponse.json(
        { error: error.code, message: es.errors.invalidCredentials },
        { status: 401 }
      );
    }
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
