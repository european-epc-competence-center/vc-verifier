// @ts-ignore
import { Bitstring } from "@digitalbazaar/bitstring";
// @ts-ignore
import { verifyCredential as vcVerifyCredential } from "@digitalbazaar/vc";
import { JWTService } from './jwt.js';
import { decodeVerifiableInput, unwrapEnvelopedCredential } from './envelope.js';
import { getSuites } from './suites.js';

/** Unwrap compact JWTs / VCDM 1.1 nested `vc` claims to the credential body. */
function resolveCredentialBody(credential: any): any {
  return decodeVerifiableInput(credential);
}

function resolveIssuer(credential: any): string | undefined {
  const body = resolveCredentialBody(credential);
  if (typeof body?.issuer === 'object') return body.issuer?.id;
  if (typeof body?.issuer === 'string') return body.issuer;

  if (typeof credential === 'string') {
    const decoded = JWTService.decodeJWT(credential);
    if (!('error' in decoded) && typeof decoded.payload?.iss === 'string') {
      return decoded.payload.iss;
    }
  } else if (typeof credential?.iss === 'string') {
    return credential.iss;
  }

  return undefined;
}

export class BitstringStatusList {
    private bitstring: any;
    public length: number;

    constructor({ length, buffer }: {length?: number; buffer?: any} = {}) {
        this.bitstring = new Bitstring({ length, buffer});
        this.length = this.bitstring.length;
    }

    setStatus(index: number, status: boolean) {
        if (typeof status !== 'boolean')  {
            throw new TypeError('"status" must be a boolean.');
        }
        return this.bitstring.set(index, status);
    }

    getStatus(index: number) {
        return this.bitstring.get(index);
    }

    async encode() {
        return this.bitstring.encodeBits();
    }

    static async decode({ encodedList }: { encodedList: string }) {
        try {
            const buffer = await Bitstring.decodeBits({ encoded: encodedList });
            return new BitstringStatusList({ buffer });
        } catch (error) {
            throw new Error(`Could not decode encoded status list; reason: ${error}`);
        }
    }
}

export async function checkBitstringStatus({
    credential,
    documentLoader,
    verifyStatusListCredential = true,
    verifyMatchingIssuers = true
}: {
    credential: any;
    documentLoader: Function;
    verifyStatusListCredential?: boolean;
    verifyMatchingIssuers?: boolean;
}) {
    let result;
    try {
        result = await _checkBitstringStatuses({
            credential,
            documentLoader,
            verifyStatusListCredential,
            verifyMatchingIssuers,
        });
    } catch (error) {
        result = {
            verified: false,
            error
        }
    }
    return result;
}

async function _checkBitstringStatuses({
  credential,
  documentLoader,
  verifyStatusListCredential,
  verifyMatchingIssuers
}: {
  credential: any;
  documentLoader: Function;
  verifyStatusListCredential: boolean;
  verifyMatchingIssuers: boolean;
}) {
  if (!(credential && typeof credential === 'object')) {
    throw new TypeError('"credential" must be an object.');
  }
  
  if (typeof documentLoader !== 'function') {
    throw new TypeError('"documentLoader" must be a function.');
  }

  const credentialStatuses = _getBitstringStatuses({ credential });
  
  if (credentialStatuses.length === 0) {
    throw new Error('"credentialStatus.type" must be "BitstringStatusListEntry".');
  }

  credentialStatuses.forEach(credentialStatus => 
    _validateBitstringStatus({ credentialStatus })
  );

  const results = await Promise.all(
    credentialStatuses.map(async credentialStatus => {
      try {
        return await _checkSingleBitstringStatus({
          credential,
          credentialStatus,
          documentLoader,
          verifyStatusListCredential,
          verifyMatchingIssuers
        });
      } catch (error) {
        return { verified: false, credentialStatus, error };
      }
    })
  );

  const verified = results.every(({ verified = false }) => verified === true);
  return { verified, results };
}

function _getBitstringStatuses({ credential }: { credential: any }): any[] {
  const { credentialStatus } = resolveCredentialBody(credential);
  
  if (Array.isArray(credentialStatus)) {
    return credentialStatus.filter(cs => cs.type === 'BitstringStatusListEntry');
  }
  
  if (credentialStatus && credentialStatus.type === 'BitstringStatusListEntry') {
    return [credentialStatus];
  }
  
  return [];
}

function _validateBitstringStatus({ credentialStatus }: { credentialStatus: any }) {
  if (credentialStatus.type !== 'BitstringStatusListEntry') {
    throw new Error('"credentialStatus.type" must be "BitstringStatusListEntry".');
  }
  
  if (typeof credentialStatus.statusPurpose !== 'string') {
    throw new TypeError('"credentialStatus.statusPurpose" must be a string.');
  }
  
  if (typeof credentialStatus.id !== 'string') {
    throw new TypeError('"credentialStatus.id" must be a string.');
  }
  
  if (typeof credentialStatus.statusListCredential !== 'string') {
    throw new TypeError('"credentialStatus.statusListCredential" must be a string.');
  }
  
  const index = parseInt(credentialStatus.statusListIndex, 10);
  if (isNaN(index)) {
    throw new TypeError('"statusListIndex" must be an integer.');
  }
  
  if (credentialStatus.id === credentialStatus.statusListCredential) {
    throw new Error('"credentialStatus.id" must not be "credentialStatus.statusListCredential".');
  }
  
  return credentialStatus;
}

