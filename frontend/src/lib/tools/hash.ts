/**
 * Pure client-side cryptographic hash utility built on the platform's
 * Web Crypto API. No polyfills, no dependencies, no network calls.
 *
 * Supports the four SHA family algorithms exposed by `crypto.subtle.digest`:
 * SHA-1, SHA-256, SHA-384, and SHA-512. Note that MD5 is intentionally
 * unavailable in Web Crypto because it is cryptographically broken.
 *
 * Input strings are UTF-8 encoded via TextEncoder before hashing, so CJK
 * characters and emoji are handled correctly. Output is a lowercase hex
 * string of the digest bytes.
 */

export type HashAlgorithm = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

export async function hashText(
  input: string,
  algorithm: HashAlgorithm,
): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest(algorithm, bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
