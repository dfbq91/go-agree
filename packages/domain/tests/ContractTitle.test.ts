import { describe, expect, it } from 'vitest';
import { ContractGeneration } from '../src/entities/ContractGeneration.js';
import { EmptyTitleError } from '../src/errors/DomainErrors.js';
import { ContractId } from '../src/value-objects/ContractId.js';
import { UserId } from '../src/value-objects/UserId.js';

describe('Contract Title Management', () => {
  it('updates title when valid non-empty string is provided', () => {
    const contract = ContractGeneration.create({
      id: ContractId.create('c-1'),
      userId: UserId.create('u-1'),
      title: 'Mi Contrato 1',
    });

    contract.updateTitle('Contrato Mantenimiento Web 2026');
    expect(contract.title).toBe('Contrato Mantenimiento Web 2026');
  });

  it('throws EmptyTitleError when title is empty or whitespace only', () => {
    const contract = ContractGeneration.create({
      id: ContractId.create('c-1'),
      userId: UserId.create('u-1'),
      title: 'Mi Contrato 1',
    });

    expect(() => contract.updateTitle('')).toThrow(EmptyTitleError);
    expect(() => contract.updateTitle('   ')).toThrow(EmptyTitleError);
    expect(contract.title).toBe('Mi Contrato 1');
  });
});
