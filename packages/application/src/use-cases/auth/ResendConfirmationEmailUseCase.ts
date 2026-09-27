import { Email } from '@go-agree/domain';
import type { AuthPort, ResendConfirmationEmailInput } from '../../ports/AuthPort.js';

export class ResendConfirmationEmailUseCase {
  constructor(private readonly authPort: AuthPort) {}

  async execute(input: ResendConfirmationEmailInput): Promise<void> {
    const emailVO = new Email(input.email);

    await this.authPort.resendConfirmationEmail({
      email: emailVO.value,
      emailRedirectTo: input.emailRedirectTo,
    });
  }
}
