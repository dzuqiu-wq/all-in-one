/**
 * Pure client-side JSON utilities. No network, no globals, no side effects.
 *
 * - formatJson: pretty-print a JSON string with the requested indent width.
 * - minifyJson: parse and re-stringify with no whitespace.
 * - validateJson: non-throwing check that returns a structured result.
 *
 * Each function parses through the platform's native JSON.parse so the
 * accepted grammar exactly matches the ECMA-404 spec — double-quoted keys,
 * no trailing commas, no comments.
 */

export function formatJson(input: string, indent: number): string {
  const parsed: unknown = JSON.parse(input);
  return JSON.stringify(parsed, null, indent);
}

export function minifyJson(input: string): string {
  const parsed: unknown = JSON.parse(input);
  return JSON.stringify(parsed);
}

export interface ValidationResult {
  ok: boolean;
  error?: string;
}

export function validateJson(input: string): ValidationResult {
  try {
    JSON.parse(input);
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
