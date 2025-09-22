// @ts-ignore
import { Bitstring } from "@digitalbazaar/bitstring";
import { JWTService } from './jwt.js';
import { Verifier } from "./index.js";

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
    suite,
    verifyStatusListCredential = true,
    verifyMatchingIssuers = true
}: {
    credential: any;
    documentLoader: Function;
    suite?: any;
    verifyStatusListCredential?: boolean;
    verifyMatchingIssuers?: boolean;
}) {
    console.log(' Starting bitstring status check...');
    let result;
    try {
        result = await _checkBitstringStatuses({
            credential,
            documentLoader,
            suite,
            verifyStatusListCredential,
            verifyMatchingIssuers,
        });
        console.log(` Bitstring status check result: ${result.verified ? 'NOT REVOKED' : 'REVOKED'}`);
    } catch (error) {
        console.log(` Bitstring status check failed: ${error}`);
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
  suite,
  verifyStatusListCredential,
  verifyMatchingIssuers
}: {
  credential: any;
  documentLoader: Function;
  suite?: any;
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
          suite,
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
  const { credentialStatus } = credential;
  
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
  suite,
  documentLoader
}: {
  credential: any;
  credentialStatus: any;
  verifyStatusListCredential: boolean;
  verifyMatchingIssuers: boolean;
  suite?: any;
  documentLoader: Function;
}) {
  console.log(`    Checking status at index ${credentialStatus.statusListIndex}...`);
  
  const { statusListIndex } = credentialStatus;
  const index = parseInt(statusListIndex, 10);

  let slCredential;
  try {
    ({ document: slCredential } = await documentLoader(
      credentialStatus.statusListCredential
    ));
    console.log(`    Status list credential loaded: ${typeof slCredential === 'string' ? 'JWT' : 'JSON-LD'}`);
  } catch (e: any) {
    const err = new Error(
      'Could not load "BitstringStatusListCredential"; ' +
      `reason: ${e?.message || e}`
    );
    err.cause = e;
    throw err;
  }

  const { statusPurpose: credentialStatusPurpose } = credentialStatus;
  
  let slCredentialStatusPurpose;
  if (typeof slCredential === 'string') {
    const decoded = JWTService.decodeJWT(slCredential);
    if ('error' in decoded) {
      throw new Error(`Failed to decode status list JWT: ${decoded.error}`);
    }
    slCredentialStatusPurpose = decoded.payload?.credentialSubject?.statusPurpose;
  } else {
    slCredentialStatusPurpose = slCredential.credentialSubject?.statusPurpose;
  }

  if (slCredentialStatusPurpose !== credentialStatusPurpose) {
    throw new Error(
      `The status purpose "${slCredentialStatusPurpose}" of the status ` +
      `list credential does not match the status purpose ` +
      `"${credentialStatusPurpose}" in the credential.`
    );
  }

  if (verifyStatusListCredential) {
    if (typeof slCredential === 'string') {
      const jwtVerifyResult = await Verifier.verify(slCredential);
      if (!jwtVerifyResult.verified) {
        console.log(`    Status list credential JWT verification failed`);
        const firstResult = jwtVerifyResult.results[0];
        const errorMessage = firstResult && 'error' in firstResult.decoded 
          ? firstResult.decoded.error 
          : 'JWT verification failed';
        
        const err = new Error(
          '"BitstringStatusListCredential" JWT not verified; ' +
          `reason: ${errorMessage}`
        );
        throw err;
      }
      console.log(`    Status list credential JWT verified`);
    } else {
      // TO-DO: JSON-LD verification using suite
      throw new Error('JSON-LD BitstringStatusListCredential verification not yet implemented');
    }
  }

  if (verifyMatchingIssuers) {
    let credentialIssuer;
    let statusListCredentialIssuer;

    if (typeof credential === 'string') {
      const decoded = JWTService.decodeJWT(credential);
      if ('error' in decoded) {
        throw new Error(`Failed to decode credential JWT: ${decoded.error}`);
      }
      credentialIssuer = typeof decoded.payload?.issuer === 'object' 
        ? decoded.payload.issuer.id 
        : decoded.payload?.issuer || decoded.payload?.iss;
    } else {
      credentialIssuer = typeof credential.issuer === 'object' 
        ? credential.issuer.id 
        : credential.issuer;
    }

    // Get issuer from the status list credential
    if (typeof slCredential === 'string') {
      const decoded = JWTService.decodeJWT(slCredential);
      if ('error' in decoded) {
        throw new Error(`Failed to decode status list JWT: ${decoded.error}`);
      }
      statusListCredentialIssuer = typeof decoded.payload?.issuer === 'object' 
        ? decoded.payload.issuer.id 
        : decoded.payload?.issuer || decoded.payload?.iss;
    } else {
      statusListCredentialIssuer = typeof slCredential.issuer === 'object' 
        ? slCredential.issuer.id 
        : slCredential.issuer;
    }

    if (!(credentialIssuer && statusListCredentialIssuer) ||
        (credentialIssuer !== statusListCredentialIssuer)) {
      throw new Error(
        'Issuers of the status list credential and verifiable ' +
        'credential do not match.'
      );
    }
  }

  let credentialTypes;
  if (typeof slCredential === 'string') {
    const decoded = JWTService.decodeJWT(slCredential);
    if ('error' in decoded) {
      throw new Error(`Failed to decode status list JWT: ${decoded.error}`);
    }
    credentialTypes = decoded.payload?.type || [];
  } else {
    credentialTypes = slCredential.type || [];
  }

  if (!credentialTypes.includes('BitstringStatusListCredential')) {
    throw new Error(
      'Status list credential type must include "BitstringStatusListCredential".'
    );
  }

  let credentialSubject;
  if (typeof slCredential === 'string') {
    const decoded = JWTService.decodeJWT(slCredential);
    if ('error' in decoded) {
      throw new Error(`Failed to decode status list JWT: ${decoded.error}`);
    }
    credentialSubject = decoded.payload?.credentialSubject;
  } else {
    credentialSubject = slCredential.credentialSubject;
  }

  if (!credentialSubject || credentialSubject.type !== 'BitstringStatusList') {
    throw new Error('Status list type must be "BitstringStatusList".');
  }

  const { encodedList } = credentialSubject;
  const list = await BitstringStatusList.decode({ encodedList });

  const verified = !list.getStatus(index);
  
  console.log(`   ${verified ? ' Credential NOT REVOKED' : ' Credential REVOKED'} (index ${index})`);
  
  return { verified, credentialStatus };
}