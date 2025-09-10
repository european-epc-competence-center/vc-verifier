import {
  checkGS1CredentialPresentation,
  checkGS1CredentialWithoutPresentation,
  externalCredential,
  verifyExternalCredential,
  gs1RulesResult,
  gs1RulesResultContainer,
  verificationErrorCode,
  VerifiableCredential,
  VerifiablePresentation,
  // @ts-ignore
} from "@gs1us/vc-verifier-rules";

import { documentLoader } from "../documentLoader/index.js";
import { Verifier } from "./index.js";
import { JWTService } from "./jwt.js";


export function getVerifierFunction(challenge?: string, domain?: string) {
  return async function (verifiable: any) {
    return await Verifier.verify(verifiable, challenge, domain);
  };
}

const getExternalCredential: externalCredential = async (
  url: string
): Promise<VerifiableCredential> => {
  const extendedVC = await documentLoader(url);
  return extendedVC.document;
};

export async function checkGS1Credential(
  verifiableCredential: VerifiableCredential,
  checkExternalCredential: verifyExternalCredential
): Promise<gs1RulesResult> {
  return await checkGS1CredentialWithoutPresentation(
    getExternalCredential,
    checkExternalCredential,
    verifiableCredential
  );
}

// Check if the Verifiable Presentation for any GS1 Credential and if so check the GS1 Credential Rules
export async function verifyGS1Credentials(
  verifiablePresentation: VerifiablePresentation,
  checkExternalCredential: verifyExternalCredential
): Promise<gs1RulesResultContainer> {
  return await checkGS1CredentialPresentation(
    getExternalCredential,
    checkExternalCredential,
    verifiablePresentation
  );
}

export class GS1Verifier {
  static async verify(
    verifiable: Verifiable | string,
    challenge?: string,
    domain?: string
  ): Promise<gs1RulesResult | gs1RulesResultContainer> {
    let result;
    let actualVerifiable: Verifiable;
    
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
        actualVerifiable,
        getVerifierFunction(challenge, domain)
      );
    }
    
    if (actualVerifiable?.type?.includes?.("VerifiablePresentation")) {
      const presentation = actualVerifiable as VerifiablePresentation;
      result = await verifyGS1Credentials(
        presentation,
        getVerifierFunction(challenge, domain)
      );
    }
    
    if (!result) throw new Error("Provided verifiable object is of unknown type!");
    return result;
  }
}
