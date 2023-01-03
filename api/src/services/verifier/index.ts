// @ts-ignore
import { verifyCredential } from '@digitalbazaar/vc';
// @ts-ignore
import { Ed25519Signature2020 } from '@digitalbazaar/ed25519-signature-2020';
// @ts-ignore
import { checkStatus } from '@digitalbazaar/vc-revocation-list';

import { documentLoader } from '../documentLoader/index.js';

export class VCVerifier {

    static async verifyCredential(credential: any): Promise<any> {
        
        // TODO choose suite based on proofType
        const suite = new Ed25519Signature2020();

        const result = await verifyCredential({credential, suite, documentLoader, checkStatus});

        return result
    }

}