import { ContractId } from '../value-objects/ContractId.js';
import { UserId } from '../value-objects/UserId.js';
import { DomainAuthError, EmptyTitleError } from '../errors/DomainErrors.js';
import type { QuestionnaireDefinition } from './QuestionnaireDefinition.js';

export type ContractStatus = 'in_progress' | 'completed';

export interface ContractGenerationProps {
  id: ContractId;
  userId: UserId;
  title: string;
  status: ContractStatus;
  currentQuestionIndex: number;
  answers: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export class ContractGeneration {
  readonly id: ContractId;
  readonly userId: UserId;
  readonly createdAt: Date;
  private _title: string;
  private _status: ContractStatus;
  private _currentQuestionIndex: number;
  private _answers: Record<string, unknown>;
  private _updatedAt: Date;

  constructor(props: ContractGenerationProps) {
    this.id = props.id;
    this.userId = props.userId;
    this._title = props.title;
    this._status = props.status;
    this._currentQuestionIndex = props.currentQuestionIndex;
    this._answers = props.answers;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static create(params: {
    id: ContractId;
    userId: UserId;
    title: string;
    now?: Date;
  }): ContractGeneration {
    const now = params.now || new Date();

    return new ContractGeneration({
      id: params.id,
      userId: params.userId,
      title: params.title,
      status: 'in_progress',
      currentQuestionIndex: 0,
      answers: {},
      createdAt: now,
      updatedAt: now,
    });
  }

  get title(): string {
    return this._title;
  }

  get status(): ContractStatus {
    return this._status;
  }

  get currentQuestionIndex(): number {
    return this._currentQuestionIndex;
  }

  get answers(): Record<string, unknown> {
    return { ...this._answers };
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  isOwnedBy(userId: UserId): boolean {
    return this.userId.equals(userId);
  }

  assertOwnership(userId: UserId): void {
    if (!this.isOwnedBy(userId)) {
      throw new DomainAuthError('Access denied: You do not own this contract generation', 'UNAUTHORIZED');
    }
  }

  updateProgress(
    questionIndex: number,
    answers: Record<string, unknown>,
    now: Date = new Date()
  ): void {
    this._currentQuestionIndex = questionIndex;
    this._answers = { ...this._answers, ...answers };
    this._updatedAt = now;
  }

  updateTitle(newTitle: string, now: Date = new Date()): void {
    if (!newTitle || newTitle.trim().length === 0) {
      throw new EmptyTitleError();
    }
    this._title = newTitle.trim();
    this._updatedAt = now;
  }

  pruneObsoleteAnswers(questionnaire: QuestionnaireDefinition): void {
    this._answers = questionnaire.pruneObsoleteAnswers(this._answers);
  }

  markCompleted(now: Date = new Date()): void {
    this._status = 'completed';
    this._updatedAt = now;
  }
}
