import { describe, expect, it } from 'vitest';
import {
  TYPE_ID_PREFIXES,
  ensureTypeId,
  extractTimestampFromUuidV7,
  generateTypeId,
  generateUuidV7,
  isTypeId,
  isUuid,
  isUuidV7,
  parseTypeId,
  stripTypeIdPrefix,
} from '../src/value-objects/TypeId.js';
import { ContractId } from '../src/value-objects/ContractId.js';
import { UserId } from '../src/value-objects/UserId.js';

describe('UUIDv7 & TypeID Domain Utilities', () => {
  it('generates valid RFC 9562 UUIDv7 strings', () => {
    const uuid = generateUuidV7();
    expect(isUuid(uuid)).toBe(true);
    expect(isUuidV7(uuid)).toBe(true);

    // Check version 7 in 13th character (index 14 with hyphens)
    expect(uuid.charAt(14)).toBe('7');
    // Check variant 10 in 17th character (index 19 with hyphens)
    expect(['8', '9', 'a', 'b']).toContain(uuid.charAt(19).toLowerCase());
  });

  it('generates monotonic, time-ordered UUIDv7 identifiers', async () => {
    const id1 = generateUuidV7();
    // Simulate slight time advance or fast sequence
    const id2 = generateUuidV7();
    expect(id1 < id2).toBe(true);
  });

  it('accurately encodes and extracts Unix timestamp in UUIDv7', () => {
    const fixedTime = 1726400000000;
    const uuid = generateUuidV7(fixedTime);
    const extracted = extractTimestampFromUuidV7(uuid);
    expect(extracted).toBe(fixedTime);
  });

  it('generates TypeID with specific prefixes: con_, corr_, user_', () => {
    const contractId = generateTypeId(TYPE_ID_PREFIXES.CONTRACT);
    expect(contractId.startsWith('con_')).toBe(true);
    expect(isTypeId(contractId, 'con')).toBe(true);
    expect(isUuidV7(contractId.replace('con_', ''))).toBe(true);

    const corrId = generateTypeId(TYPE_ID_PREFIXES.CORRELATION);
    expect(corrId.startsWith('corr_')).toBe(true);
    expect(isTypeId(corrId, 'corr')).toBe(true);

    const userId = generateTypeId(TYPE_ID_PREFIXES.USER);
    expect(userId.startsWith('user_')).toBe(true);
    expect(isTypeId(userId, 'user')).toBe(true);
  });

  it('parses TypeID correctly', () => {
    const parsed = parseTypeId('con_0191fa23-7b40-7a1b-8f3a-9284fa93bc10');
    expect(parsed.prefix).toBe('con');
    expect(parsed.uuid).toBe('0191fa23-7b40-7a1b-8f3a-9284fa93bc10');

    const withoutPrefix = parseTypeId('0191fa23-7b40-7a1b-8f3a-9284fa93bc10');
    expect(withoutPrefix.prefix).toBeNull();
    expect(withoutPrefix.uuid).toBe('0191fa23-7b40-7a1b-8f3a-9284fa93bc10');
  });

  it('strips TypeID prefix when UUID is present', () => {
    const raw = '0191fa23-7b40-7a1b-8f3a-9284fa93bc10';
    expect(stripTypeIdPrefix(`con_${raw}`)).toBe(raw);
    expect(stripTypeIdPrefix(`corr_${raw}`)).toBe(raw);
    expect(stripTypeIdPrefix(`user_${raw}`)).toBe(raw);
    expect(stripTypeIdPrefix(raw)).toBe(raw);
    expect(stripTypeIdPrefix('non_uuid_arbitrary')).toBe('non_uuid_arbitrary');
  });

  it('ensures TypeID prefix idempotently', () => {
    const raw = '0191fa23-7b40-7a1b-8f3a-9284fa93bc10';
    expect(ensureTypeId('con', raw)).toBe(`con_${raw}`);
    expect(ensureTypeId('con', `con_${raw}`)).toBe(`con_${raw}`);
    expect(ensureTypeId('user', raw)).toBe(`user_${raw}`);
  });

  describe('ContractId Value Object with TypeId', () => {
    it('generates ContractId with con_ prefix and UUIDv7', () => {
      const contractId = ContractId.generate();
      expect(contractId.value.startsWith('con_')).toBe(true);
      expect(contractId.isTypeId).toBe(true);
      expect(isUuidV7(contractId.rawUuid)).toBe(true);
    });

    it('creates ContractId from raw UUID and exposes rawUuid', () => {
      const raw = '0191fa23-7b40-7a1b-8f3a-9284fa93bc10';
      const contractId = ContractId.fromUuid(raw);
      expect(contractId.value).toBe(`con_${raw}`);
      expect(contractId.rawUuid).toBe(raw);
    });
  });

  describe('UserId Value Object with TypeId', () => {
    it('creates UserId from external UUID with user_ prefix', () => {
      const externalUuid = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      const userId = UserId.fromExternal(externalUuid);
      expect(userId.value).toBe(`user_${externalUuid}`);
      expect(userId.rawUuid).toBe(externalUuid);
      expect(userId.isTypeId).toBe(true);
    });
  });
});
