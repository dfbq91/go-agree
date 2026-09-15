import { describe, expect, it } from 'vitest';
import { ContractGeneration } from '../src/entities/ContractGeneration';
import { DomainAuthError } from '../src/errors/DomainErrors';
import { ContractId } from '../src/value-objects/ContractId';
import { UserId } from '../src/value-objects/UserId';

describe('ContractGeneration Entity (Multi-Tenant Isolation)', () => {
  const contractId = ContractId.create('contract-100');
  const ownerId = UserId.create('user-owner');
  const otherUserId = UserId.create('user-other');

  it('creates a new contract generation owned by a specific user in progress', () => {
    const contract = ContractGeneration.create({
      id: contractId,
      userId: ownerId,
      title: 'Acuerdo de Confidencialidad (NDA)',
    });

    expect(contract.id.equals(contractId)).toBe(true);
    expect(contract.userId.equals(ownerId)).toBe(true);
    expect(contract.title).toBe('Acuerdo de Confidencialidad (NDA)');
    expect(contract.status).toBe('in_progress');
    expect(contract.currentQuestionIndex).toBe(0);
    expect(contract.answers).toEqual({});
  });

  it('enforces tenant ownership check and prevents cross-user access', () => {
    const contract = ContractGeneration.create({
      id: contractId,
      userId: ownerId,
      title: 'Contrato de Servicios',
    });

    expect(contract.isOwnedBy(ownerId)).toBe(true);
    expect(contract.isOwnedBy(otherUserId)).toBe(false);

    expect(() => contract.assertOwnership(otherUserId)).toThrow(DomainAuthError);
    expect(() => contract.assertOwnership(ownerId)).not.toThrow();
  });

  it('updates progress and answers accurately', () => {
    const contract = ContractGeneration.create({
      id: contractId,
      userId: ownerId,
      title: 'Contrato de Arrendamiento',
    });

    contract.updateProgress(3, { partyA: 'Empresa A', partyB: 'Persona B' });

    expect(contract.currentQuestionIndex).toBe(3);
    expect(contract.answers).toEqual({ partyA: 'Empresa A', partyB: 'Persona B' });
    expect(contract.status).toBe('in_progress');
  });

  it('marks contract as completed', () => {
    const contract = ContractGeneration.create({
      id: contractId,
      userId: ownerId,
      title: 'Contrato Final',
    });

    contract.markCompleted();
    expect(contract.status).toBe('completed');
  });
});
