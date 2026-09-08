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

export interface AuthPort {
  registerWithEmail(input: RegisterWithEmailInput): Promise<AuthResultDTO>;
  loginWithEmail(input: LoginWithEmailInput): Promise<AuthResultDTO>;
  getGoogleAuthUrl(redirectUrl: string): Promise<GoogleAuthUrlResult>;
  handleOAuthCallback(input: HandleOAuthCallbackInput): Promise<AuthResultDTO>;
  logout(): Promise<void>;
  getCurrentSession(): Promise<UserSessionDTO | null>;
  requestPasswordReset(input: RequestPasswordResetInput): Promise<void>;
}
