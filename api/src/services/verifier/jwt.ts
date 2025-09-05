import * as jose from 'jose';
import { getResolver } from '../documentLoader/didresolver.js';

export interface JWTDetectionResult {
  verified: boolean;
  format: 'JWT';
  message: string;
  jwt: string;
  decoded: JWTDecoded | { error: string };
  didDocument?: any;
}

export interface JWTDecoded {
  header: any;
  payload: any;
}

export class JWTService {
  // Detects if input string is in JWT format
  static isJWT(input: string): boolean {
    if (typeof input !== 'string') return false;
    return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(input.trim());
  }

  // Decodes JWT without verification for inspection using jose
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
  static async handleJWT(jwt: string): Promise<JWTDetectionResult> {
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

    // Try to resolve the issuer DID if present
    try {
      const issuer = decoded.payload.issuer || decoded.payload.iss;
      if (issuer && issuer.startsWith('did:')) {
        console.log(`Resolving DID: ${issuer}`);
        
        // Resolve the DID to get the DID document
        const result = await getResolver().resolve(issuer);
        didDocument = result.didDocument;
        
        if (didDocument) {
          console.log(`DID resolved: ${issuer}`);
          message += ` - DID resolved: ${issuer}`;
        } else {
          message += ` - Failed to resolve DID: ${issuer}`;
        }
      }
    } catch (error) {
      console.error(`DID resolution error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      message += ` - DID resolution error`;
    }

    return {
      verified: false,
      format: 'JWT',
      message,
      jwt,
      decoded,
      didDocument
    };
  }
}
