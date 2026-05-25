import { describe, it, expect } from 'vitest';
import { formatJson, minifyJson, validateJson } from '../jsonFormatter';

describe('formatJson', () => {
  it('formats a valid JSON string with 2-space indent', () => {
    expect(formatJson('{"a":1,"b":2}', 2)).toBe('{\n  "a": 1,\n  "b": 2\n}');
  });

  it('supports 4-space indent', () => {
    expect(formatJson('{"a":1}', 4)).toBe('{\n    "a": 1\n}');
  });

  it('throws on invalid JSON', () => {
    expect(() => formatJson('{a:1}', 2)).toThrow();
  });
});

describe('minifyJson', () => {
  it('removes whitespace from valid JSON', () => {
    expect(minifyJson('{\n  "a": 1\n}')).toBe('{"a":1}');
  });

  it('throws on invalid JSON', () => {
    expect(() => minifyJson('not json')).toThrow();
  });
});

describe('validateJson', () => {
  it('returns ok=true for valid JSON', () => {
    const result = validateJson('{"a":1}');
    expect(result.ok).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('returns ok=false with error message for invalid JSON', () => {
    const result = validateJson('{a:1}');
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });
});
