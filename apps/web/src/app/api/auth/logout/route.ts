import { NextResponse } from 'next/server';
import { LogoutUseCase } from '@go-agree/application';
import { getServerAuthAdapter } from '@/lib/auth';
import { es } from '@/locales/es';

export async function POST() {
  try {
    const authAdapter = getServerAuthAdapter();
    const logoutUseCase = new LogoutUseCase(authAdapter);
    await logoutUseCase.execute();

    return NextResponse.json({
      success: true,
      redirectTo: '/',
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: es.errors.genericError || error.message },
      { status: 500 }
    );
  }
}
