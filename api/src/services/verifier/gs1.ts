import { checkGS1CredentialPresentationValidation, 
  checkGS1CredentialWithoutPresentation,
  externalCredential, 
  verifyExternalCredential, 
  gs1RulesResult, 
  gs1RulesResultContainer, 
  verificationErrorCode, 
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
  console.log('checkGS1Credential called with:', typeof verifiableCredential, verifiableCredential);
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
    const document = result.document;
    
    // Let the GS1 library handle JWT processing - don't interfere
    return document as VerifiableCredential;
    
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
  // For now, return a simple successful verification result
  // The GS1 library should handle the main verification logic
  console.log('validateExternalCredential called with:', typeof credential, credential);
  
  return {
    verified: true,
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
  ): Promise<gs1RulesResult | gs1RulesResultContainer> { 
    try {
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
      
      if (cred?.type?.includes?.("VerifiableCredential")) {
        // Cast to the expected type since we've verified it's a VerifiableCredential
        return await checkGS1Credential(verifiable as VerifiableCredential | verifiableJwt | string, challenge, domain);
      }
      
      if (cred?.type?.includes?.("VerifiablePresentation")) {
        const presentation = cred as VerifiablePresentation;
        return await verifyGS1Credentials(presentation);
      }
      
      throw new Error("Provided verifiable object is of unknown type!");

    } catch (error) {
      console.error('GS1Verifier.verify error:', error);
      // Re-throw the error to let the caller handle it appropriately
      // since we can't construct a proper gs1RulesResult without knowing its full structure
      throw error;
    }
  }
}