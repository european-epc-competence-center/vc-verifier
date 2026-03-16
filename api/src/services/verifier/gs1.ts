import { checkGS1CredentialPresentationValidation, 
  checkGS1CredentialWithoutPresentation,
  externalCredential, 
  verifyExternalCredential, 
  gs1RulesResult, 
  gs1RulesResultContainer, 
  VerifiableCredential as GS1VerifiableCredential,
  VerifiablePresentation as GS1VerifiablePresentation, 
  gs1ValidatorRequest,
  verifiableJwt as gs1VerifiableJwt,
  // @ts-ignore
} from "@eecc/vc-verifier-rules";

import { documentLoader } from "../documentLoader/index.js";
import { Verifier } from "./index.js";
import { JWTService } from "./jwt.js";
import { getJsonSchema, downloadAndCacheSchemas } from "./schemas.js";

await downloadAndCacheSchemas();

// Type guard to check if an object can be used as a Verifiable
function isVerifiableObject(obj: any): obj is Verifiable | VerifiableCredential | VerifiablePresentation {
  return obj && 
         typeof obj === 'object' && 
         obj.type && 
         (Array.isArray(obj.type) || typeof obj.type === 'string');
}

// Normalize GS1 types to internal Verifiable types
// The GS1 library allows type: string | string[] | undefined
// But our Verifier requires type: string[]
function normalizeVerifiable(credential: GS1VerifiableCredential | gs1VerifiableJwt | string): Verifiable | VerifiableCredential | string {
  // If it's a string (JWT), pass through
  if (typeof credential === 'string') {
    return credential;
  }
  
  // If type is already an array, pass through
  if (Array.isArray(credential.type)) {
    return credential as unknown as Verifiable;
  }
  
  // If type is a string, normalize to array
  if (typeof credential.type === 'string') {
    return {
      ...credential,
      type: [credential.type]
    } as unknown as Verifiable;
  }
  
  // If type is undefined or missing, this is invalid
  throw new Error('Invalid verifiable object: missing type property');
}

// Helper function to extract credential information
function extractCredentialInfo(credential: GS1VerifiableCredential | gs1VerifiableJwt | string) {
  let credentialPayload: any;
  
  // Handle JWT credentials
  if (typeof credential === 'string' && JWTService.isJWT(credential)) {
    const decoded = JWTService.decodeJWT(credential);
    if ('error' in decoded) {
      return {
        credentialId: 'jwt-credential-decode-error',
        credentialName: 'jwt-credential-decode-error'
      };
    }
    credentialPayload = decoded.payload;
  } else {
    // Handle JSON-LD credentials
    credentialPayload = credential as GS1VerifiableCredential;
  }
  
  // Extract ID (use the credentials id field)
  const credentialId = credentialPayload?.id || 'unknown';
  
  // Extract Name (use the most specific type, excluding "VerifiableCredential")
  let credentialName = 'unknown';
  const typeArray = Array.isArray(credentialPayload?.type) 
    ? credentialPayload.type 
    : (typeof credentialPayload?.type === 'string' ? [credentialPayload.type] : []);
  
  // Find the most specific type (not "VerifiableCredential")
  const specificType = typeArray.find((t: string) => t !== 'VerifiableCredential');
  if (specificType) {
    credentialName = specificType;
  }
  
  return { credentialId, credentialName };
}

export async function checkGS1Credential(
  verifiableCredential: GS1VerifiableCredential | gs1VerifiableJwt | string,
  challenge?: string,
  domain?: string
): Promise<gs1RulesResult> {
  return await checkGS1CredentialWithoutPresentation(
    gs1ValidatorRequest, verifiableCredential
  );
}

export async function verifyGS1Credentials(
  verifiablePresentation: GS1VerifiablePresentation
): Promise<gs1RulesResultContainer> {
  return await checkGS1CredentialPresentationValidation(
      gs1ValidatorRequest,
      verifiablePresentation
    );
}

