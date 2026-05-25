import { describe, it, expect } from 'vitest';
import { formatBytes, isValidFileExtension } from '../utils';

describe('formatBytes', () => {
  it('formats bytes below 1KB', () => {
    expect(formatBytes(500)).toBe('500 B');
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1023)).toBe('1023 B');
  });

  it('formats kilobytes', () => {
    expect(formatBytes(1024)).toBe('1.0 KB');
    expect(formatBytes(2048)).toBe('2.0 KB');
  });

  it('formats megabytes', () => {
    expect(formatBytes(1048576)).toBe('1.00 MB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.00 MB');
  });
});

describe('isValidFileExtension', () => {
  it('returns true for matching extension', () => {
    expect(isValidFileExtension('test.docx', ['docx', 'doc'])).toBe(true);
    expect(isValidFileExtension('test.doc', ['docx', 'doc'])).toBe(true);
  });

  it('returns false for non-matching extension', () => {
    expect(isValidFileExtension('test.pdf', ['docx', 'doc'])).toBe(false);
    expect(isValidFileExtension('test.txt', ['docx'])).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(isValidFileExtension('test.DOCX', ['docx'])).toBe(true);
    expect(isValidFileExtension('test.docx', ['DOCX'])).toBe(true);
  });

  it('returns false for files without extension', () => {
    expect(isValidFileExtension('test', ['docx'])).toBe(false);
  });
});