// @ts-ignore
import * as base64url from 'base64url-universal';
// @ts-ignore
import * as cborg from 'cborg';

/**
 * Length of the public key inside an `ecdsa-sd-2023` `proofValue`.
 * Cryptosuite 1.x embeds a 36-byte key. Cryptosuite 3.x embeds a 35-byte key.
 */
export function ecdsaSdPublicKeyLength(proofValue: unknown): number | undefined {
  if (typeof proofValue !== 'string' || proofValue[0] !== 'u') return undefined;
  try {
    const bytes = base64url.decode(proofValue.slice(1));
    if (!bytes || bytes.length < 4) return undefined;
    const decoded = cborg.decode(bytes.subarray(3));
    const publicKey = Array.isArray(decoded) ? decoded[1] : undefined;
    return publicKey instanceof Uint8Array ? publicKey.length : undefined;
  } catch {
    return undefined;
  }
}
