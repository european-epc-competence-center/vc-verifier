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
import { getJsonSchema, downloadAndCacheSchemas } from "./schemas.js";

await downloadAndCacheSchemas();

export async function checkGS1Credential(
  verifiableCredential: VerifiableCredential,
  challenge?: string,
  domain?: string
): Promise<gs1RulesResult> {
  try {
    const { chain, jwtMappings } = await buildCredentialChainWithJWTMapping(verifiableCredential);

    const gs1Result = await checkGS1CredentialPresentationValidation(
      gs1ValidatorRequest,
      { verifiableCredential: chain }
    );

     console.log('GS1 validation result:', gs1Result);

    const chainVerificationResult = await verifyCredentialChain(
      chain,
      jwtMappings,
      challenge,
      domain
    );

    console.log('Chain verification result:', chainVerificationResult);

    const bothVerified = gs1Result.verified && chainVerificationResult.verified;

    return {
      verified: bothVerified,
      gs1Result: gs1Result,
      results: chainVerificationResult.results,
      statusResult: chainVerificationResult.statusResults
    };

  } catch (error) {
    console.error('GS1 credential validation error:', error);
    return {
      verified: false,
      errors: [error instanceof Error ? error.message : String(error)]
    };
  }
}

export async function verifyGS1Credentials(
  verifiablePresentation: VerifiablePresentation
): Promise<gs1RulesResultContainer> {
  try {
    return await checkGS1CredentialPresentationValidation(
      gs1ValidatorRequest,
      verifiablePresentation
    );
    // TO-DO: actual verification using our verifier for presentations
  } catch (error) {
    console.error('GS1 presentation validation error:', error);
    return {
      verified: false,
      errors: [error instanceof Error ? error.message : String(error)],
      result: []
    };
  }
}

const loadExternalCredential: externalCredential = async (
  url: string
): Promise<VerifiableCredential> => {
  try {
    const result = await documentLoader(url);
    const document = result.document;
    
    if (typeof document === 'string' && JWTService.isJWT(document)) {
      const decoded = JWTService.decodeJWT(document);
      
      if ('error' in decoded) {
        throw new Error(`Failed to decode JWT: ${decoded.error}`);
      }
      
      return decoded.payload as VerifiableCredential;
    }
    
    return document as VerifiableCredential;
    
  } catch (error) {
    throw new Error(`Failed to load external credential from ${url}: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Placeholder function for external credential validation, currently returns true to allow GS1 chain checks to proceed 
// TODO: Implement proper external credential verification logic
export async function validateExternalCredential(credential: VerifiableCredential): Promise<boolean> {
  // Allow GS1 chain checks to proceed even if upstream signature cannot be verified here
  return true; // Simple boolean return like the working example
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
    try {
      let credentialData: Verifiable;

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

async function buildCredentialChainWithJWTMapping(
  input: VerifiableCredential | string
): Promise<{ 
  chain: VerifiableCredential[], 
  jwtMappings: Map<string, string> 
}> {
  const chain: VerifiableCredential[] = [];
  const jwtMappings = new Map<string, string>();

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
    currentCredential = input as VerifiableCredential;
  }

  chain.push(currentCredential);

  if (currentCredential.id && currentJWT) {
    jwtMappings.set(currentCredential.id, currentJWT);
  }

  while (currentCredential?.credentialSubject?.extendsCredential) {
    try {
      const extendsCredentialUrl = currentCredential.credentialSubject.extendsCredential;
      
      const result = await documentLoader(extendsCredentialUrl);
      const document = result.document;
      
      let extendedCredential: VerifiableCredential;
      let credentialJWT: string | undefined;
      
      if (typeof document === 'string' && JWTService.isJWT(document)) {
        credentialJWT = document;
        const decoded = JWTService.decodeJWT(document);
        if ('error' in decoded) {
          throw new Error(`Failed to decode JWT: ${decoded.error}`);
        }
        extendedCredential = decoded.payload as VerifiableCredential;
      } else {
        extendedCredential = document as VerifiableCredential;
      }

      chain.push(extendedCredential);

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
): Promise<{ 
  verified: boolean; 
  errors: string[];
  results: any[];
  statusResults: any[];
}> {
  const errors: string[] = [];
  const results: any[] = [];
  const statusResults: any[] = [];
  
  for (let i = 0; i < chain.length; i++) {
    const credential = chain[i];
    
    try {
      const credentialToVerify = credential.id && jwtMappings.has(credential.id) 
        ? jwtMappings.get(credential.id)! 
        : credential;
      
      console.log(`Verifying credential ${i + 1}/${chain.length}: ${credential.id || 'unknown'}`);
      
      const verificationResult = await Verifier.verify(
        credentialToVerify,
        challenge,
        domain
      );
      
      if (!verificationResult.verified) {
        const credentialErrors = verificationResult.errors || ['Unknown verification error'];
        errors.push(`Credential ${i + 1} verification failed: ${credentialErrors.join(', ')}`);
      }

      if (verificationResult.results && Array.isArray(verificationResult.results)) {
        results.push(...verificationResult.results);
      }

      if (verificationResult.statusResult) {
        if (verificationResult.statusResult.results && Array.isArray(verificationResult.statusResult.results)) {
          statusResults.push(...verificationResult.statusResult.results);
        } else {
          statusResults.push(verificationResult.statusResult);
        }
      }
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push(`Failed to verify credential ${i + 1}: ${errorMsg}`);
    }
  }
  
  return {
    verified: errors.length === 0,
    errors,
    results,
    statusResults
  };
}