import * as jose from 'jose';
import { ed25519 } from '@noble/curves/ed25519.js';
// @ts-ignore
import * as EcdsaMultikey from '@digitalbazaar/ecdsa-multikey';
// @ts-ignore
import jsigs from 'jsonld-signatures';
import { documentLoader } from '../documentLoader/index.js';
import { extractPublicKeyBytes, stringToBytes, base64ToBytes, type KNOWN_KEY_TYPE } from '../../utils/crypto.js';
import {
  checkPayloadHolderMatches,
  resolveHolderFromVerificationMethod,
} from './holder.js';

const {
  purposes: { AuthenticationProofPurpose },
} = jsigs;

/** JWT presentation holder-binding fields (nonce/aud/holder claims). */
export interface JWTHolderBinding {
  nonce?: string;
  aud?: string | string[];
  holder?: string | { id?: string };
}

export interface JWTHolderBindingValidation {
  valid: boolean;
  nonce?: string;
  holder?: string;
  error?: Error;
}

export interface JWTDetectionResult {
  verified: boolean;
  results: JWTResult[];
}

export interface JWTResult {
  proof: {
    jwt: string;
  };
  verified: boolean;
  verificationMethod?: any;
  error?: {
    name: string;
    message: string;
    code?: string;
    claim?: string;
    reason?: string;
  };
  purposeResult?: {
    valid: boolean;
  };
  decoded?: JWTDecoded | { error: string };
}

export interface JWTDecoded {
  header: any;
  payload: any;
}

export class JWTService {
  private static toErrorDetails(error: unknown): JWTResult['error'] {
    const fallback = {
      name: 'VerificationError',
      message: 'JWT verification failed'
    };

    if (!error || typeof error !== 'object') {
      return fallback;
    }

    const typedError = error as Error & {
      code?: string;
      claim?: string;
      reason?: string;
    };

    return {
      name: typedError.name || fallback.name,
      message: typedError.message || fallback.message,
      code: typedError.code,
      claim: typedError.claim,
      reason: typedError.reason
    };
  }

  static isJWT(input: string): boolean {
    if (typeof input !== 'string') return false;
    return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(input.trim());
  }

  static holderBindingFromPayload(
    payload: Record<string, unknown>
  ): JWTHolderBinding {
    const nonce = payload.nonce;
    const holder = payload.holder;

    return {
      nonce: typeof nonce === 'string' ? nonce : undefined,
      aud: payload.aud as string | string[] | undefined,
      holder:
        typeof holder === 'string' ||
        (holder && typeof holder === 'object')
          ? (holder as string | { id?: string })
          : undefined,
    };
  }

