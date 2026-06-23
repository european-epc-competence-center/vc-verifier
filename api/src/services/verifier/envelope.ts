/**
 * Helpers for handling Enveloped Verifiable Credentials
 * 
 * An enveloped credential can appear in two forms:
 * 1. Direct: An object with type "EnvelopedVerifiableCredential" and an id field containing the JWT
 * 2. Wrapped: An object with a "verifiableCredential" field containing the above structure
 */

import { JWTService } from './jwt.js';

const ENVELOPED_JWT_DATA_URL_PREFIXES = [
  'data:application/vc+jwt,',
  'data:application/vc-ld+jwt,',
] as const;

/**
 * Checks if the given input is an enveloped credential (direct or wrapped)
 */
export function isEnvelopedCredential(input: any): boolean {
  if (!input || typeof input !== 'object') {
    return false;
  }

  // Check if it's directly an EnvelopedVerifiableCredential
  if (hasEnvelopedType(input)) {
    return true;
  }

  // Check if it's wrapped in verifiableCredential field
  if (input.verifiableCredential && typeof input.verifiableCredential === 'object') {
    return hasEnvelopedType(input.verifiableCredential);
  }

  return false;
}

/**
 * Checks if an object has the EnvelopedVerifiableCredential type
 */
function hasEnvelopedType(obj: any): boolean {
  if (!obj || !obj.type) {
    return false;
  }

  const types = Array.isArray(obj.type) ? obj.type : [obj.type];
  return types.includes('EnvelopedVerifiableCredential');
}

/**
 * Extracts the JWT from an enveloped credential
 * Handles both direct and wrapped formats
 * 
 * @param input - The input that might be an enveloped credential
 * @returns The JWT string if found, or the original input if not enveloped
 */
export function unwrapEnvelopedCredential(input: any): any {
  if (!input || typeof input !== 'object') {
    // JWT presentations often list each VC as a compact JWT string
    return input;
  }

  // Check if it's wrapped in verifiableCredential field first
  if (input.verifiableCredential && typeof input.verifiableCredential === 'object') {
    const wrapped = input.verifiableCredential;
    if (hasEnvelopedType(wrapped)) {
      return extractJWT(wrapped);
    }
  }

  // Check if it's directly an EnvelopedVerifiableCredential
  if (hasEnvelopedType(input)) {
    return extractJWT(input);
  }

  // Not an enveloped credential, return as-is
  return input;
}

/**
 * Unwraps enveloped credentials inside a presentation's verifiableCredential array.
 */
export function unwrapPresentationVerifiableCredentials(presentation: any): any {
  if (!presentation || typeof presentation !== 'object' || !presentation.verifiableCredential) {
    return presentation;
  }

  const isArray = Array.isArray(presentation.verifiableCredential);
  const credentials = isArray
    ? presentation.verifiableCredential
    : [presentation.verifiableCredential];

  const unwrapped = credentials.map((credential: any) => unwrapEnvelopedCredential(credential));

  return {
    ...presentation,
    verifiableCredential: isArray ? unwrapped : unwrapped[0],
  };
}

/**
 * Extracts the JWT from an EnvelopedVerifiableCredential object
 */
function extractJWT(envelope: any): string {
  if (!envelope.id || typeof envelope.id !== 'string') {
    throw new Error('EnvelopedVerifiableCredential missing id field with JWT');
  }

  return stripEnvelopedJwtDataUrl(envelope.id);
}

function stripEnvelopedJwtDataUrl(id: string): string {
  for (const prefix of ENVELOPED_JWT_DATA_URL_PREFIXES) {
    if (id.startsWith(prefix)) {
      return id.substring(prefix.length);
    }
  }
  return id;
}

/**
 * Decodes a verifiable JWT string and unwraps embedded `vc` / `vp` claim objects.
 */
export function decodeVerifiableInput(verifiable: any): any {
  let body = verifiable;

  if (typeof verifiable === 'string' && JWTService.isJWT(verifiable)) {
    const decoded = JWTService.decodeJWT(verifiable);
    if ('error' in decoded) {
      throw new Error(`Failed to decode verifiable JWT: ${decoded.error}`);
    }
    body = decoded.payload;
  }

  if (body?.vc && typeof body.vc === 'object') {
    body = body.vc;
  }

  if (body?.vp && typeof body.vp === 'object') {
    body = body.vp;
  }

  return body;
}

/**
 * Decodes one presentation entry: compact JWT, enveloped JWT, or JSON-LD VC.
 */
export function decodeVerifiableCredentialEntry(credential: any): any {
  if (typeof credential === 'string' && JWTService.isJWT(credential)) {
    const decoded = JWTService.decodeJWT(credential);
    if ('error' in decoded) {
      throw new Error(`Failed to decode credential JWT: ${decoded.error}`);
    }
    return decoded.payload;
  }

  const unwrapped = unwrapEnvelopedCredential(credential);
  if (typeof unwrapped === 'string' && JWTService.isJWT(unwrapped)) {
    const decoded = JWTService.decodeJWT(unwrapped);
    if ('error' in decoded) {
      throw new Error(`Failed to decode credential JWT: ${decoded.error}`);
    }
    return decoded.payload;
  }

  return unwrapped;
}

/**
 * Unwraps enveloped VCs and decodes nested JWT credentials in a presentation body.
 */
export function normalizePresentationCredentials(presentation: any): any {
  const withUnwrappedEnvelopes = unwrapPresentationVerifiableCredentials(presentation);
  if (!withUnwrappedEnvelopes?.verifiableCredential) {
    return withUnwrappedEnvelopes;
  }

  const isArray = Array.isArray(withUnwrappedEnvelopes.verifiableCredential);
  const credentials = isArray
    ? withUnwrappedEnvelopes.verifiableCredential
    : [withUnwrappedEnvelopes.verifiableCredential];

  const decoded = credentials.map(decodeVerifiableCredentialEntry);

  return {
    ...withUnwrappedEnvelopes,
    verifiableCredential: isArray ? decoded : decoded[0],
  };
}

/**
 * Full normalization for JWT or JSON-LD presentations before verification.
 */
export function normalizePresentationInput(presentation: any): any {
  return normalizePresentationCredentials(decodeVerifiableInput(presentation));
}
