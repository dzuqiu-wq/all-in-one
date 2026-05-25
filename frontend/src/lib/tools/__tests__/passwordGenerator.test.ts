import { describe, it, expect } from 'vitest';
import { generatePassword, estimateStrength, type PasswordOptions } from '../passwordGenerator';

const baseOpts: PasswordOptions = {
  length: 16,
  uppercase: true,
  lowercase: true,
  digits: true,
  symbols: true,
};

describe('generatePassword', () => {
  it('generates a string of requested length', () => {
    expect(generatePassword({ ...baseOpts, length: 24 })).toHaveLength(24);
  });

  it('throws when no character classes are selected', () => {
    expect(() =>
      generatePassword({ length: 16, uppercase: false, lowercase: false, digits: false, symbols: false })
    ).toThrow();
  });

  it('only includes selected character classes', () => {
    const pw = generatePassword({ length: 64, uppercase: false, lowercase: true, digits: false, symbols: false });
    expect(pw).toMatch(/^[a-z]+$/);
  });

  it('two calls produce different output (extremely likely)', () => {
    expect(generatePassword(baseOpts)).not.toBe(generatePassword(baseOpts));
  });
});

describe('estimateStrength', () => {
  it('rates short all-lowercase as weak', () => {
    expect(estimateStrength('abc')).toBe('weak');
  });

  it('rates long mixed passwords as strong', () => {
    expect(estimateStrength('Tr0ub4dor&3xtraEntr0py!')).toBe('strong');
  });

  it('rates medium mixed as medium', () => {
    expect(estimateStrength('Hello1!')).toBe('medium');
  });
});
