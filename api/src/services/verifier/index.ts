// @ts-ignore
import { verifyCredential, verify } from "@digitalbazaar/vc";
// @ts-ignore
import { Ed25519Signature2018 } from "@digitalbazaar/ed25519-signature-2018";
// @ts-ignore
import { Ed25519Signature2020 } from "@digitalbazaar/ed25519-signature-2020";
// @ts-ignore
import { checkStatus as checkStatus2020 } from "@digitalbazaar/vc-revocation-list";
// @ts-ignore
import { checkStatus as checkStatus2021 } from "@digitalbazaar/vc-status-list";
// @ts-ignore
import * as ecdsaSd2023Cryptosuite from "@digitalbazaar/ecdsa-sd-2023-cryptosuite";
// @ts-ignore
import { DataIntegrityProof } from "@digitalbazaar/data-integrity";
// @ts-ignore
import jsigs from "jsonld-signatures";

import { documentLoader } from "../documentLoader/index.js";
import { JWTService } from "./jwt.js";

const { createVerifyCryptosuite } = ecdsaSd2023Cryptosuite;
const {
  purposes: { AssertionProofPurpose },
} = jsigs;

function getSuite(proof: Proof): unknown[] {
  switch (proof?.type) {
    case "Ed25519Signature2018":
      return new Ed25519Signature2018();

    case "Ed25519Signature2020":
      return new Ed25519Signature2020();

    case "DataIntegrityProof":
      return new DataIntegrityProof({
        cryptosuite: createVerifyCryptosuite(),
      });

    default:
      throw new Error(`${proof?.type} not implemented`);
  }
}

function getSuites(proof: Proof | Proof[]): unknown[] {
  var suites: unknown[] = [];

  if (Array.isArray(proof)) {
    proof.forEach((proof: Proof) => suites.push(getSuite(proof)));
  } else {
    suites = [getSuite(proof)];
  }

  // always for status verification
  suites.push(new Ed25519Signature2020());

  return suites;
}

function getPresentationStatus(
  presentation: VerifiablePresentation
): CredentialStatus[] | CredentialStatus | undefined {
  if (!presentation.verifiableCredential) return undefined;

  const credentials = (
    Array.isArray(presentation.verifiableCredential)
      ? presentation.verifiableCredential
      : [presentation.verifiableCredential]
  ).filter((credential: VerifiableCredential) => credential.credentialStatus);

  if (credentials.length == 0) return undefined;

  if (credentials.length == 1) return credentials[0].credentialStatus;

  const statusTypes = credentials.map((credential: VerifiableCredential) => {
    return Array.isArray(credential.credentialStatus)
      ? credential.credentialStatus.map(
          (credentialStatus: CredentialStatus) => credentialStatus.type
        )
      : credential.credentialStatus.type;
  });

  // disallow multiple status types
  if (new Set(statusTypes.flat(1)).size > 1)
    throw new Error(
      "Currently only one status type is allowed within one presentation!"
    );

  return credentials[0].credentialStatus;
}

function getCheckStatus(
  credentialStatus?: CredentialStatus[] | CredentialStatus
): any | undefined {
  // no status provided
  if (!credentialStatus) return undefined;

  let statusTypes = [];

  if (Array.isArray(credentialStatus)) {
    statusTypes = credentialStatus.map((cs) => cs.type);
  } else statusTypes = [credentialStatus.type];

  if (statusTypes.includes("StatusList2021Entry")) return checkStatus2021;

  if (statusTypes.includes("RevocationList2020Status")) return checkStatus2020;

  throw new Error(`${statusTypes} not implemented`);
}

export class Verifier {
  static async verify(
    input: Verifiable | string,
    challenge?: string,
    domain?: string
  ): Promise<any> {
    // Handle string inputs - could be JWT or invalid
    if (typeof input === 'string') {
      if (JWTService.isJWT(input)) {
        return await JWTService.verifyJWT(input);
      } else {
        throw new Error('String input provided but not in valid JWT format');
      }
    }

    // Handle object inputs - should be W3C Verifiable Credentials/Presentations
    const verifiable = input as Verifiable;
    
    // Validate that verifiable has required properties
    if (!verifiable || !verifiable.type || !Array.isArray(verifiable.type)) {
      throw new Error('Invalid verifiable object: missing or invalid type property');
    }
    const suite = getSuites(verifiable.proof);

    let result;

    if (verifiable.type.includes("VerifiableCredential")) {
      const credential = verifiable as VerifiableCredential;

      const checkStatus = getCheckStatus(credential.credentialStatus);

      if (
        (Array.isArray(credential.proof)
          ? credential.proof[0].type
          : credential.proof.type) == "DataIntegrityProof"
      ) {
        result = await jsigs.verify(credential, {
          suite,
          purpose: new AssertionProofPurpose(),
          documentLoader,
        });

        // make manual status as long as not implemented in jsigs
        if (checkStatus) {
          result.statusResult = await checkStatus({
            credential,
            documentLoader,
            suite,
            verifyStatusListCredential: true,
            verifyMatchingIssuers: false,
          });
          if (!result.statusResult.verified) {
            result.verified = false;
          }
        }
      } else {
        result = await verifyCredential({
          credential,
          suite,
          documentLoader,
          checkStatus,
        });
      }
    }

    if (verifiable.type.includes("VerifiablePresentation")) {
      const presentation = verifiable as VerifiablePresentation;

      // try to use challenge in proof if not provided in case no exchange protocol is used
      if (!challenge)
        challenge = Array.isArray(presentation.proof)
          ? presentation.proof[0].challenge
          : presentation.proof.challenge;

      const checkStatus = getCheckStatus(getPresentationStatus(presentation));

      result = await verify({
        presentation,
        suite,
        documentLoader,
        challenge,
        domain,
        checkStatus,
      });
    }

    if (!result) throw Error("Provided verifiable object is of unknown type!");

    // make non enumeratable errors enumeratable for the respsonse
    if (result.error) {
      if (!result.error.errors) {
        result.error.name = result.error.message;
      }
      if (result.error.errors) {
        result.errors = result.error.errors;
      }
    }

    return result;
  }
}
