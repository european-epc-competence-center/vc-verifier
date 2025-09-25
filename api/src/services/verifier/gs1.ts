import { checkGS1CredentialPresentationValidation, 
  checkGS1CredentialWithoutPresentation,
  externalCredential, 
  verifyExternalCredential, 
  gs1RulesResult, 
  gs1RulesResultContainer, 
  VerifiableCredential,
  VerifiablePresentation, 
  gs1ValidatorRequest,
  verifiableJwt,
  // @ts-ignore
} from "@eecc/vc-verifier-rules";

import { documentLoader } from "../documentLoader/index.js";
import { Verifier } from "./index.js";
import { JWTService } from "./jwt.js";
import { getJsonSchema, downloadAndCacheSchemas } from "./schemas.js";

await downloadAndCacheSchemas();

export async function checkGS1Credential(
  verifiableCredential: VerifiableCredential | verifiableJwt | string,
  challenge?: string,
  domain?: string
): Promise<gs1RulesResult> {
  return await checkGS1CredentialWithoutPresentation(
    gs1ValidatorRequest, verifiableCredential
  );
}

export async function verifyGS1Credentials(
  verifiablePresentation: VerifiablePresentation
): Promise<gs1RulesResultContainer> {
  return await checkGS1CredentialPresentationValidation(
      gs1ValidatorRequest,
      verifiablePresentation
    );
}

const loadExternalCredential: externalCredential = async (
  url: string
): Promise<VerifiableCredential> => {
  try {
    const result = await documentLoader(url);
    return result.document;
    
  } catch (error) {
    throw new Error(`Failed to load external credential from ${url}: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// TODO: Implement proper external credential verification logic
export const validateExternalCredential: verifyExternalCredential = async (
  credential: VerifiableCredential | verifiableJwt | string,
  challenge?: string,
  domain?: string
): Promise<gs1RulesResult> => {
  const credVerificationResult = await Verifier.verify(credential, challenge, domain);

  return {
    verified: credVerificationResult.verified,
    errors: [],
    credentialId: typeof credential === 'string' ? 'jwt-credential' : (credential as any)?.id || 'unknown',
    credentialName: 'External Credential',
    // Add any other required properties for gs1RulesResult
  } as gs1RulesResult;
};

const gs1ValidatorRequest: gs1ValidatorRequest = {
    fullJsonSchemaValidationOn: false,
    gs1DocumentResolver: {
       externalCredentialLoader: loadExternalCredential, 
       externalCredentialVerification: validateExternalCredential,
       externalJsonSchemaLoader: getJsonSchema
   }
}

export class GS1Verifier {
  static async verify(
    verifiable: Verifiable | VerifiableCredential | verifiableJwt | string,
    challenge?: string,
    domain?: string
  ): Promise<any> { 
    try {
      // First, verify the actual credential/presentation using standard verifier
      const credVerificationResult = await Verifier.verify(verifiable, challenge, domain);
      
      let cred: any;
      if (typeof verifiable === "string" && JWTService.isJWT(verifiable)) {
        const decoded = JWTService.decodeJWT(verifiable);
        if ('error' in decoded) {
          throw new Error(`Failed to decode JWT: ${decoded.error}`);
        }
        cred = decoded.payload;
      } else {
        cred = verifiable as VerifiableCredential;
      } 
      
      let gs1Result: gs1RulesResult | gs1RulesResultContainer;
      
      if (cred?.type?.includes?.("VerifiableCredential")) {
        // Get GS1 validation result for credential
        gs1Result = await checkGS1Credential(verifiable as VerifiableCredential | verifiableJwt | string, challenge, domain);
        
        // Build unified response for credential
        return {
          verified: credVerificationResult.verified && gs1Result.verified,
          gs1Result,
          statusResult: credVerificationResult.statusResult,
          results: credVerificationResult.results, // For JWT credentials
          error: !credVerificationResult.verified ? credVerificationResult.error : 
                 !gs1Result.verified ? { name: 'GS1 Validation Failed', errors: gs1Result.errors } : undefined
        };
      }
      
      if (cred?.type?.includes?.("VerifiablePresentation")) {
        const presentation = cred as VerifiablePresentation;
        // Get GS1 validation result for presentation
        gs1Result = await verifyGS1Credentials(presentation);
        
        // Build unified response for presentation
        return {
          verified: credVerificationResult.verified && gs1Result.verified,
          gs1Result,
          presentationResult: { verified: credVerificationResult.verified },
          statusResult: credVerificationResult.statusResult,
          error: !credVerificationResult.verified ? credVerificationResult.error : 
                 !gs1Result.verified ? { name: 'GS1 Validation Failed', errors: gs1Result.result?.map(r => r.errors).flat() || [] } : undefined
        };
      }
      
      throw new Error("Provided verifiable object is of unknown type!");

    } catch (error) {
      console.error('GS1Verifier.verify error:', error);
      // Return error in expected format
      return {
        verified: false,
        error: {
          name: error instanceof Error ? error.message : 'Unknown error',
          errors: [error instanceof Error ? error.message : String(error)]
        }
      };
    }
  }
}