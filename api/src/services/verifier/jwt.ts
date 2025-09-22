import * as jose from 'jose';
import { ed25519 } from '@noble/curves/ed25519.js';
import { documentLoader } from '../documentLoader/index.js';
import { extractPublicKeyBytes, stringToBytes, base64ToBytes, type KNOWN_KEY_TYPE } from '../../utils/crypto.js';

export interface JWTDetectionResult {
  verified: boolean;
  results: JWTResult[];
}

export interface JWTResult {
  jwt: string;
  decoded: JWTDecoded | { error: string };
}

export interface JWTDecoded {
  header: any;
  payload: any;
}

export class JWTService {
  static isJWT(input: string): boolean {
    if (typeof input !== 'string') return false;
    return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(input.trim());
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
      return this.createFailureResult(jwt, decoded);
    }

    const { issuer, kid, alg } = this.extractJWTParams(decoded);
    
    if (!issuer || !kid) {
      return this.createFailureResult(jwt, decoded);
    }

    const verificationMethod = await this.loadVerificationMethod(issuer, kid);
    if (!verificationMethod) {
      return this.createFailureResult(jwt, decoded);
    }

    const verified = await this.performVerification(jwt, verificationMethod, alg);
    
    return {
      verified,
      results: [{ jwt, decoded }]
    };
  }

  private static extractJWTParams(decoded: JWTDecoded) {
    const issuer = decoded.payload.issuer?.id || decoded.payload.issuer || decoded.payload.iss;
    const kid = decoded.header.kid;
    const alg = decoded.header.alg;
    return { issuer, kid, alg };
  }

  private static async loadVerificationMethod(issuer: string, kid: string) {
    try {
      const verificationMethodUrl = kid.includes('#') ? kid : `${issuer}#${kid}`;
      const res = await documentLoader(verificationMethodUrl);
      return res.document;
    } catch (error) {
      return null;
    }
  }

  private static async performVerification(jwt: string, verificationMethod: any, alg: string): Promise<boolean> {
    if (verificationMethod.type === 'JsonWebKey' && verificationMethod.publicKeyJwk) {
      return this.verifyWithJWK(jwt, verificationMethod.publicKeyJwk, alg);
    }
    
    if (this.isEd25519VerificationMethod(verificationMethod.type) && this.isEd25519Algorithm(alg)) {
      return this.verifyEd25519(jwt, verificationMethod);
    }
    
    return false;
  }

  private static async verifyWithJWK(jwt: string, publicKeyJwk: any, alg: string): Promise<boolean> {
    try {
      const jwk = { ...publicKeyJwk };
      if (!jwk.alg && alg) {
        jwk.alg = alg;
      }
      
      const publicKey = await jose.importJWK(jwk);
      await jose.jwtVerify(jwt, publicKey, { algorithms: [alg] });
      
      return true;
    } catch (error) {
      return false;
    }
  }

  private static verifyEd25519(jwt: string, verificationMethod: any): boolean {
    try {
      const [headerB64, payloadB64, signatureB64] = jwt.split('.');
      const signingInput = `${headerB64}.${payloadB64}`;
      const signingInputBytes = stringToBytes(signingInput);
      const signatureBytes = base64ToBytes(signatureB64);
      const { keyBytes, keyType } = extractPublicKeyBytes(verificationMethod);
      
      if (keyType !== 'Ed25519') {
        return false;
      }

      const isValid = ed25519.verify(signatureBytes, signingInputBytes, keyBytes);
      
      return isValid;
    } catch (error) {
      return false;
    }
  }

  private static isEd25519VerificationMethod(type: string): boolean {
    return type === 'Ed25519VerificationKey2020' || type === 'Ed25519VerificationKey2018';
  }

  private static isEd25519Algorithm(alg: string): boolean {
    return alg === 'Ed25519' || alg === 'EdDSA';
  }

  private static createFailureResult(jwt: string, decoded: JWTDecoded | { error: string }): JWTDetectionResult {
    return {
      verified: false,
      results: [{ jwt, decoded }]
    };
  }
}