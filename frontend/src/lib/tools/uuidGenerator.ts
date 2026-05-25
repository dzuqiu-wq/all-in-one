/**
 * RFC 4122 v4 UUID generator built on the platform's Web Crypto API.
 *
 * Prefers `crypto.randomUUID()` (available in all modern browsers and Node 19+).
 * Falls back to `crypto.getRandomValues` with the canonical v4 bit-twiddling
 * (set the 4-bit version field to `4`, set the 2-bit variant field to `10`)
 * for older runtimes that lack `randomUUID`.
 *
 * No state, no I/O, no network. Suitable for client-side identifier generation.
 */

const MAX_COUNT = 10000;

export function generateUuidV4(): string {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function generateMany(count: number): string[] {
  if (count < 0) throw new Error("Count must be non-negative");
  if (count > MAX_COUNT) throw new Error(`Count exceeds maximum (${MAX_COUNT})`);
  return Array.from({ length: count }, () => generateUuidV4());
}
