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
import { fetch_json } from "../fetch/index.js";

// not using this in the gs1verifier flow, verifying afterwards ourselves
export function getVerifierFunction(challenge?: string, domain?: string) {
  return async function (verifiable: any) {
    return await Verifier.verify(verifiable, challenge, domain);
  };
}

export async function checkGS1Credential(
  verifiableCredential: VerifiableCredential
): Promise<gs1RulesResult> {
  try {
    return await checkGS1CredentialWithoutPresentation(
      gs1ValidatorRequest,
      verifiableCredential
    );
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

/**
 * Placeholder function for external credential validation
 * Currently returns true to allow GS1 chain checks to proceed
 * TODO: Implement proper external credential verification logic
 */
export async function validateExternalCredential(credential: any): Promise<boolean> {
  // Allow GS1 chain checks to proceed even if upstream signature cannot be verified here
  // This is a placeholder implementation that should be replaced with actual validation logic
  // For now validation will happen after GS1 rules have been checked, since GS1 rules do not support jwts
  return true;
}

/**
 * Fetches and returns a JSON schema from the provided URL
 */
export async function getJsonSchema(schemaUrl: string): Promise<any> {
  try {
    const schema = await fetch_json(schemaUrl);
    if (!schema) {
      throw new Error(`Failed to fetch schema from ${schemaUrl}: Empty response`);
    }
    return schema;
  } catch (error) {
    throw new Error(`Failed to fetch JSON schema from ${schemaUrl}: ${error}`);
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
    
    try {
      if (typeof verifiable === "string" && JWTService.isJWT(verifiable)) {
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
          actualVerifiable
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
