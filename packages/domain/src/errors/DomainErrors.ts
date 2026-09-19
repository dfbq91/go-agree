import { getFreeContractLimit } from '../entities/FreeQuotaConfig.js';

/**
 * Domain-specific typed errors (Principle I: Explicit typed domain errors)
 */
export class DomainAuthError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'DOMAIN_AUTH_ERROR'
  ) {
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
  constructor(
    message: string,
    public readonly code: string
  ) {
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
    super(
      `User ${userId} does not have permission to access contract ${contractId}`,
      'UNAUTHORIZED_ACCESS'
    );
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

export class PaymentDomainError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'PaymentDomainError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class FreeQuotaExceededError extends PaymentDomainError {
  constructor(public readonly limit: number = getFreeContractLimit()) {
    super(
      `Has alcanzado el límite de ${limit} contratos gratuitos. Actualiza a Plan Pro para continuar.`,
      'FREE_QUOTA_EXCEEDED'
    );
    this.name = 'FreeQuotaExceededError';
  }
}

export class ActiveSubscriptionExistsError extends PaymentDomainError {
  constructor() {
    super('Ya cuentas con una suscripción activa a Plan Pro.', 'ACTIVE_SUBSCRIPTION_EXISTS');
    this.name = 'ActiveSubscriptionExistsError';
  }
}

export class InvalidPaymentTransactionError extends PaymentDomainError {
  constructor(reason: string) {
    super(`Transacción de pago inválida: ${reason}`, 'INVALID_PAYMENT_TRANSACTION');
    this.name = 'InvalidPaymentTransactionError';
  }
}

export class PaymentTamperError extends PaymentDomainError {
  constructor(reason: string) {
    super(`Fallo de verificación de integridad en el pago: ${reason}`, 'PAYMENT_TAMPER_DETECTED');
    this.name = 'PaymentTamperError';
  }
}

export class UnsupportedPaymentProviderError extends PaymentDomainError {
  constructor(providerId: string, countryCode: string) {
    super(
      `El proveedor de pago "${providerId}" no está disponible para el país "${countryCode}".`,
      'UNSUPPORTED_PAYMENT_PROVIDER'
    );
    this.name = 'UnsupportedPaymentProviderError';
  }
}

export class DocumentDomainError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'DocumentDomainError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class IncompleteQuestionnaireError extends DocumentDomainError {
  constructor(unansweredQuestionIds?: string[]) {
    const details = unansweredQuestionIds?.length
      ? `: faltan ${unansweredQuestionIds.join(', ')}`
      : '';
    super(
      `No se puede generar el contrato porque existen cláusulas o preguntas sin responder${details}.`,
      'INCOMPLETE_QUESTIONNAIRE'
    );
    this.name = 'IncompleteQuestionnaireError';
  }
}

export class DocumentGenerationError extends DocumentDomainError {
  constructor(reason: string) {
    super(`Error durante la compilación del documento: ${reason}`, 'DOCUMENT_GENERATION_ERROR');
    this.name = 'DocumentGenerationError';
  }
}

export class DocumentNotFoundError extends DocumentDomainError {
  constructor(contractId: string, format: string) {
    super(
      `El documento en formato ${format} para el contrato ${contractId} no ha sido generado o no existe.`,
      'DOCUMENT_NOT_FOUND'
    );
    this.name = 'DocumentNotFoundError';
  }
}