async function _checkSingleBitstringStatus({
  credential,
  credentialStatus,
  verifyStatusListCredential,
  verifyMatchingIssuers,
  documentLoader
}: {
  credential: any;
  credentialStatus: any;
  verifyStatusListCredential: boolean;
  verifyMatchingIssuers: boolean;
  documentLoader: Function;
}) {
  const { statusListIndex } = credentialStatus;
  const index = parseInt(statusListIndex, 10);

  let slCredential;
  try {
    ({ document: slCredential } = await documentLoader(
      credentialStatus.statusListCredential
    ));
    
    // Unwrap if it's an enveloped credential
    slCredential = unwrapEnvelopedCredential(slCredential);
  } catch (e: any) {
    const err = new Error(
      'Could not load "BitstringStatusListCredential"; ' +
      `reason: ${e?.message || e}`
    );
    err.cause = e;
    throw err;
  }

  const { statusPurpose: credentialStatusPurpose } = credentialStatus;
  const slCredentialBody = resolveCredentialBody(slCredential);
  const slCredentialStatusPurpose = slCredentialBody?.credentialSubject?.statusPurpose;

  if (slCredentialStatusPurpose !== credentialStatusPurpose) {
    throw new Error(
      `The status purpose "${slCredentialStatusPurpose}" of the status ` +
      `list credential does not match the status purpose ` +
      `"${credentialStatusPurpose}" in the credential.`
    );
  }

  if (verifyStatusListCredential) {
    if (typeof slCredential === 'string') {
      // JWT verification using JWTService directly
      const jwtVerifyResult = await JWTService.verifyJWT(slCredential);
      if (!jwtVerifyResult.verified) {
        const firstResult = jwtVerifyResult.results[0];
        const errorMessage = firstResult && firstResult.decoded && 'error' in firstResult.decoded 
          ? firstResult.decoded.error 
          : 'JWT verification failed';
        
        const err = new Error(
          '"BitstringStatusListCredential" JWT not verified; ' +
          `reason: ${errorMessage}`
        );
        throw err;
      }
    } else {
      // JSON-LD verification — derive suite from the status list credential's own proof
      const verifyResult = await vcVerifyCredential({
        credential: slCredential,
        suite: getSuites(slCredential.proof),
        documentLoader
      });
      if (!verifyResult.verified) {
        const {error: e} = verifyResult;
        let msg = '"BitstringStatusListCredential" not verified';
        if (e) {
          msg += `; reason: ${e.message}`;
        } else {
          msg += '.';
        }
        const err = new Error(msg);
        if (e) {
          err.cause = verifyResult.error;
        }
        throw err;
      }
    }
  }

  if (verifyMatchingIssuers) {
    const credentialIssuer = resolveIssuer(credential);
    const statusListCredentialIssuer = resolveIssuer(slCredential);

    if (!(credentialIssuer && statusListCredentialIssuer) ||
        (credentialIssuer !== statusListCredentialIssuer)) {
      throw new Error(
        'Issuers of the status list credential and verifiable ' +
        'credential do not match.'
      );
    }
  }

  const credentialTypes = slCredentialBody?.type || [];

  if (!credentialTypes.includes('BitstringStatusListCredential')) {
    throw new Error(
      'Status list credential type must include "BitstringStatusListCredential".'
    );
  }

  const credentialSubject = slCredentialBody?.credentialSubject;

  if (!credentialSubject || credentialSubject.type !== 'BitstringStatusList') {
    throw new Error('Status list type must be "BitstringStatusList".');
  }

  const { encodedList } = credentialSubject;
  
  if (!encodedList || encodedList.length === 0) {
    throw new Error('encodedList is empty');
  }
  
  let list;
  let firstError: Error | undefined;
  
  // If starts with 'u', try with it stripped first (likely multibase prefix)
  if (encodedList[0] === 'u' && encodedList.length > 1) {
    try {
      list = await BitstringStatusList.decode({ encodedList: encodedList.substring(1) });
    } catch (error: any) {
      firstError = error;
    }
  }
  
  // Try as raw base64 (either no prefix, or 'u' is part of the data)
  if (!list) {
    try {
      list = await BitstringStatusList.decode({ encodedList });
    } catch (error: any) {
      const errorMsg = firstError 
        ? `Could not decode encoded status list. Tried with 'u' prefix stripped (${firstError.message}), then as raw base64 (${error?.message || error})`
        : `Could not decode encoded status list; reason: ${error?.message || error}`;
      throw new Error(errorMsg);
    }
  }

  const verified = !list.getStatus(index);
  
  return { verified, credentialStatus };
}