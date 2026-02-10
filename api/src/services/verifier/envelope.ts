/**
 * Helpers for handling Enveloped Verifiable Credentials
 * 
 * An enveloped credential can appear in two forms:
 * 1. Direct: An object with type "EnvelopedVerifiableCredential" and an id field containing the JWT
 * 2. Wrapped: An object with a "verifiableCredential" field containing the above structure
 */

const DATA_URL_PREFIX = 'data:application/vc+jwt,';

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
 * Extracts the JWT from an EnvelopedVerifiableCredential object
 */
function extractJWT(envelope: any): string {
  if (!envelope.id || typeof envelope.id !== 'string') {
    throw new Error('EnvelopedVerifiableCredential missing id field with JWT');
  }

  const jwt = envelope.id;
  
  // Strip data URL prefix if present
  if (jwt.startsWith(DATA_URL_PREFIX)) {
    return jwt.substring(DATA_URL_PREFIX.length);
  }

  return jwt;
}