  /**
   * Validates JWT presentation holder binding via `AuthenticationProofPurpose`,
   * mapping `nonce`/`aud` onto the library's `challenge`/`domain` checks.
   */
  static async validatePresentationHolderBinding(
    expected: JWTHolderBinding,
    actual: JWTHolderBinding,
    verificationMethod: { id: string; controller?: string | { id: string } },
    loader: (url: string) => Promise<{ document: unknown }> = documentLoader,
    holderBinding = true
  ): Promise<JWTHolderBindingValidation> {
    const nonce = expected.nonce ?? actual.nonce;

    if (typeof nonce !== 'string') {
      return {
        valid: false,
        error: new Error('JWT presentation is missing required nonce claim.'),
      };
    }

    try {
      const purpose = new AuthenticationProofPurpose({
        challenge: nonce,
        domain: expected.aud,
      });

      const purposeResult = await purpose.validate(
        {
          challenge: actual.nonce,
          domain: actual.aud,
        },
        { verificationMethod, documentLoader: loader }
      );

      if (!purposeResult.valid) {
        return {
          valid: false,
          nonce,
          error: purposeResult.error,
        };
      }

      const holderId = resolveHolderFromVerificationMethod(verificationMethod);

      if (holderBinding) {
        const payloadHolderCheck = checkPayloadHolderMatches(
          holderId,
          actual.holder
        );

        if (!payloadHolderCheck.valid) {
          return {
            valid: false,
            nonce,
            holder: holderId,
            error: new Error(payloadHolderCheck.error!.message),
          };
        }
      }

      return { valid: true, nonce, holder: holderId };
    } catch (error) {
      return {
        valid: false,
        nonce,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  static decodeJWT(jwt: string): JWTDecoded | { error: string } {
    try {
      const payload = jose.decodeJwt(jwt);
      const header = jose.decodeProtectedHeader(jwt);
      return { header, payload };
    } catch (error) {
      return { error: `Invalid JWT format: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  static async verifyJWT(jwt: string): Promise<JWTDetectionResult> {
    const decoded = this.decodeJWT(jwt);

    if ('error' in decoded) {
      return this.createFailureResult(jwt, decoded, undefined, {
        name: 'VerificationError',
        message: decoded.error
      });
    }

    const { issuer, holder, kid, alg } = this.extractJWTParams(decoded);
    
    if (!kid) {
      return this.createFailureResult(jwt, decoded, undefined, {
        name: 'VerificationError',
        message: 'Missing kid in JWT header'
      });
    }

    // A did:key kid is self-contained and doesn't require an issuer
    if ((!issuer && !holder) && !this.isSelfContainedDID(kid)) {
      return this.createFailureResult(jwt, decoded, undefined, {
        name: 'VerificationError',
        message: 'Missing issuer in JWT payload'
      });
    }

    const { verificationMethod, error: loadError } = await this.loadVerificationMethod(issuer, kid);
    if (!verificationMethod) {
      return this.createFailureResult(jwt, decoded, undefined, loadError ?? {
        name: 'VerificationError',
        message: 'Failed to load verification method'
      });
    }

    const verificationResult = await this.performVerification(jwt, verificationMethod, alg);
    
    return {
      verified: verificationResult.verified,
      results: [{
        proof: { jwt },
        verified: verificationResult.verified,
        verificationMethod,
        error: verificationResult.error,
        purposeResult: { valid: verificationResult.verified },
        decoded
      }]
    };
  }

  private static extractJWTParams(decoded: JWTDecoded) {
    const issuer = decoded.payload.issuer?.id || decoded.payload.issuer || decoded.payload.iss;
    const holder = decoded.payload.holder?.id || decoded.payload.holder || decoded.payload.holder;
    const kid = decoded.header.kid;
    const alg = decoded.header.alg;
    return { issuer, holder, kid, alg };
  }

  private static isSelfContainedDID(kid: string): boolean {
    return kid.startsWith('did:key:');
  }

  private static async loadVerificationMethod(issuer: string | undefined, kid: string): Promise<{
    verificationMethod?: any;
    error?: JWTResult['error'];
  }> {
    try {
      let verificationMethodUrl: string;
      if (kid.includes('#')) {
        verificationMethodUrl = kid;
      } else if (this.isSelfContainedDID(kid)) {
        // For self-contained DIDs like did:key, the verification method id is did#keyId
        const keyId = kid.split(':').pop()!;
        verificationMethodUrl = `${kid}#${keyId}`;
      } else {
        verificationMethodUrl = `${issuer}#${kid}`;
      }
      const res = await documentLoader(verificationMethodUrl);
      return { verificationMethod: res.document };
    } catch (error) {
      return { error: this.toErrorDetails(error) };
    }
  }

  private static async performVerification(
    jwt: string,
    verificationMethod: any,
    alg: string
  ): Promise<{ verified: boolean; error?: JWTResult['error'] }> {
    if (verificationMethod.type.startsWith('JsonWebKey') && verificationMethod.publicKeyJwk) {
      return this.verifyWithJWK(jwt, verificationMethod.publicKeyJwk, alg);
    }
    
    if (this.isEd25519VerificationMethod(verificationMethod.type) && this.isEd25519Algorithm(alg)) {
      return this.verifyEd25519(jwt, verificationMethod);
    }

    if (verificationMethod.type === 'Multikey' && verificationMethod.publicKeyMultibase) {
      return this.verifyWithMultikey(jwt, verificationMethod, alg);
    }
    
    return { verified: false, error: { name: 'VerificationError', message: `Unsupported verification method: ${verificationMethod.type}` } };
  }

  private static async verifyWithMultikey(
    jwt: string,
    verificationMethod: any,
    alg: string
  ): Promise<{ verified: boolean; error?: JWTResult['error'] }> {
    try {
      const keyPair = await EcdsaMultikey.from(verificationMethod);
      const publicKeyJwk = await EcdsaMultikey.toJwk({ keyPair, secretKey: false });
      return this.verifyWithJWK(jwt, publicKeyJwk, alg);
    } catch (error) {
      return { verified: false, error: this.toErrorDetails(error) };
    }
  }

  private static async verifyWithJWK(
    jwt: string,
    publicKeyJwk: any,
    alg: string
  ): Promise<{ verified: boolean; error?: JWTResult['error'] }> {
    try {
      const jwk = { ...publicKeyJwk };
      if (!jwk.alg && alg) {
        jwk.alg = alg;
      }
      
      const publicKey = await jose.importJWK(jwk);
      await jose.jwtVerify(jwt, publicKey, { algorithms: [alg] });
      
      return { verified: true };
    } catch (error) {
      return { verified: false, error: this.toErrorDetails(error) };
    }
  }

  private static verifyEd25519(
    jwt: string,
    verificationMethod: any
  ): { verified: boolean; error?: JWTResult['error'] } {
    try {
      const [headerB64, payloadB64, signatureB64] = jwt.split('.');
      const signingInput = `${headerB64}.${payloadB64}`;
      const signingInputBytes = stringToBytes(signingInput);
      const signatureBytes = base64ToBytes(signatureB64);
      const { keyBytes, keyType } = extractPublicKeyBytes(verificationMethod);
      
      if (keyType !== 'Ed25519') {
        return { verified: false };
      }

      const isValid = ed25519.verify(signatureBytes, signingInputBytes, keyBytes);
      
      return { verified: isValid };
    } catch (error) {
      return { verified: false, error: this.toErrorDetails(error) };
    }
  }

  private static isEd25519VerificationMethod(type: string): boolean {
    return type === 'Ed25519VerificationKey2020' || type === 'Ed25519VerificationKey2018';
  }

  private static isEd25519Algorithm(alg: string): boolean {
    return alg === 'Ed25519' || alg === 'EdDSA';
  }

  private static createFailureResult(
    jwt: string,
    decoded: JWTDecoded | { error: string },
    verificationMethod?: any,
    error?: JWTResult['error']
  ): JWTDetectionResult {
    return {
      verified: false,
      results: [{
        proof: { jwt },
        verified: false,
        verificationMethod,
        error,
        purposeResult: { valid: false },
        decoded
      }]
    };
  }
}