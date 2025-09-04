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
  // Detects if input string is in JWT format
  static isJWT(input: string): boolean {
    if (typeof input !== 'string') return false;
    return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(input.trim());
  }

  // Decodes JWT without verification for inspection
  static decodeJWT(jwt: string): JWTDecoded | { error: string } {
    try {
      const [header, payload] = jwt.split('.');
      return {
        header: JSON.parse(Buffer.from(header, 'base64url').toString()),
        payload: JSON.parse(Buffer.from(payload, 'base64url').toString())
      };
    } catch (error) {
      return { error: 'Invalid JWT format' };
    }
  }

  /**
   * Handles JWT detection and returns appropriate response
   * TODO: Implement actual JWT verification using did-jwt and did-jwt-vc
   */
  static async handleJWT(jwt: string): Promise<JWTDetectionResult> {
    return {
      verified: false,
      format: 'JWT',
      message: 'JWT format detected - verification not yet implemented',
      jwt,
      decoded: this.decodeJWT(jwt)
    };
  }

  /**
   * Future: Add JWT verification methods here
   * - verifyJWTCredential(jwt: string): Promise<VerificationResult>
   * - verifyJWTPresentation(jwt: string): Promise<VerificationResult>
   * - resolveIssuerDID(did: string): Promise<DIDDocument>
   */
}
