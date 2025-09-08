import * as jose from 'jose';
import { documentLoader } from '../documentLoader/index.js';

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

  static async verifyJWT(jwt: string): Promise<JWTDetectionResult> {
    const decoded = this.decodeJWT(jwt);

    if ('error' in decoded) {
      return {
        verified: false,
        results: [{
          jwt,
          decoded
        }]
      };
    }

    let verified = false;

    const issuer = decoded.payload.issuer?.id || decoded.payload.issuer;
    const kid = decoded.header.kid;
    
    if (!issuer || !kid) {
      return {
        verified: false,
        results: [{
          jwt,
          decoded
        }]
      };
    }
    
    const verificationMethodUrl = `${issuer}#${kid}`;

    let verificationMethod = null;

    try {
      const res = await documentLoader(verificationMethodUrl);
      verificationMethod = res.document;
    } catch (error) {
      console.error('Error resolving verification method: ', error);
      return {
        verified: false,
        results: [{
          jwt,
          decoded
        }]
      };
    }

    if (!verificationMethod) {
      return {
        verified: false,
        results: [{
          jwt,
          decoded
        }]
      };
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
        
        // If we reach this point, verification was successful
        verified = true;

      } catch (error) {
        console.error('JWT verification failed: ', error);
        return {
          verified: false,
          results: [{
            jwt,
            decoded
          }]
        };
      }
    } else {
      return {
        verified: false,
        results: [{
          jwt,
          decoded
        }]
      };
    }

    return {
      verified,
      results: [{
        jwt,
        decoded
      }]
    };
  }
}