import { describe, it, expect } from 'vitest';
import { generateUuidV4, generateMany } from '../uuidGenerator';

const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('generateUuidV4', () => {
  it('returns a v4 UUID', () => {
    const id = generateUuidV4();
    expect(id).toMatch(UUID_V4_RE);
  });

  it('returns different UUIDs on consecutive calls', () => {
    expect(generateUuidV4()).not.toBe(generateUuidV4());
  });
});

describe('generateMany', () => {
  it('returns N unique UUIDs', () => {
    const ids = generateMany(50);
    expect(ids).toHaveLength(50);
    expect(new Set(ids).size).toBe(50);
    ids.forEach((id) => expect(id).toMatch(UUID_V4_RE));
  });

  it('throws on negative count', () => {
    expect(() => generateMany(-1)).toThrow();
  });

  it('caps at a maximum count', () => {
    expect(() => generateMany(10001)).toThrow();
  });
});
