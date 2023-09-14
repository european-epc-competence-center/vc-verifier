import SD from '@transmute/vc-jwt-sd';
import { Digest } from '@transmute/vc-jwt-sd/dist/types';

import crypto from "crypto";
import { base64url, decodeProtectedHeader, decodeJwt } from "jose";
import { dereferenceDID } from '../documentLoader/index.js';

const digester = (name: 'sha-256' = 'sha-256'): Digest => {
    if (name !== 'sha-256') {
        throw new Error('hash function not supported')
    }
    return {
        name,
        digest: async (json: string) => {
            return base64url.encode(crypto.createHash("sha256").update(json).digest());
        }
    };
};


export async function verifySDJWT(verifiable: string, nonce?: string, aud?: string): Promise<VerificationResult> {

    const parsed = SD.Parse.compact(verifiable)

    const decodedHeader = decodeProtectedHeader(parsed.jwt)

    const decodedPayload = decodeJwt(parsed.jwt)

    try {

        const alg = decodedHeader.alg;

        if (!alg) throw new Error('No alg specified in the jwt header!');

        // TODO support urls and plain keys as well
        const iss = (decodedHeader.iss || decodedPayload.iss) as string

        const kid = decodedHeader.kid as string

        const absoluteDidUrl = kid && kid.startsWith(iss) ? kid : `${iss}#${kid}`

        const { publicKeyJwk } = (await dereferenceDID(absoluteDidUrl)).document;

        const verifier = new SD.Verifier({
            alg,
            digester: digester(),
            verifier: {
                verify: async (token: string) => {
                    const parsed = SD.Parse.compact(token)
                    const verifier = await SD.JWS.verifier(publicKeyJwk)
                    return verifier.verify(parsed.jwt)
                }
            }
        })
        const verified = await verifier.verify({
            presentation: verifiable,
            nonce,
            aud
        })

        // TODO do sematic checks iat&exp 

    } catch (error: any) {
        return { verified: false, error };
    }

    return { verified: true };

}