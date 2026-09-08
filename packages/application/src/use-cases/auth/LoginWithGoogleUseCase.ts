import type {
  AuthPort,
  AuthResultDTO,
  GoogleAuthUrlResult,
  HandleOAuthCallbackInput,
} from '../../ports/AuthPort.js';

export class LoginWithGoogleUseCase {
  constructor(private readonly authPort: AuthPort) {}

  async getAuthorizationUrl(redirectUrl: string): Promise<GoogleAuthUrlResult> {
    return this.authPort.getGoogleAuthUrl(redirectUrl);
  }

  async handleCallback(input: HandleOAuthCallbackInput): Promise<AuthResultDTO> {
    if (!input.code || input.code.trim() === '') {
      throw new Error('Authorization code is required');
    }

    return this.authPort.handleOAuthCallback(input);
  }
}
