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

interface StoredUser {
  id: string;
  email: string;
  password: string;
  authProviders: ('email_password' | 'google')[];
  createdAt: Date;
  lastLoginAt: Date;
}

export class MockAuthAdapter implements AuthPort {
  private users: Map<string, StoredUser> = new Map();
  private activeSession: UserSessionDTO | null = null;

  async registerWithEmail(input: RegisterWithEmailInput): Promise<AuthResultDTO> {
    if (this.users.has(input.email)) {
      throw new UserAlreadyExistsError(input.email);
    }
    if (!input.password || input.password.length < 8) {
      throw new WeakPasswordError('Password must be at least 8 characters');
    }

    const userId = `mock-user-${Date.now()}`;
    const user: StoredUser = {
      id: userId,
      email: input.email,
      password: input.password,
      authProviders: ['email_password'],
      createdAt: new Date(),
      lastLoginAt: new Date(),
    };

    this.users.set(input.email, user);

    const session: UserSessionDTO = {
      sessionId: `mock-session-${Date.now()}`,
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isValid: true,
    };
    this.activeSession = session;

    return {
      user: {
        id: user.id,
        email: user.email,
        authProviders: user.authProviders,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
      session,
    };
  }

  async loginWithEmail(input: LoginWithEmailInput): Promise<AuthResultDTO> {
    const user = this.users.get(input.email);
    if (!user || user.password !== input.password) {
      throw new InvalidCredentialsError();
    }

    user.lastLoginAt = new Date();

    const session: UserSessionDTO = {
      sessionId: `mock-session-${Date.now()}`,
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isValid: true,
    };
    this.activeSession = session;

    return {
      user: {
        id: user.id,
        email: user.email,
        authProviders: user.authProviders,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
      session,
    };
  }

  async getGoogleAuthUrl(redirectUrl: string): Promise<GoogleAuthUrlResult> {
    return {
      authUrl: `https://accounts.google.com/o/oauth2/v2/auth?client_id=mock&redirect_uri=${encodeURIComponent(
        redirectUrl
      )}`,
    };
  }

  async handleOAuthCallback(_input: HandleOAuthCallbackInput): Promise<AuthResultDTO> {
    const email = 'google-user@example.com';
    let user = this.users.get(email);

    if (!user) {
      user = {
        id: `mock-google-user-${Date.now()}`,
        email,
        password: '',
        authProviders: ['google'],
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };
      this.users.set(email, user);
    } else {
      if (!user.authProviders.includes('google')) {
        user.authProviders.push('google');
      }
      user.lastLoginAt = new Date();
    }

    const session: UserSessionDTO = {
      sessionId: `mock-session-${Date.now()}`,
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isValid: true,
    };
    this.activeSession = session;

    return {
      user: {
        id: user.id,
        email: user.email,
        authProviders: user.authProviders,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
      session,
    };
  }

  async logout(): Promise<void> {
    this.activeSession = null;
  }

  async getCurrentSession(): Promise<UserSessionDTO | null> {
    if (!this.activeSession) return null;
    if (new Date() > this.activeSession.expiresAt) {
      this.activeSession = null;
      return null;
    }
    // 30 days sliding refresh
    this.activeSession.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return this.activeSession;
  }

  async requestPasswordReset(_input: RequestPasswordResetInput): Promise<void> {
    // Enumeration-safe: completes cleanly
  }
}
