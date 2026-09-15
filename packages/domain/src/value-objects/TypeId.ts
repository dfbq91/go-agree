/**
 * @file TypeId.ts
 * @description RFC 9562 UUIDv7 generator and TypeID value object / utilities for domain entities and tracing.
 */

export const TYPE_ID_PREFIXES = {
  CONTRACT: 'con',
  CORRELATION: 'corr',
  USER: 'user',
} as const;

export type StandardTypeIdPrefix = (typeof TYPE_ID_PREFIXES)[keyof typeof TYPE_ID_PREFIXES];
export type TypeIdPrefix = StandardTypeIdPrefix | string;

let lastTimestamp = -1;
let seq = 0;

/**
 * Generates an RFC 9562 compliant UUIDv7 (128-bit, time-ordered, K-sortable).
 * Compatible with Node.js, Next.js Edge Runtime, and browser environments.
 */
export function generateUuidV7(timestampMs?: number): string {
  const now = timestampMs ?? Date.now();
  if (now <= lastTimestamp) {
    seq = (seq + 1) & 0xfff;
  } else {
    lastTimestamp = now;
    const cryptoObj =
      typeof globalThis !== 'undefined' && globalThis.crypto ? globalThis.crypto : undefined;
    if (cryptoObj?.getRandomValues) {
      const randBuf = new Uint16Array(1);
      cryptoObj.getRandomValues(randBuf);
      seq = randBuf[0] & 0xfff;
    } else {
      seq = Math.floor(Math.random() * 0x1000);
    }
  }

  const bytes = new Uint8Array(16);
  const cryptoObj =
    typeof globalThis !== 'undefined' && globalThis.crypto ? globalThis.crypto : undefined;

  if (cryptoObj?.getRandomValues) {
    cryptoObj.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  // 48-bit timestamp in milliseconds
  bytes[0] = Math.floor(now / 0x10000000000) & 0xff;
  bytes[1] = Math.floor(now / 0x100000000) & 0xff;
  bytes[2] = Math.floor(now / 0x1000000) & 0xff;
  bytes[3] = Math.floor(now / 0x10000) & 0xff;
  bytes[4] = Math.floor(now / 0x100) & 0xff;
  bytes[5] = now & 0xff;

  // 4-bit version 7 (0111) in high nibble of byte 6 + 12-bit sequence counter
  bytes[6] = 0x70 | ((seq >> 8) & 0x0f);
  bytes[7] = seq & 0xff;

  // 2-bit variant 10 in high bits of byte 8 (RFC 4122/9562)
  bytes[8] = 0x80 | (bytes[8] & 0x3f);

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/**
 * Generates a TypeID combining a type prefix and a UUIDv7 identifier.
 * Example: generateTypeId('con') -> 'con_0191fa23-7b40-7a1b-8f3a-9284fa93bc10'
 */
export function generateTypeId(prefix: TypeIdPrefix, timestampMs?: number): string {
  return `${prefix}_${generateUuidV7(timestampMs)}`;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UUID_V7_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Checks whether a given string is a valid UUID (v4, v7, etc.).
 */
export function isUuid(value: string): boolean {
  return typeof value === 'string' && UUID_REGEX.test(value);
}

/**
 * Checks whether a given string is a valid RFC 9562 UUIDv7.
 */
export function isUuidV7(value: string): boolean {
  return typeof value === 'string' && UUID_V7_REGEX.test(value);
}

/**
 * Checks whether a given string is a valid TypeID with an optional expected prefix.
 */
export function isTypeId(value: string, expectedPrefix?: TypeIdPrefix): boolean {
  if (typeof value !== 'string') return false;
  const parts = value.split('_');
  if (parts.length < 2) return false;
  const prefix = parts[0];
  const uuid = parts.slice(1).join('_');
  if (expectedPrefix && prefix !== expectedPrefix) return false;
  return isUuid(uuid);
}

/**
 * Strips the TypeID prefix if present and the remainder is a UUID.
 * Example: 'con_0191fa23-...' -> '0191fa23-...'
 */
export function stripTypeIdPrefix(id: string): string {
  if (!id || typeof id !== 'string') return id;
  const underscoreIndex = id.indexOf('_');
  if (underscoreIndex !== -1) {
    const candidate = id.slice(underscoreIndex + 1);
    if (isUuid(candidate)) {
      return candidate;
    }
  }
  return id;
}

/**
 * Ensures an ID has the designated TypeID prefix.
 * Example: ensureTypeId('con', '0191fa23-...') -> 'con_0191fa23-...'
 */
export function ensureTypeId(prefix: TypeIdPrefix, id: string): string {
  if (!id || typeof id !== 'string') return id;
  if (id.startsWith(`${prefix}_`)) {
    return id;
  }
  const raw = stripTypeIdPrefix(id);
  return `${prefix}_${raw}`;
}

/**
 * Parses a TypeID into its prefix and UUID component.
 */
export function parseTypeId(id: string): { prefix: string | null; uuid: string } {
  if (!id || typeof id !== 'string') {
    return { prefix: null, uuid: id };
  }
  const underscoreIndex = id.indexOf('_');
  if (underscoreIndex > 0) {
    const prefix = id.slice(0, underscoreIndex);
    const uuid = id.slice(underscoreIndex + 1);
    return { prefix, uuid };
  }
  return { prefix: null, uuid: id };
}

/**
 * Extracts the Unix millisecond timestamp encoded in a UUIDv7.
 */
export function extractTimestampFromUuidV7(uuidOrTypeId: string): number | null {
  const raw = stripTypeIdPrefix(uuidOrTypeId);
  if (!isUuidV7(raw)) return null;
  const hexClean = raw.replace(/-/g, '');
  const timeHex = hexClean.slice(0, 12);
  return Number.parseInt(timeHex, 16);
}
