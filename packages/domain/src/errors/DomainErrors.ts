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

export class QuestionnaireDomainError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'QuestionnaireDomainError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ContractNotFoundError extends QuestionnaireDomainError {
  constructor(contractId: string) {
    super(`Contract generation with ID ${contractId} not found`, 'CONTRACT_NOT_FOUND');
    this.name = 'ContractNotFoundError';
  }
}

export class UnauthorizedContractAccessError extends QuestionnaireDomainError {
  constructor(contractId: string, userId: string) {
    super(`User ${userId} does not have permission to access contract ${contractId}`, 'UNAUTHORIZED_ACCESS');
    this.name = 'UnauthorizedContractAccessError';
  }
}

export class InvalidAnswerError extends QuestionnaireDomainError {
  constructor(questionId: string, reason: string) {
    super(`Invalid answer for question ${questionId}: ${reason}`, 'INVALID_ANSWER');
    this.name = 'InvalidAnswerError';
  }
}

export class EmptyTitleError extends QuestionnaireDomainError {
  constructor() {
    super('Contract title cannot be empty or whitespace only', 'EMPTY_TITLE');
    this.name = 'EmptyTitleError';
  }
}

