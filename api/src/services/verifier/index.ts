// @ts-ignore
import { verifyCredential, verify } from '@digitalbazaar/vc';
// @ts-ignore
import { Ed25519Signature2018 } from '@digitalbazaar/ed25519-signature-2018';
// @ts-ignore
import { Ed25519Signature2020 } from '@digitalbazaar/ed25519-signature-2020';
// @ts-ignore
import { checkStatus } from '@digitalbazaar/vc-revocation-list';
// @ts-ignore
import * as ecdsaSd2023Cryptosuite from '@digitalbazaar/ecdsa-sd-2023-cryptosuite';
// @ts-ignore
import { DataIntegrityProof } from '@digitalbazaar/data-integrity';
// @ts-ignore
import jsigs from 'jsonld-signatures';

import { documentLoader } from '../documentLoader/index.js';

const { createVerifyCryptosuite } = ecdsaSd2023Cryptosuite;
const { purposes: { AssertionProofPurpose } } = jsigs;

function getSuite(proof: Proof): unknown[] {

    switch (proof.type) {

        case 'Ed25519Signature2018': return new Ed25519Signature2018();

        case 'Ed25519Signature2020': return new Ed25519Signature2020();

        case 'DataIntegrityProof': return new DataIntegrityProof({
            cryptosuite: createVerifyCryptosuite()
        });

        default: throw new Error(`${proof.type} not implemented`);
    }

}

function getSuites(proof: Proof | Proof[]): unknown[] {

    var suites: unknown[] = []

    if (Array.isArray(proof)) {
        proof.forEach((proof: Proof) => suites.push(getSuite(proof)));
    } else {
        suites = [getSuite(proof)]
    }

    return suites;

}

export class Verifier {

    static async verify(verifiable: Verifiable, challenge?: string): Promise<any> {

        const suite = getSuites(verifiable.proof);

        let result;

        if (verifiable.type.includes('VerifiableCredential')) {

            if ((Array.isArray(verifiable.proof) ? verifiable.proof[0].type : verifiable.proof.type) == 'DataIntegrityProof') {

                result = await jsigs.verify(verifiable, {
                    suite,
                    purpose: new AssertionProofPurpose(),
                    documentLoader
                });

            } else {

                result = await verifyCredential({ credential: verifiable, suite, documentLoader, checkStatus });

            }
        }

        if (verifiable.type.includes('VerifiablePresentation')) {

            // try to use challenge in proof if not provided in case no exchange protocol is used
            if (!challenge) challenge = (Array.isArray(verifiable.proof) ? verifiable.proof[0].challenge : verifiable.proof.challenge);

            result = await verify({ presentation: verifiable, suite, documentLoader, challenge, checkStatus });

        }

        if (!result) throw Error('Provided verifiable object is of unknown type!');

        // make non enumeratable errors enumeratable for the respsonse
        if (result.error && !result.error.errors) result.error.name = result.error.message;

        return result;
    }

}