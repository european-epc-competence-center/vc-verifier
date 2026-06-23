import { decodeVerifiableCredentialEntry } from './envelope.js';

export interface HolderBindingCheck {
  valid: boolean;
  error?: {
    name: string;
    message: string;
  };
}

export function resolveEntityId(
  entity: string | { id?: string } | undefined | null
): string | undefined {
  if (!entity) {
    return undefined;
  }

  if (typeof entity === 'string') {
    return entity;
  }

  if (typeof entity === 'object' && typeof entity.id === 'string') {
    return entity.id;
  }

  return undefined;
}

export function resolveVerificationMethodController(verificationMethod: {
  controller?: string | { id?: string };
}): string | undefined {
  return resolveEntityId(verificationMethod.controller);
}

export function resolveHolderFromVerificationMethod(verificationMethod: {
  id: string;
  controller?: string | { id?: string };
}): string | undefined {
  return (
    resolveVerificationMethodController(verificationMethod) ??
    verificationMethod.id.split('#')[0]
  );
}

/**
 * When a JWT VP includes an explicit holder claim, it must match the holder
 * derived from the presentation signing key.
 */
export function checkPayloadHolderMatches(
  derivedHolderId: string | undefined,
  payloadHolder: string | { id?: string } | undefined
): HolderBindingCheck {
  const payloadHolderId = resolveEntityId(payloadHolder);

  if (!payloadHolderId) {
    return { valid: true };
  }

  if (!derivedHolderId) {
    return {
      valid: false,
      error: {
        name: 'HolderBindingError',
        message:
          'Unable to determine holder from presentation signing key.',
      },
    };
  }

  if (payloadHolderId !== derivedHolderId) {
    return {
      valid: false,
      error: {
        name: 'HolderBindingError',
        message: `Presentation holder claim "${payloadHolderId}" does not match signing key holder "${derivedHolderId}".`,
      },
    };
  }

  return { valid: true };
}

/**
 * Ensures the presentation holder is the subject of DID-identified credentials.
 * Non-DID subject identifiers (for example GS1 Digital Link URIs) are skipped.
 */
export function checkHolderMatchesCredentialSubject(
  holderId: string | undefined,
  subjectId: string | undefined
): HolderBindingCheck {
  if (!holderId) {
    return {
      valid: false,
      error: {
        name: 'HolderBindingError',
        message: 'Presentation is missing required holder.',
      },
    };
  }

  if (!subjectId) {
    return {
      valid: false,
      error: {
        name: 'HolderBindingError',
        message:
          'Credential is missing credentialSubject.id required for holder binding.',
      },
    };
  }

  if (!subjectId.startsWith('did:')) {
    return { valid: true };
  }

  if (holderId !== subjectId) {
    return {
      valid: false,
      error: {
        name: 'HolderBindingError',
        message: `Presentation holder "${holderId}" does not match credential subject "${subjectId}".`,
      },
    };
  }

  return { valid: true };
}

export function checkHolderMatchesController(
  holderId: string | undefined,
  controllerId: string | undefined
): HolderBindingCheck {
  if (!holderId) {
    return {
      valid: false,
      error: {
        name: 'HolderBindingError',
        message: 'Presentation is missing required holder.',
      },
    };
  }

  if (!controllerId) {
    return {
      valid: false,
      error: {
        name: 'HolderBindingError',
        message:
          'Unable to determine signing key controller for holder binding.',
      },
    };
  }

  if (holderId !== controllerId) {
    return {
      valid: false,
      error: {
        name: 'HolderBindingError',
        message: `Presentation holder "${holderId}" does not match signing key controller "${controllerId}".`,
      },
    };
  }

  return { valid: true };
}

export function resolveCredentialSubjectId(credential: unknown): string | undefined {
  const decoded = decodeVerifiableCredentialEntry(credential);
  return resolveEntityId(decoded?.credentialSubject);
}

/**
 * Validates that the presentation holder matches DID subjects of all contained
 * credentials. Non-DID subjects are skipped per credential.
 */
export function validateCredentialHolderBinding(presentation: {
  holder?: string | { id?: string };
  verifiableCredential?: unknown | unknown[];
}): HolderBindingCheck {
  const holderId = resolveEntityId(presentation.holder);

  if (!presentation.verifiableCredential) {
    return { valid: true };
  }

  const credentials = Array.isArray(presentation.verifiableCredential)
    ? presentation.verifiableCredential
    : [presentation.verifiableCredential];

  for (const credential of credentials) {
    const check = checkHolderMatchesCredentialSubject(
      holderId,
      resolveCredentialSubjectId(credential)
    );
    if (!check.valid) {
      return check;
    }
  }

  return { valid: true };
}

/** Apply credential-subject holder binding when enforcement is enabled (default: true). */
export function applyCredentialHolderBinding(
  presentationResult: any,
  presentation: {
    holder?: string | { id?: string };
    verifiableCredential?: unknown | unknown[];
  },
  holderBinding = true
): any {
  if (!holderBinding) {
    return presentationResult;
  }

  return failPresentationOnHolderBinding(
    presentationResult,
    validateCredentialHolderBinding(presentation)
  );
}

/** Propagate a holder-binding failure to a presentation result, like jsigs does for purpose failures. */
export function failPresentationOnHolderBinding(
  presentationResult: any,
  check: HolderBindingCheck
): any {
  if (!presentationResult || check.valid) {
    return presentationResult;
  }

  const error = new Error(
    check.error?.message ?? 'Presentation holder binding failed.'
  );

  return {
    ...presentationResult,
    verified: false,
    error: presentationResult.error ?? error,
    results: Array.isArray(presentationResult.results)
      ? presentationResult.results.map((result: any) => ({
          ...result,
          purposeResult: {
            ...(result.purposeResult ?? {}),
            valid: false,
          },
        }))
      : presentationResult.results,
  };
}
