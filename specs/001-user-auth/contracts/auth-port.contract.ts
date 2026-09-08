/**
 * Application Port Contract: AuthPort
 * 
 * Location in Architecture: packages/application/src/ports/AuthPort.ts
 * Implemented by: packages/infrastructure/src/adapters/auth/SupabaseAuthAdapter.ts
 * 
 * Inward Dependency Rule:
 * packages/domain <-- packages/application (defines AuthPort) <-- packages/infrastructure (implements AuthPort)
 */

export type AuthProviderType = 'email_password' | 'google';

export interface UserAccountDTO {
  id: string;
  email: string;
  authProviders: AuthProviderType[];
  createdAt: Date;
  lastLoginAt: Date;
}

export interface UserSessionDTO {
  sessionId: string;
  userId: string;
  expiresAt: Date;
  isValid: boolean;
}

export interface AuthResultDTO {
  user: UserAccountDTO;
  session: UserSessionDTO;
}

export interface RegisterWithEmailInput {
  email: string;
  password: string;
}

export interface LoginWithEmailInput {
  email: string;
  password: string;
}

export interface GoogleAuthUrlResult {
  authUrl: string;
}

export interface HandleOAuthCallbackInput {
  code: string;
}

export interface RequestPasswordResetInput {
  email: string;
  redirectToUrl?: string;
}

/**
 * Domain-specific typed errors (Principle I: Explicit typed domain errors)
 */
export class DomainAuthError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'DomainAuthError';
  }
}

export class UserAlreadyExistsError extends DomainAuthError {
  constructor(email: string) {
    super(`A user with email ${email} already exists`, 'USER_ALREADY_EXISTS');
  }
}

export class InvalidCredentialsError extends DomainAuthError {
  constructor() {
    super('Invalid email or password credentials', 'INVALID_CREDENTIALS');
  }
}

export class WeakPasswordError extends DomainAuthError {
  constructor(reason: string) {
    super(`Password does not satisfy complexity requirements: ${reason}`, 'WEAK_PASSWORD');
  }
}

export class InvalidEmailError extends DomainAuthError {
  constructor(email: string) {
    super(`Invalid email address format: ${email}`, 'INVALID_EMAIL');
  }
}

export class SessionExpiredError extends DomainAuthError {
  constructor() {
    super('The authenticated session has expired or is invalid', 'SESSION_EXPIRED');
  }
}

/**
 * Core AuthPort Interface Contract
 */
export interface AuthPort {
  /**
   * Registers a new user account with email and password and returns the active session.
   * Throws UserAlreadyExistsError if email is taken.
   * Throws WeakPasswordError if password is under 8 characters.
   */
  registerWithEmail(input: RegisterWithEmailInput): Promise<AuthResultDTO>;

  /**
   * Authenticates an existing user via email and password.
   * Throws InvalidCredentialsError if email or password do not match.
   */
  loginWithEmail(input: LoginWithEmailInput): Promise<AuthResultDTO>;

  /**
   * Generates the OAuth authorization URL for "Continuar con Google".
   */
  getGoogleAuthUrl(redirectUrl: string): Promise<GoogleAuthUrlResult>;

  /**
   * Exchanges an OAuth authorization code for an authenticated user session.
   * Automatically links Google to existing account with the same verified email.
   */
  handleOAuthCallback(input: HandleOAuthCallbackInput): Promise<AuthResultDTO>;

  /**
   * Terminates the current active session, invalidating server and client tokens.
   */
  logout(): Promise<void>;

  /**
   * Retrieves the currently authenticated session, or null if unauthenticated.
   * Renews the sliding 30-day expiration window when called.
   */
  getCurrentSession(): Promise<UserSessionDTO | null>;

  /**
   * Triggers a standard platform password reset email.
   * Must not leak whether the email exists (returns void cleanly).
   */
  requestPasswordReset(input: RequestPasswordResetInput): Promise<void>;
}
