import type {
  AuthPort,
  AuthResultDTO,
  GoogleAuthUrlResult,
  HandleOAuthCallbackInput,
  LoginWithEmailInput,
  RegisterWithEmailInput,
  RequestPasswordResetInput,
  UserSessionDTO,
} from '@go-agree/application';
import {
  InvalidCredentialsError,
  UserAlreadyExistsError,
  WeakPasswordError,
} from '@go-agree/domain';

export class SupabaseAuthAdapter implements AuthPort {
  constructor(private readonly supabase: any) {}

  async registerWithEmail(input: RegisterWithEmailInput): Promise<AuthResultDTO> {
    if (!input.password || input.password.length < 8) {
      throw new WeakPasswordError('Password must contain at least 8 characters');
    }

    const { data, error } = await this.supabase.auth.signUp({
      email: input.email,
      password: input.password,
    });

    if (error) {
      if (error.message.toLowerCase().includes('already registered')) {
        throw new UserAlreadyExistsError(input.email);
      }
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Registration failed: no user returned');
    }

    const expiresAt = data.session
      ? new Date(data.session.expires_at! * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    return {
      user: {
        id: data.user.id,
        email: data.user.email!,
        authProviders: ['email_password'],
        createdAt: new Date(data.user.created_at),
        lastLoginAt: new Date(),
      },
      session: {
        sessionId: data.session?.access_token || data.user.id,
        userId: data.user.id,
        expiresAt,
        isValid: true,
      },
    };
  }

  async loginWithEmail(input: LoginWithEmailInput): Promise<AuthResultDTO> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error || !data.user || !data.session) {
      throw new InvalidCredentialsError();
    }

    const expiresAt = new Date(data.session.expires_at! * 1000);

    return {
      user: {
        id: data.user.id,
        email: data.user.email!,
        authProviders: (data.user.app_metadata.providers as any) || ['email_password'],
        createdAt: new Date(data.user.created_at),
        lastLoginAt: new Date(),
      },
      session: {
        sessionId: data.session.access_token,
        userId: data.user.id,
        expiresAt,
        isValid: true,
      },
    };
  }

  async getGoogleAuthUrl(redirectUrl: string): Promise<GoogleAuthUrlResult> {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error || !data.url) {
      throw new Error(error?.message || 'Failed to generate Google OAuth URL');
    }

    return {
      authUrl: data.url,
    };
  }

  async handleOAuthCallback(input: HandleOAuthCallbackInput): Promise<AuthResultDTO> {
    const { data, error } = await this.supabase.auth.exchangeCodeForSession(input.code);

    if (error || !data.user || !data.session) {
      throw new Error(error?.message || 'Failed to exchange OAuth code for session');
    }

    const expiresAt = new Date(data.session.expires_at! * 1000);

    return {
      user: {
        id: data.user.id,
        email: data.user.email!,
        authProviders: ['google'],
        createdAt: new Date(data.user.created_at),
        lastLoginAt: new Date(),
      },
      session: {
        sessionId: data.session.access_token,
        userId: data.user.id,
        expiresAt,
        isValid: true,
      },
    };
  }

  async logout(): Promise<void> {
    await this.supabase.auth.signOut();
  }

  async getCurrentSession(): Promise<UserSessionDTO | null> {
    const { data, error } = await this.supabase.auth.getSession();
    if (error || !data.session) {
      return null;
    }

    const expiresAt = new Date(data.session.expires_at! * 1000);
    if (new Date() > expiresAt) {
      return null;
    }

    return {
      sessionId: data.session.access_token,
      userId: data.session.user.id,
      expiresAt,
      isValid: true,
    };
  }

  async requestPasswordReset(input: RequestPasswordResetInput): Promise<void> {
    await this.supabase.auth.resetPasswordForEmail(input.email, {
      redirectTo: input.redirectToUrl,
    });
  }
}
