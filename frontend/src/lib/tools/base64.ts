/**
 * Pure client-side Base64 utilities. No network, no globals, no side effects.
 *
 * - encodeBase64 / decodeBase64: standard RFC 4648 §4 alphabet (A-Z, a-z, 0-9, +, /).
 * - encodeBase64Url / decodeBase64Url: URL-safe RFC 4648 §5 alphabet (+ -> -, / -> _, no padding).
 *
 * Input strings are first converted to UTF-8 bytes via TextEncoder, then the
 * byte sequence is fed to the platform-native btoa()/atob() pair. Decoding
 * reverses the process. Pure ASCII, CJK, and emoji all round-trip losslessly.
 */

export function encodeBase64(input: string): string {
  if (input === "") return "";
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

export function decodeBase64(input: string): string {
  if (input === "") return "";
  const binary = atob(input);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function encodeBase64Url(input: string): string {
  return encodeBase64(input)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function decodeBase64Url(input: string): string {
  let b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4 !== 0) b64 += "=";
  return decodeBase64(b64);
}
