import { Email } from '@go-agree/domain';
import type { AuthPort, AuthResultDTO, LoginWithEmailInput } from '../../ports/AuthPort.js';

export class LoginWithEmailUseCase {
  constructor(private readonly authPort: AuthPort) {}

  async execute(input: LoginWithEmailInput): Promise<AuthResultDTO> {
    const emailVO = new Email(input.email);

    return this.authPort.loginWithEmail({
      email: emailVO.value,
      password: input.password,
    });
  }
}
