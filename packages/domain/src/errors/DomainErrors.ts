/**
 * Domain-specific typed errors (Principle I: Explicit typed domain errors)
 */
export class DomainAuthError extends Error {
  constructor(message: string, public readonly code: string = 'DOMAIN_AUTH_ERROR') {
    super(message);
    this.name = 'DomainAuthError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class UserAlreadyExistsError extends DomainAuthError {
  constructor(email: string) {
    super(`A user with email ${email} already exists`, 'USER_ALREADY_EXISTS');
    this.name = 'UserAlreadyExistsError';
  }
}

export class InvalidCredentialsError extends DomainAuthError {
  constructor() {
    super('Invalid email or password credentials', 'INVALID_CREDENTIALS');
    this.name = 'InvalidCredentialsError';
  }
}

export class WeakPasswordError extends DomainAuthError {
  constructor(reason: string) {
    super(`Password does not satisfy complexity requirements: ${reason}`, 'WEAK_PASSWORD');
    this.name = 'WeakPasswordError';
  }
}

export class InvalidEmailError extends DomainAuthError {
  constructor(email: string) {
    super(`Invalid email address format: ${email}`, 'INVALID_EMAIL');
    this.name = 'InvalidEmailError';
  }
}

export class SessionExpiredError extends DomainAuthError {
  constructor() {
    super('The authenticated session has expired or is invalid', 'SESSION_EXPIRED');
    this.name = 'SessionExpiredError';
  }
}

export class UnauthorizedAccessError extends DomainAuthError {
  constructor(resource: string) {
    super(`Unauthorized access to resource: ${resource}`, 'UNAUTHORIZED_ACCESS');
    this.name = 'UnauthorizedAccessError';
  }
}
