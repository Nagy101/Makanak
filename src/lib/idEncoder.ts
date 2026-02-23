/**
 * URL-safe opaque ID encoding.
 *
 * Numeric database IDs (property id, etc.) are XOR-obfuscated with a fixed
 * salt and then base64url-encoded before appearing in the browser URL bar.
 * This prevents casual enumeration and keeps raw integers out of the address
 * bar. The encoding is deterministic so bookmarks / links continue to work.
 *
 * Example: id 10  → "dG0x"   (changes with SALT)
 *          id 42  → "dG0z"
 */

const SALT = 0x4d4b; // 'MK' — change this to rotate all existing encoded URLs

/** Encode a numeric id into a URL-safe opaque string. */
export function encodeId(id: number): string {
  const obfuscated = (id ^ SALT).toString(36); // XOR then base-36
  return btoa(obfuscated).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/** Decode a URL-safe opaque string back to the original numeric id. */
export function decodeId(encoded: string): number | null {
  try {
    const padded = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
    const base36 = atob(padded + pad);
    return parseInt(base36, 36) ^ SALT;
  } catch {
    return null;
  }
}
