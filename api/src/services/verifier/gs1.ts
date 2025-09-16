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

    console.log(gs1Result);

    // Build the credential chain
    const chain = await buildCredentialChain(verifiableCredential);

    // If the credential is not verified at this point, no need to check further
    if (!gs1Result.verified) {
      return gs1Result;
    }

    // Verify the entire credential chain, passing the originalJWT for the first credential
    const chainVerificationResult = await verifyCredentialChain(chain, originalJWT, challenge, domain);
    
    console.log('Chain verification result:', chainVerificationResult);

    // If any credential in the chain failed verification, fail the whole validation
    if (!chainVerificationResult.verified) {
      return {
        ...gs1Result,
        verified: false,
        errors: [...(gs1Result.errors || []), ...chainVerificationResult.errors],
        // Add chain results to the response for debugging
        chainVerification: chainVerificationResult
      };
    }

    // All validations passed (GS1 rules + full chain verification)
    return {
      ...gs1Result,
      chainVerification: chainVerificationResult
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

// Helper function to build the credential chain by following extendsCredential references
async function buildCredentialChain(credential: VerifiableCredential): Promise<(VerifiableCredential | string)[]> {
  const chain: (VerifiableCredential | string)[] = [];
  let currentCredential = credential;
  
  // Add the initial credential to the chain
  chain.push(currentCredential);
  
  while (currentCredential?.credentialSubject?.extendsCredential) {
    try {
      const extendsUrl = currentCredential.credentialSubject.extendsCredential;
      console.log(`Loading extended credential from: ${extendsUrl}`);
      
      // Try using the documentLoader for standard cases, but catch JWT-related errors
      let extendedCredential: VerifiableCredential | string;
      
      try {
        const extendedVC = await documentLoader(extendsUrl);
        if (extendedVC?.document) {
          extendedCredential = extendedVC.document;
        } else {
          throw new Error('DocumentLoader returned empty document');
        }
      } catch (documentLoaderError) {
        // DocumentLoader failed, likely due to JWT response, try direct fetch
        const response = await fetch(extendsUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const text = await response.text();
        
        // Check if response looks like a JWT (3 parts separated by dots)
        if (JWTService.isJWT(text)) {
          // Add the JWT string to the chain
          extendedCredential = text;
          
          // Decode for next iteration
          const decoded = JWTService.decodeJWT(text);
          if ('error' in decoded) {
            throw new Error(`Failed to decode JWT: ${decoded.error}`);
          }
          currentCredential = decoded.payload as VerifiableCredential;
        } else {
          // Try parsing as regular JSON
          try {
            extendedCredential = JSON.parse(text);
            currentCredential = extendedCredential as VerifiableCredential;
          } catch (parseError) {
            throw new Error(`Response is neither valid JWT nor JSON: ${parseError}`);
          }
        }
      }
      
      // If we got a VerifiableCredential object (not JWT), use it for both chain and next iteration
      if (typeof extendedCredential === 'object') {
        currentCredential = extendedCredential;
      }
      
      chain.push(extendedCredential);
      
    } catch (error) {
      console.error(`Failed to load extended credential: ${error}`);
      break; // Stop the chain if we can't load a credential
    }
  }
  
  console.log(`Built credential chain with ${chain.length} credentials:`);
  chain.forEach((cred, index) => {
    if (typeof cred === 'string') {
      console.log(`  ${index}: JWT (${cred.substring(0, 50)}...)`);
    } else {
      console.log(`  ${index}: Credential ID: ${cred.id || 'unknown'}, Name: ${cred.name || cred.credentialSubject?.name || 'unknown'}`);
    }
  });
  
  return chain;
}

// Helper function to verify the entire credential chain
async function verifyCredentialChain(
  chain: (VerifiableCredential | string)[],
  originalJWT?: string,
  challenge?: string,
  domain?: string
): Promise<{ verified: boolean; errors: string[]; chainResults: any[] }> {
  const chainResults: any[] = [];
  const allErrors: string[] = [];
  let allVerified = true;

  console.log(`Verifying credential chain with ${chain.length} credentials...`);

  for (let i = 0; i < chain.length; i++) {
    const credential = chain[i];
    console.log(`Verifying credential ${i}...`);

    try {
      let verificationInput: string | VerifiableCredential;
      
      // For the first credential (index 0), use the original JWT if available
      // since the chain[0] is the decoded JSON without proof
      if (i === 0 && originalJWT) {
        verificationInput = originalJWT;
        console.log(`Using original JWT for credential ${i}`);
      } else {
        verificationInput = credential;
        console.log(`Using ${typeof credential === 'string' ? 'JWT' : 'VC object'} for credential ${i}`);
      }

      // Use our verifier for each credential in the chain
      const verifierResult = await Verifier.verify(verificationInput, challenge, domain);
      
      chainResults.push({
        index: i,
        credentialId: typeof credential === 'string' ? 'JWT' : credential.id,
        verified: verifierResult.verified,
        errors: verifierResult.errors || []
      });

      if (!verifierResult.verified) {
        allVerified = false;
        allErrors.push(...(verifierResult.errors || []));
      }

      console.log(`Credential ${i} verification result:`, {
        verified: verifierResult.verified,
        errors: verifierResult.errors
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Failed to verify credential ${i}:`, errorMessage);
      
      chainResults.push({
        index: i,
        credentialId: typeof credential === 'string' ? 'JWT' : credential.id,
        verified: false,
        errors: [errorMessage]
      });

      allVerified = false;
      allErrors.push(errorMessage);
    }
  }

  console.log(`Chain verification complete. Overall verified: ${allVerified}`);
  
  return {
    verified: allVerified,
    errors: allErrors,
    chainResults
  };
}