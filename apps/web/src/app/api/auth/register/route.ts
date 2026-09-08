import { NextResponse } from 'next/server';
import { RegisterUserUseCase } from '@go-agree/application';
import {
  DomainAuthError,
  UserAlreadyExistsError,
  WeakPasswordError,
  InvalidEmailError,
} from '@go-agree/domain';
import { getServerAuthAdapter } from '@/lib/auth';
import { es } from '@/locales/es';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const authAdapter = getServerAuthAdapter();
    const useCase = new RegisterUserUseCase(authAdapter);

    const result = await useCase.execute({
      email: body.email,
      password: body.password,
    });

    return NextResponse.json(
      {
        user: result.user,
        redirectTo: '/dashboard',
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof UserAlreadyExistsError) {
      return NextResponse.json(
        { error: error.code, message: es.errors.userAlreadyExists },
        { status: 409 }
      );
    }
    if (error instanceof WeakPasswordError) {
      return NextResponse.json(
        { error: error.code, message: es.errors.weakPassword },
        { status: 400 }
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
