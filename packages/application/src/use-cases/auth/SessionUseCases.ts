import type { AuthPort, UserSessionDTO } from '../../ports/AuthPort.js';

export class LogoutUseCase {
  constructor(private readonly authPort: AuthPort) {}

  async execute(): Promise<void> {
    await this.authPort.logout();
  }
}

export class GetSessionUseCase {
  constructor(private readonly authPort: AuthPort) {}

  async execute(): Promise<UserSessionDTO | null> {
    return this.authPort.getCurrentSession();
  }
}
