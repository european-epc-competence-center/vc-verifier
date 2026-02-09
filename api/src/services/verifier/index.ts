// @ts-ignore
import { verifyCredential, verify } from "@digitalbazaar/vc";
// @ts-ignore
import { Ed25519Signature2018 } from "@digitalbazaar/ed25519-signature-2018";
// @ts-ignore
import { Ed25519Signature2020 } from "@digitalbazaar/ed25519-signature-2020";
// @ts-ignore
import { ES256Signature2020 } from "@eecc/es256-signature-2020";
// @ts-ignore
import { checkStatus as checkStatus2020 } from "@digitalbazaar/vc-revocation-list";
// @ts-ignore
import { checkStatus as checkStatus2021 } from "@digitalbazaar/vc-status-list";
// @ts-ignore
import * as ecdsaSd2023Cryptosuite from "@digitalbazaar/ecdsa-sd-2023-cryptosuite";
// @ts-ignore
import {cryptosuite as eddsaRdfc2022CryptoSuite} from "@digitalbazaar/eddsa-rdfc-2022-cryptosuite";
// @ts-ignore
import {cryptosuite as ecdsaRdfc2019CryptoSuite} from "@digitalbazaar/ecdsa-rdfc-2019-cryptosuite";
// @ts-ignore
import {cryptosuite as rsaRdfc2025CryptoSuite} from "@eecc/rsa-rdfc-2025-cryptosuite";
// @ts-ignore
import { DataIntegrityProof } from "@digitalbazaar/data-integrity";
// @ts-ignore
import jsigs from "jsonld-signatures";

// Types for better type safety
interface VerificationResult {
  verified: boolean;
  results?: any[];
  statusResult?: StatusResult;
  error?: Error;
  errors?: any[];
}

interface StatusResult {
  verified: boolean;
  error?: any;
}

interface VerificationOptions {
  challenge?: string;
  domain?: string;
}

// Constants for better maintainability
const CREDENTIAL_TYPES = {
  VERIFIABLE_CREDENTIAL: 'VerifiableCredential',
  VERIFIABLE_PRESENTATION: 'VerifiablePresentation',
} as const;

const PROOF_TYPES = {
  ED25519_2018: 'Ed25519Signature2018',
  ED25519_2020: 'Ed25519Signature2020',
  ES256_2020: 'JsonWebSignature2020',
  DATA_INTEGRITY: 'DataIntegrityProof'
} as const;

const STATUS_TYPES = {
  STATUS_LIST_2021: 'StatusList2021Entry',
  REVOCATION_LIST_2020: 'RevocationList2020Status',
  BITSTRING_STATUS_LIST: 'BitstringStatusListEntry'
} as const;

import { documentLoader } from "../documentLoader/index.js";

import { JWTService } from "./jwt.js";

import { checkBitstringStatus } from "./status.js";

import { unwrapEnvelopedCredential } from "./envelope.js";

const { createVerifyCryptosuite } = ecdsaSd2023Cryptosuite;
const {
  purposes: { AssertionProofPurpose, AuthenticationProofPurpose },
} = jsigs;

function getDataIntegritySuite(cryptosuite?: string): unknown {
  if (!cryptosuite) {
    throw new Error('Cryptosuite is required for data integrity proof');
  }

  switch (cryptosuite) {
    case 'eddsa-rdfc-2022':
      return eddsaRdfc2022CryptoSuite;
    case 'ecdsa-rdfc-2019':
      return ecdsaRdfc2019CryptoSuite;
    case 'rsa-rdfc-2025':
      return rsaRdfc2025CryptoSuite;
    case 'ecdsa-sd-2023':
      return createVerifyCryptosuite();
    default:
      throw new Error(`Cryptosuite ${cryptosuite} not implemented`);
  }
}

function getSuite(proof: Proof): unknown {
  switch (proof?.type) {
    case PROOF_TYPES.ED25519_2018:
      return new Ed25519Signature2018();

    case PROOF_TYPES.ED25519_2020:
      return new Ed25519Signature2020();

    case PROOF_TYPES.ES256_2020:
      return new ES256Signature2020();

    case PROOF_TYPES.DATA_INTEGRITY:
      return new DataIntegrityProof({
        cryptosuite: getDataIntegritySuite(proof.cryptosuite)
      });

    default:
      throw new Error(`Proof type ${proof?.type} not implemented`);
  }
}

function getSuites(proof: Proof | Proof[]): unknown[] {
  const suites: unknown[] = [];

  if (Array.isArray(proof)) {
    proof.forEach((singleProof: Proof) => suites.push(getSuite(singleProof)));
  } else {
    suites.push(getSuite(proof));
  }

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
  if (!credentialStatus) return undefined;

  const statusTypes = Array.isArray(credentialStatus)
    ? credentialStatus.map((cs) => cs.type)
    : [credentialStatus.type];

  if (statusTypes.includes(STATUS_TYPES.STATUS_LIST_2021)) {
    return checkStatus2021;
  }

  if (statusTypes.includes(STATUS_TYPES.REVOCATION_LIST_2020)) {
    return checkStatus2020;
  }
  
  if (statusTypes.includes(STATUS_TYPES.BITSTRING_STATUS_LIST)) {
    return checkBitstringStatus;
  }

  throw new Error(`Status types [${statusTypes.join(', ')}] not implemented`);
}

