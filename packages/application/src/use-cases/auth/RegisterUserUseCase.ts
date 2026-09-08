import { Email, WeakPasswordError } from '@go-agree/domain';
import type { AuthPort, AuthResultDTO, RegisterWithEmailInput } from '../../ports/AuthPort.js';

export class RegisterUserUseCase {
  constructor(private readonly authPort: AuthPort) {}

  async execute(input: RegisterWithEmailInput): Promise<AuthResultDTO> {
    // Validate email value object invariants (throws InvalidEmailError if invalid)
    const emailVO = new Email(input.email);

    // Validate password complexity
    if (!input.password || typeof input.password !== 'string' || input.password.trim().length < 8) {
      throw new WeakPasswordError('Password must contain at least 8 characters');
    }

    return this.authPort.registerWithEmail({
      email: emailVO.value,
      password: input.password,
    });
  }
}
