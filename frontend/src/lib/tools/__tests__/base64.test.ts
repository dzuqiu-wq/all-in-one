import { describe, it, expect } from 'vitest';
import { encodeBase64, decodeBase64, encodeBase64Url, decodeBase64Url } from '../base64';

describe('encodeBase64 / decodeBase64', () => {
  it('encodes ASCII text', () => {
    expect(encodeBase64('hello')).toBe('aGVsbG8=');
  });

  it('decodes ASCII text', () => {
    expect(decodeBase64('aGVsbG8=')).toBe('hello');
  });

  it('round-trips UTF-8 (Chinese)', () => {
    const encoded = encodeBase64('你好');
    expect(decodeBase64(encoded)).toBe('你好');
  });

  it('handles empty string', () => {
    expect(encodeBase64('')).toBe('');
    expect(decodeBase64('')).toBe('');
  });

  it('throws on invalid Base64 input', () => {
    expect(() => decodeBase64('!!!not-base64!!!')).toThrow();
  });
});

describe('encodeBase64Url / decodeBase64Url', () => {
  it('uses URL-safe alphabet (no + or /)', () => {
    // 0xFB 0xFF -> standard "+/8=", URL-safe "-_8" (no padding)
    const input = String.fromCharCode(0xfb, 0xff);
    const encoded = encodeBase64Url(input);
    expect(encoded).not.toContain('+');
    expect(encoded).not.toContain('/');
    expect(encoded).not.toContain('=');
  });

  it('round-trips ASCII', () => {
    expect(decodeBase64Url(encodeBase64Url('hello'))).toBe('hello');
  });
});