export class Verifier {

  static async verify(
    input: Verifiable | verifiableJwt | string | EnvelopeWrapper,
    challenge?: string,
    domain?: string
  ): Promise<VerificationResult> {
    const options: VerificationOptions = { challenge, domain };

    // Unwrap enveloped credential if present
    const unwrappedInput = unwrapEnvelopedCredential(input);

    if (typeof unwrappedInput === 'string') {
      return this.verifyJWTInput(unwrappedInput, options);
    }

    return this.verifyObjectInput(unwrappedInput as Verifiable, options);
  }

  private static async verifyJWTInput(
    input: string,
    options: VerificationOptions
  ): Promise<VerificationResult> {
    if (!JWTService.isJWT(input)) {
      throw new Error('String input provided but not in valid JWT format');
    }

    const jwtResult = await JWTService.verifyJWT(input);
    
    if (!jwtResult.verified || jwtResult.results.length === 0) {
      return jwtResult;
    }

    const firstResult = jwtResult.results[0];
    if (!firstResult.decoded || 'error' in firstResult.decoded) {
      return jwtResult;
    }

    const payload = firstResult.decoded.payload;
    
    // Check status for JWT credentials if they have credentialStatus
    if (payload.type?.includes(CREDENTIAL_TYPES.VERIFIABLE_CREDENTIAL) && payload.credentialStatus) {
      return this.verifyJWTCredentialStatus(payload, jwtResult);
    }

    return jwtResult;
  }

  private static async verifyJWTCredentialStatus(
    payload: any,
    jwtResult: any
  ): Promise<VerificationResult> {
    const checkStatus = getCheckStatus(payload.credentialStatus);
    
    if (!checkStatus) {
      return jwtResult;
    }

    try {
      const statusResult = await checkStatus({
        credential: payload,
        documentLoader,
        suite: null, // No suite needed for JWT status checking
        verifyStatusListCredential: true,
        verifyMatchingIssuers: false,
      });
      
      if (!statusResult.verified) {
        return {
          verified: false,
          results: jwtResult.results,
          statusResult,
          error: new Error('Status check failed')
        };
      }
      
      return {
        ...jwtResult,
        statusResult
      };
    } catch (statusError) {
      return {
        verified: false,
        results: jwtResult.results,
        statusResult: { verified: false, error: statusError },
        error: statusError as Error
      };
    }
  }

  private static async verifyObjectInput(
    verifiable: Verifiable,
    options: VerificationOptions
  ): Promise<VerificationResult> {
    // Validate that verifiable has required properties
    if (!verifiable || !verifiable.type || !Array.isArray(verifiable.type)) {
      throw new Error('Invalid verifiable object: missing or invalid type property');
    }

    const suite = getSuites(verifiable.proof);

    if (verifiable.type.includes(CREDENTIAL_TYPES.VERIFIABLE_CREDENTIAL)) {
      return this.verifyCredential(verifiable as VerifiableCredential, suite);
    }

    if (verifiable.type.includes(CREDENTIAL_TYPES.VERIFIABLE_PRESENTATION)) {
      return this.verifyPresentation(verifiable as VerifiablePresentation, suite, options);
    }

    throw new Error("Provided verifiable object is of unknown type!");
  }

  private static async verifyCredential(
    credential: VerifiableCredential,
    suite: unknown[]
  ): Promise<VerificationResult> {
    const checkStatus = getCheckStatus(credential.credentialStatus);
    const isDataIntegrityProof = this.isDataIntegrityProof(credential.proof);

    let result;

    if (isDataIntegrityProof) {
      result = await jsigs.verify(credential, {
        suite,
        purpose: new AssertionProofPurpose(),
        documentLoader,
      });

      // Manual status check as long as not implemented in jsigs
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

    return this.normalizeResult(result);
  }

  private static async verifyPresentation(
    presentation: VerifiablePresentation,
    suite: unknown[],
    options: VerificationOptions
  ): Promise<VerificationResult> {
    let { challenge, domain } = options;

    // Try to use challenge in proof if not provided (for cases where no exchange protocol is used)
    if (!challenge) {
      challenge = Array.isArray(presentation.proof)
        ? presentation.proof[0].challenge
        : presentation.proof.challenge;
    }

    const checkStatus = getCheckStatus(getPresentationStatus(presentation));

    let result;

    if (this.isDataIntegrityProof(presentation.proof)) {
      result = await jsigs.verify(presentation, {
        suite,
        purpose: new AuthenticationProofPurpose(),
        documentLoader,
        challenge,
        domain,
        checkStatus,
      });
    } else {
      result = await verify({
        presentation,
        suite,
        documentLoader,
        challenge,
        domain,
        checkStatus,
      });
    }

    return this.normalizeResult(result);
  }

  private static isDataIntegrityProof(proof: Proof | Proof[]): boolean {
    const proofType = Array.isArray(proof) ? proof[0].type : proof.type;
    return proofType === PROOF_TYPES.DATA_INTEGRITY;
  }

  private static normalizeResult(result: any): VerificationResult {
    // Make non-enumerable errors enumerable for the response
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
