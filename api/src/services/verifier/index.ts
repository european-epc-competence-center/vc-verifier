// @ts-ignore
import { verifyCredential as verifyCredentialProof, verify as verifyPresentationProof } from "@digitalbazaar/vc";
// @ts-ignore
import { checkStatus as checkStatus2020 } from "@digitalbazaar/vc-revocation-list";
// @ts-ignore
import { checkStatus as checkStatus2021 } from "@digitalbazaar/vc-status-list";
// @ts-ignore
import jsigs from "jsonld-signatures";

// Types for better type safety
interface VerificationResult {
  verified: boolean;
  results?: any[];
  credentialResults?: any[];
  statusResult?: StatusResult;
  credentialId?: string | URL;
  error?: Error;
  errors?: any[];
}

interface StatusResult {
  verified: boolean;
  error?: any;
}

export interface VerifyOptions {
  challenge?: string;
  domain?: string;
  holderBinding?: boolean;
  /** When false, ignore credentialStatus. Default true. */
  checkStatus?: boolean;
}

function resolveVerifyOptions(options: VerifyOptions = {}): VerifyOptions {
  return {
    holderBinding: true,
    checkStatus: true,
    ...options,
  };
}

const CREDENTIAL_TYPES = {
  VERIFIABLE_CREDENTIAL: 'VerifiableCredential',
  VERIFIABLE_PRESENTATION: 'VerifiablePresentation'
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
import {
  holderBindingFromPayload,
  isJWT,
  validatePresentationHolderBinding,
  verifyJWT,
} from "./jwt.js";
import { checkBitstringStatus } from "./status.js";
import {
  decodeVerifiableInput,
  unwrapEnvelopedCredential,
  unwrapPresentationVerifiableCredentials,
} from "./envelope.js";
import { applyCredentialHolderBinding } from "./holder.js";
import { previousProofReferenceError } from "./previousProof.js";
import { getSuites } from "./suites.js";

const {
  purposes: { AssertionProofPurpose, AuthenticationProofPurpose },
} = jsigs;

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

/** Satisfies libraries that require a status function without reading a status list. */
const skipStatusCheck = async () => ({ verified: true });

function getCheckStatus(
  credentialStatus?: CredentialStatus[] | CredentialStatus,
  checkStatus = true
): any | undefined {
  if (!checkStatus) {
    return credentialStatus ? skipStatusCheck : undefined;
  }
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

export async function verify(
  input: Verifiable | verifiableJwt | string,
  options: VerifyOptions = {}
): Promise<VerificationResult> {
  options = resolveVerifyOptions(options);

  // Unwrap enveloped credential if present
  const unwrappedInput = unwrapEnvelopedCredential(input);

  if (typeof unwrappedInput === 'string') {
    return verifyJwtInput(unwrappedInput, options);
  }

  return verifyObjectInput(unwrappedInput as Verifiable, options);
}

async function verifyJwtInput(
    input: string,
    options: VerifyOptions
  ): Promise<VerificationResult> {
    if (!isJWT(input)) {
      throw new Error('String input provided but not in valid JWT format');
    }

    const jwtResult = await verifyJWT(input);
    
    if (!jwtResult.verified) {
      return promoteJwtError(jwtResult);
    }

    if (jwtResult.results.length === 0) {
      return jwtResult;
    }

    const firstResult = jwtResult.results[0];
    if (!firstResult.decoded || 'error' in firstResult.decoded) {
      return jwtResult;
    }

    const payload = firstResult.decoded.payload;
    const decodedBody = decodeVerifiableInput(payload);
    const types = Array.isArray(decodedBody.type)
      ? decodedBody.type
      : typeof decodedBody.type === 'string'
        ? [decodedBody.type]
        : [];

    if (types.includes(CREDENTIAL_TYPES.VERIFIABLE_PRESENTATION)) {
      const presentationBody = unwrapPresentationVerifiableCredentials(decodedBody);
      const holderBinding = holderBindingFromPayload(payload);
      const bindingResult = await validatePresentationHolderBinding(
        { nonce: options.challenge, aud: options.domain },
        holderBinding,
        firstResult.verificationMethod,
        documentLoader,
        options.holderBinding !== false
      );

      const presentation = {
        ...presentationBody,
        type: types,
        ...(bindingResult.holder ? { holder: bindingResult.holder } : {}),
      } as VerifiablePresentation;

      const credentialResults = await verifyPresentationCredentials(
        presentation,
        {
          ...options,
          challenge: bindingResult.nonce ?? options.challenge,
        }
      );
      const allCredentialsVerified = credentialResults.every((r: any) => r.verified);

      let presentationResult = {
        verified: jwtResult.verified && bindingResult.valid,
        results: jwtResult.results.map((result) => ({
          ...result,
          verified: jwtResult.verified,
          purposeResult: { valid: bindingResult.valid },
        })),
        error: bindingResult.error,
      };

      presentationResult = applyCredentialHolderBinding(
        presentationResult,
        presentation,
        options.holderBinding !== false
      );

      return normalizeResult({
        presentationResult,
        verified: presentationResult.verified && allCredentialsVerified,
        credentialResults,
        error: presentationResult.error,
      });
    }

    if (
      options.checkStatus !== false &&
      types.includes(CREDENTIAL_TYPES.VERIFIABLE_CREDENTIAL) &&
      decodedBody.credentialStatus
    ) {
      return verifyJwtCredentialStatus(decodedBody, jwtResult);
    }

    return jwtResult;
  }

async function verifyJwtCredentialStatus(
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

async function verifyObjectInput(
    verifiable: Verifiable,
    options: VerifyOptions
  ): Promise<VerificationResult> {
    // Validate that verifiable has required properties
    if (!verifiable || !verifiable.type || !Array.isArray(verifiable.type)) {
      throw new Error('Invalid verifiable object: missing or invalid type property');
    }

    const suite = getSuites(verifiable.proof);
    const previousProofError = previousProofReferenceError(verifiable.proof);
    if (previousProofError) {
      return normalizeResult({ verified: false, error: previousProofError });
    }

    if (verifiable.type.includes(CREDENTIAL_TYPES.VERIFIABLE_CREDENTIAL)) {
      return verifyCredentialDocument(verifiable as VerifiableCredential, suite, options);
    }

    if (verifiable.type.includes(CREDENTIAL_TYPES.VERIFIABLE_PRESENTATION)) {
      return verifyPresentationDocument(
        verifiable as VerifiablePresentation,
        suite,
        options
      );
    }

    throw new Error("Provided verifiable object is of unknown type!");
  }

async function verifyCredentialDocument(
    credential: VerifiableCredential,
    suite: unknown[],
    options: VerifyOptions
  ): Promise<VerificationResult> {
    const checkStatus = getCheckStatus(
      credential.credentialStatus,
      options.checkStatus !== false
    );
    const dataIntegrityProof = isDataIntegrityProof(credential.proof);

    let result;

    if (dataIntegrityProof) {
      result = await jsigs.verify(credential, {
        suite,
        purpose: new AssertionProofPurpose(),
        documentLoader,
      });

      // Manual status check as long as not implemented in jsigs
      if (checkStatus && options.checkStatus !== false) {
        result.statusResult = await checkStatus({
          credential,
          documentLoader,
          verifyStatusListCredential: true,
          verifyMatchingIssuers: false,
        });
        if (!result.statusResult.verified) {
          result.verified = false;
        }
      }
    } else {
      result = await verifyCredentialProof({
        credential,
        suite,
        documentLoader,
        checkStatus,
      });
    }

    if (options.checkStatus === false) {
      delete result.statusResult;
    }

    return normalizeResult(result);
  }

async function verifyPresentationDocument(
    presentation: VerifiablePresentation,
    suite: unknown[],
    options: VerifyOptions
  ): Promise<VerificationResult> {
    presentation = unwrapPresentationVerifiableCredentials(
      decodeVerifiableInput(presentation)
    ) as VerifiablePresentation;

    let { challenge, domain } = options;

    // Try to use challenge in proof if not provided (for cases where no exchange protocol is used)
    if (!challenge) {
      challenge = Array.isArray(presentation.proof)
        ? presentation.proof[0].challenge
        : presentation.proof.challenge;
    }

    const checkStatus = options.checkStatus === false
      ? skipStatusCheck
      : getCheckStatus(getPresentationStatus(presentation));

    let result;

    if (isDataIntegrityProof(presentation.proof)) {
      // jsigs.verify + AuthenticationProofPurpose already validates challenge,
      // domain, and authentication-key authorization for the presentation proof.
      const credentialResults = await verifyPresentationCredentials(
        presentation,
        options
      );

      let presentationResult = await jsigs.verify(presentation, {
        suite,
        purpose: new AuthenticationProofPurpose({ challenge, domain }),
        documentLoader,
      });

      presentationResult = applyCredentialHolderBinding(
        presentationResult,
        presentation,
        options.holderBinding !== false
      );

      const allCredentialsVerified = credentialResults.every(
        (r: any) => r.verified
      );

      result = {
        presentationResult,
        verified: presentationResult.verified && allCredentialsVerified,
        credentialResults,
        error: presentationResult.error,
      };
    } else {
      result = await verifyPresentationProof({
        presentation,
        suite,
        documentLoader,
        challenge,
        domain,
        checkStatus,
      });

      const allCredentialsVerified = (result.credentialResults ?? []).every(
        (r: any) => r.verified
      );

      const presentationResult = applyCredentialHolderBinding(
        result.presentationResult,
        presentation,
        options.holderBinding !== false
      );

      result = {
        ...result,
        presentationResult,
        verified: presentationResult.verified && allCredentialsVerified,
        error: presentationResult.error ?? result.error,
      };
    }

    if (options.checkStatus === false) {
      delete result.statusResult;
      for (const credentialResult of result.credentialResults ?? []) {
        delete credentialResult.statusResult;
      }
    }

    return normalizeResult(result);
  }

async function verifyPresentationCredentials(
    presentation: VerifiablePresentation,
    options: VerifyOptions
  ): Promise<any[]> {
    if (!presentation.verifiableCredential) return [];

    const credentials = Array.isArray(presentation.verifiableCredential)
      ? presentation.verifiableCredential
      : [presentation.verifiableCredential];

    const credentialResults = await Promise.all(
      credentials.map((credential: VerifiableCredential) => {
        return verify(credential as Verifiable, options);
      })
    );

    for (const [index, credentialResult] of credentialResults.entries()) {
      credentialResult.credentialId = credentials[index].id;
    }

    return credentialResults;
  }

function isDataIntegrityProof(proof: Proof | Proof[]): boolean {
    const proofType = Array.isArray(proof) ? proof[0].type : proof.type;
    return proofType === PROOF_TYPES.DATA_INTEGRITY;
  }

function promoteJwtError(jwtResult: any): VerificationResult {
    const resultError = jwtResult.results?.[0]?.error;
    if (!resultError) {
      return jwtResult;
    }

    return {
      ...jwtResult,
      error: {
        name: 'VerificationError',
        errors: [resultError]
      }
    };
  }

function normalizeResult(result: any): VerificationResult {
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
