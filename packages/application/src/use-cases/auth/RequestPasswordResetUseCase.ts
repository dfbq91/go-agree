import { Email } from '@go-agree/domain';
import type { AuthPort, RequestPasswordResetInput } from '../../ports/AuthPort.js';

export class RequestPasswordResetUseCase {
  constructor(private readonly authPort: AuthPort) {}

  async execute(input: RequestPasswordResetInput): Promise<void> {
    const emailVO = new Email(input.email);

    await this.authPort.requestPasswordReset({
      email: emailVO.value,
      redirectToUrl: input.redirectToUrl,
    });
  }
}
