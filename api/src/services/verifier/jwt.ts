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

export interface JWTVerificationResult {
  verified: boolean;
  message: string;
  payload?: any;
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
    let verified = false;

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
          
          // Attempt JWT verification if DID document is available
          const verificationResult = await this.verifyJWT(jwt, didDocument);
          verified = verificationResult.verified;
          
          if (verificationResult.verified) {
            message += ` - JWT signature verified`;
          } else {
            message += ` - JWT verification failed: ${verificationResult.message}`;
          }
        } else {
          message += ` - Failed to resolve DID: ${issuer}`;
        }
      }
    } catch (error) {
      console.error(`DID resolution error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      message += ` - DID resolution error`;
    }

    return {
      verified,
      format: 'JWT',
      message,
      jwt,
      decoded,
      didDocument
    };
  }

  // Verifies JWT signature using the DID document
  static async verifyJWT(jwt: string, didDocument: any): Promise<JWTVerificationResult> {
    try {
      // Decode the JWT header to get the key identifier
      const header = jose.decodeProtectedHeader(jwt);
      const kid = header.kid;
      console.log('kid: ', kid);

      if (!kid) {
        return {
          verified: false,
          message: 'JWT header missing required "kid" (key identifier)'
        };
      }

      // Find the verification method in the DID document
      const verificationMethods = didDocument.verificationMethod || [];
      const verificationMethod = verificationMethods.find((method: any) => 
        method.id.endsWith(`#${kid}`)
      );

      if (!verificationMethod) {
        return {
          verified: false,
          message: `No verification method found for key identifier: ${kid}`
        };
      }

      // Handle different key types
      let publicKey: any;

      if (verificationMethod.type === 'JsonWebKey' && verificationMethod.publicKeyJwk) {
        // Convert JWK to jose KeyLike object
        try {
          // Add the algorithm from JWT header to JWK if missing
          const jwk = { ...verificationMethod.publicKeyJwk };
          if (!jwk.alg && header.alg) {
            jwk.alg = header.alg;
            console.log('Added algorithm to JWK:', header.alg);
          }
          
          console.log('Complete JWK: ', JSON.stringify(jwk, null, 2));
          publicKey = await jose.importJWK(jwk);
          console.log('JWK imported successfully');
        } catch (importError) {
          console.error('Failed to import JWK:', importError);
          return {
            verified: false,
            message: `Failed to import JWK: ${importError instanceof Error ? importError.message : 'Unknown error'}`
          };
        }
      } else if (verificationMethod.type === 'Ed25519VerificationKey2020' && verificationMethod.publicKeyMultibase) {
        // TODO: Implement Ed25519 publicKeyMultibase handling...
        return {
          verified: false,
          message: `Ed25519VerificationKey2020 with publicKeyMultibase not yet implemented`
        };
      } else {
        return {
          verified: false,
          message: `Unsupported verification method type: ${verificationMethod.type}`
        };
      }

      // Verify the JWT signature
      console.log(`Attempting JWT signature verification with key: ${kid}`);
      const { payload } = await jose.jwtVerify(jwt, publicKey);

      return {
        verified: true,
        message: `JWT signature successfully verified using key: ${kid}`,
        payload
      };

    } catch (error) {
      console.error(`JWT verification error:`, error);
      return {
        verified: false,
        message: `JWT verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}