/**
 * Cryptographically-secure password generator built on the Web Crypto API.
 *
 * Uses `crypto.getRandomValues` (CSPRNG) for unbiased character selection,
 * never `Math.random`. Shannon-entropy estimator classifies output strength
 * based on the effective character pool and length.
 *
 * No state, no I/O, no network. Suitable for production credentials, tokens,
 * and one-shot secrets generated client-side.
 */

export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  digits: boolean;
  symbols: boolean;
}

export type PasswordStrength = "weak" | "medium" | "strong";

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.<>?/~";

export function generatePassword(opts: PasswordOptions): string {
  let alphabet = "";
  if (opts.uppercase) alphabet += UPPER;
  if (opts.lowercase) alphabet += LOWER;
  if (opts.digits) alphabet += DIGITS;
  if (opts.symbols) alphabet += SYMBOLS;
  if (alphabet.length === 0) {
    throw new Error("At least one character class must be selected");
  }
  const result: string[] = [];
  const rand = new Uint32Array(opts.length);
  crypto.getRandomValues(rand);
  for (let i = 0; i < opts.length; i++) {
    result.push(alphabet[rand[i] % alphabet.length]);
  }
  return result.join("");
}

export function estimateStrength(password: string): PasswordStrength {
  let pool = 0;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/[0-9]/.test(password)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(password)) pool += 28;
  const entropy = password.length * Math.log2(Math.max(pool, 1));
  if (entropy < 40) return "weak";
  if (entropy < 80) return "medium";
  return "strong";
}
