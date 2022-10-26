// @ts-ignore
import { verifyCredential } from '@digitalbazaar/vc';
// @ts-ignore
import { Ed25519Signature2020 } from '@digitalbazaar/ed25519-signature-2020';

import { documentLoader } from '../documentLoader/index.js';

export class VCVerifier {

    static async verifyCredential(credential: any): Promise<any> {
        
        // TODO choose suite based on proofType
        const suite = new Ed25519Signature2020();

        return await verifyCredential({credential, suite, documentLoader});
    }

}