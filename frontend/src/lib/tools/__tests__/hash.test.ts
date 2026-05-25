import { describe, it, expect } from 'vitest';
import { hashText } from '../hash';

describe('hashText', () => {
  it('computes SHA-256 of "hello"', async () => {
    const result = await hashText('hello', 'SHA-256');
    expect(result).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
  });

  it('computes SHA-1 of "hello"', async () => {
    const result = await hashText('hello', 'SHA-1');
    expect(result).toBe('aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d');
  });

  it('computes SHA-512 of "hello"', async () => {
    const result = await hashText('hello', 'SHA-512');
    expect(result).toBe(
      '9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043'
    );
  });

  it('handles empty string (SHA-256)', async () => {
    const result = await hashText('', 'SHA-256');
    expect(result).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });

  it('handles UTF-8 input', async () => {
    const result = await hashText('你好', 'SHA-256');
    expect(result.length).toBe(64); // hex of 32 bytes
  });

  it('supports SHA-384', async () => {
    const result = await hashText('hello', 'SHA-384');
    expect(result.length).toBe(96); // hex of 48 bytes
  });
});