const loadExternalCredential: externalCredential = async (
  url: string
): Promise<GS1VerifiableCredential> => {
  try {
    const result = await documentLoader(url);
    return result.document;
    
  } catch (error) {
    throw new Error(`Failed to load external credential from ${url}: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const validateExternalCredential: verifyExternalCredential = async (
  credential: GS1VerifiableCredential | gs1VerifiableJwt | string,
  challenge?: string,
  domain?: string
): Promise<gs1RulesResult> => {
  // Normalize the GS1 credential type to our internal Verifiable type
  const normalizedCredential = normalizeVerifiable(credential);
  const credVerificationResult = await Verifier.verify(normalizedCredential, challenge, domain);

  const errors: any[] = [];

  const isSignatureValid = () => {
    return !credVerificationResult.results || 
           credVerificationResult.results.every(result => result.verified);
  };
  
  const isStatusValid = () => {
    // If no status check is required, consider it valid
    // If status check exists, it must pass verification
    return !credVerificationResult.statusResult || 
           credVerificationResult.statusResult.verified;
  };
  
  // Check signature verification: Add error
  if (!isSignatureValid()) {
    errors.push({
      code: "VC-100", // Official verification error code from GS1 package
      rule: "Credential signature verification failed."
    });
  }
  
  // Check status verification: Add error
  if (!isStatusValid()) {
    errors.push({
      code: "VC-110", // Custom code for status verification failures (revocation).
      rule: "Credential status verification failed (credential is revoked)."
    });
  }
  
  const { credentialId, credentialName } = extractCredentialInfo(credential);
  
  // Credential is verified only if both signature and status are valid
  const isVerified = isSignatureValid() && isStatusValid();
  
  return {
    verified: isVerified,
    errors,
    credentialId,
    credentialName,
  } as gs1RulesResult;
};

const gs1ValidatorRequest: gs1ValidatorRequest = {
    fullJsonSchemaValidationOn: true,
    gs1DocumentResolver: {
       externalCredentialLoader: loadExternalCredential, 
       externalCredentialVerification: validateExternalCredential,
       externalJsonSchemaLoader: getJsonSchema
   }
}

interface GS1VerificationResponse {
  verified: boolean;
  gs1Result: gs1RulesResult | gs1RulesResultContainer;
  statusResult?: any;
  results?: any[];
  errorMessage?: string;
}

export class GS1Verifier {
  static async verify(
    verifiable: Verifiable | VerifiableCredential | GS1VerifiableCredential | gs1VerifiableJwt | string,
    challenge?: string,
    domain?: string
  ): Promise<GS1VerificationResponse> { 
    try {
      // Normalize the credential type if needed (for GS1 types)
      const normalizedVerifiable = typeof verifiable === 'string' || isVerifiableObject(verifiable)
        ? (typeof verifiable === 'string' ? verifiable : normalizeVerifiable(verifiable as any))
        : verifiable;
      
      // Perform standard credential/presentation verification
      const credentialVerificationResult = await Verifier.verify(normalizedVerifiable as any, challenge, domain);
      
      // Extract credential payload for type checking
      const credentialPayload = this.extractCredentialPayload(verifiable);
      
      // Perform GS1 validation based on type
      const gs1Result = await this.performGS1Validation(credentialPayload, verifiable, challenge, domain);
      
      // Build unified response
      return this.buildUnifiedResponse(credentialVerificationResult, gs1Result);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        verified: false,
        gs1Result: {
          verified: false,
          credentialId: 'unknown',
          credentialName: 'unknown',
          errors: [{
            code: "GS1-010", // Official error code for credential resolution errors
            rule: `Error resolving or processing credential: ${errorMessage}`
          }]
        } as gs1RulesResult,
        errorMessage
      };
    }
  }

  private static async performGS1Validation(
    credentialPayload: any,
    originalVerifiable: any,
    challenge?: string,
    domain?: string
  ): Promise<gs1RulesResult | gs1RulesResultContainer> {
    // Normalize type to array for checking
    const types = Array.isArray(credentialPayload?.type) 
      ? credentialPayload.type 
      : (typeof credentialPayload?.type === 'string' ? [credentialPayload.type] : []);
    
    if (types.includes("VerifiableCredential")) {
      return await checkGS1Credential(originalVerifiable, challenge, domain);
    }
    
    if (types.includes("VerifiablePresentation")) {
      return await verifyGS1Credentials(credentialPayload);
    }
    
    throw new Error("Provided verifiable object is of unknown type!");
  }

  private static extractCredentialPayload(verifiable: any): any {
    if (typeof verifiable === "string" && JWTService.isJWT(verifiable)) {
      const decoded = JWTService.decodeJWT(verifiable);
      if ('error' in decoded) {
        throw new Error(`Failed to decode JWT: ${decoded.error}`);
      }
      return decoded.payload;
    }
    return verifiable;
  }

  private static buildUnifiedResponse(
    credentialVerificationResult: any,
    gs1Result: gs1RulesResult | gs1RulesResultContainer
  ): GS1VerificationResponse {
    
    const response: GS1VerificationResponse = {
      verified: credentialVerificationResult.verified && gs1Result.verified,
      gs1Result,
      statusResult: credentialVerificationResult.statusResult,
      results: credentialVerificationResult.results
    };

    return response;
  }
}