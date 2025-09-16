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
  // @ts-ignore
} from "@gs1us/vc-verifier-rules";

import { documentLoader } from "../documentLoader/index.js";
import { Verifier } from "./index.js";
import { JWTService } from "./jwt.js";

export async function checkGS1Credential(
  verifiableCredential: VerifiableCredential,
  originalJWT?: string,
  challenge?: string,
  domain?: string
): Promise<gs1RulesResult> {
  try {
    const gs1Result = await checkGS1CredentialWithoutPresentation(
      gs1ValidatorRequest,
      verifiableCredential
    );

    // TODO: DO OUR VERIFICATION HERE
    console.log(gs1Result);

    // If the credential is not verified at this point, no need to check further
    if (!gs1Result.verified) {
      return gs1Result;
    }

    // GS1 validation passed, now verify the signature if we have the original JWT
    try {
        const verifierInput = originalJWT || verifiableCredential;
        const verifierResult = await Verifier.verify(verifierInput, challenge, domain);
        console.log(verifierResult);

        if (!verifierResult) {
          return {
            ...gs1Result,
            verified: false,
            errors: [...(gs1Result.errors || []), ...(verifierResult.errors || [])]
          };
        }

        // Both validations passed
      return gs1Result;
    } catch (verifierError) {
      return {
        ...gs1Result,
        verified: false,
        errors: [...(gs1Result.errors || []), verifierError instanceof Error ? verifierError.message : String(verifierError)]
      };
    }

  } catch (error) {
    console.error('GS1 credential validation error:', error);
    return {
      verified: false,
      errors: [error instanceof Error ? error.message : String(error)]
    };
  }
}

// Check if the Verifiable Presentation for any GS1 Credential and if so check the GS1 Credential Rules
export async function verifyGS1Credentials(
  verifiablePresentation: VerifiablePresentation
): Promise<gs1RulesResultContainer> {
  try {
    return await checkGS1CredentialPresentationValidation(
      gs1ValidatorRequest,
      verifiablePresentation
    );
    // TODO: actual verification using our verifier for presentations

  } catch (error) {
    console.error('GS1 presentation validation error:', error);
    return {
      verified: false,
      errors: [error instanceof Error ? error.message : String(error)],
      result: []
    };
  }
}


// loadExternalCredential
const loadExternalCredential: externalCredential = async (
  url: string
): Promise<VerifiableCredential> => {
  try {
    // Try using the documentLoader for standard cases, but catch JWT-related errors
    try {
      const extendedVC = await documentLoader(url);
      if (extendedVC?.document) {
        return extendedVC.document;
      }
    } catch (documentLoaderError) {
      // DocumentLoader failed, likely due to JWT response, try direct fetch
    }
    
    // DocumentLoader failed or returned empty, try direct fetch for JWT handling
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const text = await response.text();
    
    // Check if response looks like a JWT (3 parts separated by dots)
    if (JWTService.isJWT(text)) {
      const decoded = JWTService.decodeJWT(text);
      
      if ('error' in decoded) {
        throw new Error(`Failed to decode JWT: ${decoded.error}`);
      }
      
      return decoded.payload as VerifiableCredential;
    }
    
    // Try parsing as regular JSON
    try {
      return JSON.parse(text);
    } catch (parseError) {
      throw new Error(`Response is neither valid JWT nor JSON: ${parseError}`);
    }
    
  } catch (error) {
    throw error;
  }
};

// Placeholder function for external credential validation, currently returns true to allow GS1 chain checks to proceed 
// TODO: Implement proper external credential verification logic
export async function validateExternalCredential(credential: VerifiableCredential): Promise<gs1RulesResult> {
  // Allow GS1 chain checks to proceed even if upstream signature cannot be verified here
  const credentialId = credential.id || "unknown";
  const credentialName = credential.name || "unknown";
  
  return { 
    credential: credential,
    credentialId: credentialId, 
    credentialName: credentialName, 
    verified: true, 
    errors: [] 
  };
}

// Fetches and returns a JSON schema from the provided URL
export async function getJsonSchema(schemaUrl: string): Promise<any> {
  try {
    const response = await fetch(schemaUrl);
    if (response.ok) {
      return await response.json();
    }
    // If fetch fails, return empty buffer for graceful fallback
    return Buffer.from("");
  } catch {
    return Buffer.from('');
  }
}

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
    verifiable: Verifiable | string,
    challenge?: string,
    domain?: string
  ): Promise<gs1RulesResult | gs1RulesResultContainer> {
    let result;
    let actualVerifiable: Verifiable;
    let originalJWT: string | undefined;
    
    try {
      // If input is a JWT, decode it first
      if (typeof verifiable === "string" && JWTService.isJWT(verifiable)) {
        originalJWT = verifiable; // store original JWT as its needed later for signature verification
        const decoded = JWTService.decodeJWT(verifiable);
        if ('error' in decoded) {
          throw new Error(`Failed to decode JWT: ${decoded.error}`);
        }
        actualVerifiable = decoded.payload;
      } else {
        actualVerifiable = verifiable as Verifiable;
      } 
      
      if (actualVerifiable?.type?.includes?.("VerifiableCredential")) {
        result = await checkGS1Credential(
          actualVerifiable,
          originalJWT,
          challenge,
          domain
        );
      }
      
      if (actualVerifiable?.type?.includes?.("VerifiablePresentation")) {
        const presentation = actualVerifiable as VerifiablePresentation;
        result = await verifyGS1Credentials(
          presentation
        );
      }
      
      if (!result) throw new Error("Provided verifiable object is of unknown type!");
      return result;
    } catch (error) {
      console.error('GS1Verifier.verify error:', error);
      // Return a failed result instead of throwing
      return {
        verified: false,
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }
}
