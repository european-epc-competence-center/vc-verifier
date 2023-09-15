import SD from '@transmute/vc-jwt-sd';
import moment from 'moment';
import crypto from "crypto";
import { base64url, decodeProtectedHeader, decodeJwt } from "jose";
import { dereferenceDID } from '../documentLoader/index.js';

const vcjwtsd = (SD as any).default;

const digester = (name: 'sha-256' = 'sha-256'): any => {
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

    const parsed = vcjwtsd.Parse.compact(verifiable);

    const decodedHeader = decodeProtectedHeader(parsed.jwt)

    const decodedPayload = decodeJwt(parsed.jwt)

    try {

        const alg = decodedHeader.alg;

        if (!alg) throw new Error('No alg specified in the jwt header!');

        // TODO support urls and plain keys as well
        const iss = (decodedHeader.iss || decodedPayload.iss) as string

        const kid = decodedHeader.kid as string

        const absoluteDidUrl = kid && kid.startsWith(iss) ? kid : `${iss}#${kid}`

        console.log(await dereferenceDID(absoluteDidUrl))

        let { publicKeyJwk } = (await dereferenceDID(absoluteDidUrl)).document;

        // in case of did:key use jwk from jwt
        if (!publicKeyJwk) publicKeyJwk = (decodedPayload.cnf as any).jwk;

        const verifier = new vcjwtsd.Verifier({
            alg,
            digester: digester(),
            verifier: {
                verify: async (token: string) => {
                    const parsed = vcjwtsd.Parse.compact(token)
                    const verifier = await vcjwtsd.JWS.verifier(publicKeyJwk)
                    return verifier.verify(parsed.jwt)
                }
            }
        })
        const verified = await verifier.verify({
            presentation: verifiable,
            nonce,
            aud
        })

        const now = moment().unix()

        if (now < verified.claimset.iat) throw new Error('Credential is not yet valid!')
        if (verified.claimset.exp && now > verified.claimset.exp) throw new Error('Credential expired!')

    } catch (error: any) {
        console.log(error)
        return { verified: false, error: error.message };
    }

    return { verified: true };

}