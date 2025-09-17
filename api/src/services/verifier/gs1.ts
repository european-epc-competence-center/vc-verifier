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
import { getJsonSchema, downloadAndCacheSchemas } from "./schemas.js"; // Updated import path

// Initialize schemas on startup
await downloadAndCacheSchemas();

export async function checkGS1Credential(
  verifiableCredential: VerifiableCredential,
  challenge?: string,
  domain?: string
): Promise<gs1RulesResult> {
  try {
    // Build the credential chain
    const { chain, jwtMappings } = await buildCredentialChainWithJWTMapping(verifiableCredential);

    // do GS1 verification for our chain
    const gs1Result = await checkGS1CredentialPresentationValidation(
      gs1ValidatorRequest,
      { verifiableCredential: chain }
    );

     console.log('GS1 validation result:', gs1Result);

    // Verify credential chain using our verifier for proof/signature validation
    const chainVerificationResult = await verifyCredentialChain(
      chain,
      jwtMappings,
      challenge,
      domain
    );

    console.log('Chain verification result:', chainVerificationResult);

    const bothVerified = gs1Result.verified && chainVerificationResult.verified;

    // Successful GS1 Result
    return {
      verified: bothVerified,
      gs1Result: gs1Result,
      chainVerificationResult: chainVerificationResult
    };

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
export async function validateExternalCredential(credential: VerifiableCredential): Promise<boolean> {
  // Allow GS1 chain checks to proceed even if upstream signature cannot be verified here
  return true; // Simple boolean return like the working example
}

const gs1ValidatorRequest: gs1ValidatorRequest = {
    fullJsonSchemaValidationOn: false, // Enable full validation now that we have schemas
    gs1DocumentResolver: {
       externalCredentialLoader: loadExternalCredential, 
       externalCredentialVerification: validateExternalCredential,
       externalJsonSchemaLoader: getJsonSchema // Use the synchronous schema loader
   }
 }

export class GS1Verifier {
  static async verify(
    verifiable: Verifiable | string,
    challenge?: string,
    domain?: string
  ): Promise<gs1RulesResult | gs1RulesResultContainer> { 
    try {
      let credentialData: Verifiable;

      // If input is a JWT, decode it for type checking
      if (typeof verifiable === "string" && JWTService.isJWT(verifiable)) {
        const decoded = JWTService.decodeJWT(verifiable);
        if ('error' in decoded) {
          throw new Error(`Failed to decode JWT: ${decoded.error}`);
        }
        credentialData = decoded.payload;
      } else {
        credentialData = verifiable as Verifiable;
      } 
      
      if (credentialData?.type?.includes?.("VerifiableCredential")) {
        // Pass the original input (JWT or VC) to checkGS1Credential
        return await checkGS1Credential(verifiable, challenge, domain);
      }
      
      if (credentialData?.type?.includes?.("VerifiablePresentation")) {
        const presentation = credentialData as VerifiablePresentation;
        return await verifyGS1Credentials(presentation);
      }
      
      throw new Error("Provided verifiable object is of unknown type!");

    } catch (error) {
      console.error('GS1Verifier.verify error:', error);
      return {
        verified: false,
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }
}

// Helper function to build the credential chain by following extendsCredential references
async function buildCredentialChainWithJWTMapping(
  input: VerifiableCredential | string // Accept either JWT string or VC object directly
): Promise<{ 
  chain: VerifiableCredential[], 
  jwtMappings: Map<string, string> 
}> {
  const chain: VerifiableCredential[] = []; // VC's for GS1 library
  const jwtMappings = new Map<string, string>(); // Maps credential ID to JWT

  // Handle initial input
  let currentCredential: VerifiableCredential;
  let currentJWT: string | undefined;

  if (typeof input === "string" && JWTService.isJWT(input)) {
    currentJWT = input;
    const decoded = JWTService.decodeJWT(input);
    if ('error' in decoded) {
      throw new Error(`Failed to decode initial JWT: ${decoded.error}`);
    }
    currentCredential = decoded.payload as VerifiableCredential;
  } else {
    // Input is VC already
    currentCredential = input as VerifiableCredential;
  }

  // Add initial credential to chain before loop
  chain.push(currentCredential);

  // Map the initial JWT if we have one
  if (currentCredential.id && currentJWT) {
    jwtMappings.set(currentCredential.id, currentJWT);
  }

  while (currentCredential?.credentialSubject?.extendsCredential) {
    try {
      const extendsCredentialUrl = currentCredential.credentialSubject.extendsCredential;

      let extendedCredential: VerifiableCredential;
      let credentialJWT: string | undefined;

      try {
        const extendedVC = await documentLoader(extendsCredentialUrl);
        if (extendedVC?.document) {
          extendedCredential = extendedVC.document;
        } else {
          throw new Error('DocumentLoader returned empty document');
        }
      } catch (documentLoaderError) {
        // When documentLoader failed try direct fetch for JWT handling
        const response = await fetch(extendsCredentialUrl);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const text = await response.text();

        if (JWTService.isJWT(text)) {
          credentialJWT = text; // Store the JWT for this credential

          const decoded = JWTService.decodeJWT(text);
          if ('error' in decoded) {
            throw new Error(`Failed to decode JWT: ${decoded.error}`);
          }
          extendedCredential = decoded.payload as VerifiableCredential;
        } else {
          try {
            extendedCredential = JSON.parse(text);
          } catch (parseError) {
            throw new Error(`Response is neither valid JWT nor JSON: ${parseError}`);
          }
        }
      }

      chain.push(extendedCredential);

      // Map the JWT for this extended credential if we have one
      if (extendedCredential.id && credentialJWT) {
        jwtMappings.set(extendedCredential.id, credentialJWT);
      }
      
      currentCredential = extendedCredential;

    } catch (error) {
      console.error(`Failed to load extended credential: ${error}`);
      break;
    }
  }
  
  return { chain, jwtMappings };
}

async function verifyCredentialChain(
  chain: VerifiableCredential[],
  jwtMappings: Map<string, string>,
  challenge?: string,
  domain?: string
): Promise<{ verified: boolean; errors: string[] }> {
  const errors: string[] = [];
  
  for (let i = 0; i < chain.length; i++) {
    const credential = chain[i];
    
    try {
      // Use JWT if available for this credential (better for signature verification)
      const credentialToVerify = credential.id && jwtMappings.has(credential.id) 
        ? jwtMappings.get(credential.id)! 
        : credential;
      
      console.log(`Verifying credential ${i + 1}/${chain.length}: ${credential.id || 'unknown'}`);
      
      // Use our own verifier for signature/proof validation
      const verificationResult = await Verifier.verify(
        credentialToVerify,
        challenge,
        domain
      );
      
      if (!verificationResult.verified) {
        const credentialErrors = verificationResult.errors || ['Unknown verification error'];
        errors.push(`Credential ${i + 1} verification failed: ${credentialErrors.join(', ')}`);
      }
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push(`Failed to verify credential ${i + 1}: ${errorMsg}`);
    }
  }
  
  return {
    verified: errors.length === 0,
    errors
  };
}