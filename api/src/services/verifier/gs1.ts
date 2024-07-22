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

export const gs1CredentialTypes = [
  "OrganizationDataCredential",
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
