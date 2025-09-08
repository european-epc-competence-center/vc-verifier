import * as jose from 'jose';
import { documentLoader } from '../documentLoader/index.js';

export interface JWTDetectionResult {
  verified: boolean;
  format: 'JWT';
  message: string;
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
      const decoded = jose.decodeJwt(jwt);
      const header = jose.decodeProtectedHeader(jwt);

      return {
        header,
        payload: decoded
      };
    } catch (error) {
      return { error: `Invalid JWT format: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  // Handles JWT detection, decodes it, and resolves the issuer DID
  static async verifyJWT(jwt: string): Promise<JWTDetectionResult> {
    const decoded = this.decodeJWT(jwt);

    if ('error' in decoded) {
      return {
        verified: false,
        format: 'JWT',
        message: `JWT decoding failed: ${decoded.error}`,
        jwt,
        decoded
      };
    }

    let didDocument = null;
    let message = 'JWT decoded successfully';
    let verified = false;

    const issuer = decoded.payload.issuer;
    const kid = decoded.header.kid;
    
    const verificationMethodUrl = `${issuer}#${kid}`;
    console.log('verificationMethodUrl: ', verificationMethodUrl);

    let verificationMethod = null;

    try {
      const res = await documentLoader(verificationMethodUrl);
      verificationMethod = res.document;
      console.log('verificationMethod: ', verificationMethod);
    } catch (error) {
    console.error('Error resolving verification method: ', error);
    }

    if (verificationMethod.type === 'JsonWebKey' && verificationMethod.publicKeyJwk) {
      try {
        const jwk = { ...verificationMethod.publicKeyJwk };

        if (!jwk.alg && decoded.header.alg) {
          jwk.alg = decoded.header.alg;
        }
        
        const publicKey = await jose.importJWK(jwk);
        
        const verificationResult = await jose.jwtVerify(jwt, publicKey, {
          algorithms: [decoded.header.alg]
        });

        verified = true;
      } catch (error) {
        console.error('JWT verification failed: ', error);
      }
    }

    return {
      verified,
      format: 'JWT',
      message,
      jwt,
      decoded
    };
  }
}