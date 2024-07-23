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

export const gs1CredentialTypes = [
  "OrganizationDataCredential",
  "GS1PrefixLicenseCredential",
  "GS1CompanyPrefixLicenseCredential",
  "KeyCredential",
  "ProductDataCredential",
];

export const gs1CredentialContext =
  "https://ref.gs1.org/gs1/vc/license-context";

export function isGs1Credential(credential: VerifiableCredential): boolean {
  return (
    credential["@context"].includes(gs1CredentialContext) &&
    credential.type.some((type: string) => gs1CredentialTypes.includes(type))
  );
}
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
    verifiable: Verifiable,
    challenge?: string,
    domain?: string
  ): Promise<gs1RulesResult | gs1RulesResultContainer> {
    let result;
    if (verifiable.type.includes("VerifiableCredential")) {
      result = await checkGS1Credential(
        verifiable,
        getVerifierFunction(challenge, domain)
      );
    }

    if (verifiable.type.includes("VerifiablePresentation")) {
      const presentation = verifiable as VerifiablePresentation;

      result = await verifyGS1Credentials(
        presentation,
        getVerifierFunction(challenge, domain)
      );
    }

    if (!result) throw Error("Provided verifiable object is of unknown type!");

    return result;
  }
}
