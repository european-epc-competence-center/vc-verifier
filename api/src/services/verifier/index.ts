// @ts-ignore
import { verifyCredential, verify } from '@digitalbazaar/vc';
// @ts-ignore
import { Ed25519Signature2020 } from '@digitalbazaar/ed25519-signature-2020';
// @ts-ignore
import { checkStatus } from '@digitalbazaar/vc-revocation-list';

import { documentLoader } from '../documentLoader/index.js';

function getSuite(proof: Proof): unknown {

    // Ed25519Signature2020 is backwards compatible to Ed25519Signature2018
    if (['Ed25519Signature2020', 'Ed25519Signature2018'].includes(proof.type)) return new Ed25519Signature2020();

    throw new Error(`${proof.type} not implemented`);

}

export class Verifier {

    static async verify(verifiable: Verifiable): Promise<any> {

        const suite = getSuite(verifiable.proof);

        if (verifiable.type.includes('VerifiableCredential')) return await verifyCredential({ credential: verifiable, suite, documentLoader, checkStatus });

        if (verifiable.type.includes('VerifiablePresentation')) return await verify({ presentation: verifiable, suite, documentLoader, challenge: verifiable.proof.challenge, checkStatus });

        throw Error('Provided verifiable object is of unknown type!');
    }

}