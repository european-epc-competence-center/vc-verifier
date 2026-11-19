/**
 * Pure JWT decoding without verification. Kept free of verifier and document
 * loader imports, so the document loader can use it without an import cycle.
 */
import * as jose from 'jose';

export interface JWTDecoded {
  header: any;
  payload: any;
}

export function isJWT(input: string): boolean {
  if (typeof input !== 'string') return false;
  return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(input.trim());
}

export function decodeJWT(jwt: string): JWTDecoded | { error: string } {
  try {
    const payload = jose.decodeJwt(jwt);
    const header = jose.decodeProtectedHeader(jwt);
    return { header, payload };
  } catch (error) {
    return { error: `Invalid JWT format: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}
