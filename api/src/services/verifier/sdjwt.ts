import { SDJwtVcInstance } from "@sd-jwt/sd-jwt-vc";
import type { Verifier, KbVerifier } from "@sd-jwt/types";
import { ES256, digest } from "@sd-jwt/crypto-nodejs";
import { importJWK, JWK, JWTPayload, jwtVerify } from "jose";
import { dereferenceDID } from "../documentLoader/index.js";
import { fetch_json, isURL } from "../fetch/index.js";

async function getPublicKey(issuer: string, kid: string): Promise<JWK> {
  if (isURL(issuer)) {
    const response = await fetch_json(`${issuer}/.well-known/jwt-vc-issuer`)
      .then((r: any) => r.data)
      .catch(() => {
        throw new Error("Error on fetching public key from " + issuer);
      });
    const key = response.jwks.keys.find((key: any) => key.kid === kid);
    if (!key) {
      throw new Error("Key not found und well-known");
    }
    return key;
  }
  if (kid && kid.startsWith("did:")) {
    const absoluteDidUrl =
      kid && kid.startsWith(issuer) ? kid : `${issuer}#${kid}`;
    const { publicKeyJwk } = (await dereferenceDID(absoluteDidUrl))?.document;
    if (!publicKeyJwk) {
      throw new Error("Key not found in did");
    }
    return publicKeyJwk;
  }
  throw new Error("Could not resolve public keys");
}

export async function verifySDJWT(
  verifiable: string,
  nonce?: string,
  aud?: string
): Promise<VerificationResult> {
  try {
    let sdjwtInstance: SDJwtVcInstance;
    /**
     * The verifier function. This function will verify the signature of the vc.
     * @param data encoded header and payload of the jwt
     * @param signature signature of the jwt
     * @returns true if the signature is valid
     */
    const verifier: Verifier = async (data, signature) => {
      const decodedVC = await sdjwtInstance.decode(`${data}.${signature}`);
      const payload = decodedVC.jwt?.payload as JWTPayload;
      const header = decodedVC.jwt?.header as JWK;
      const publicKey = await getPublicKey(
        payload.iss as string,
        header.kid as string
      );
      const verify = await ES256.getVerifier(publicKey);
      return verify(data, signature);
    };

    /**
     * The kb verifier function. This function will verify the signature for the key binding
     * @param data
     * @param signature
     * @param payload
     * @returns
     */
    const kbVerifier: KbVerifier = async (data, signature, payload) => {
      if (!payload.cnf) {
        throw new Error("No cnf found in the payload");
      }
      const key = await importJWK(payload.cnf.jwk as JWK, "ES256");
      return jwtVerify(`${data}.${signature}`, key).then(
        () => true,
        () => false
      );
    };

    // initialize the sdjwt instance.
    sdjwtInstance = new SDJwtVcInstance({
      hasher: digest,
      verifier,
      kbVerifier,
    });
    // verify the presentation.
    await sdjwtInstance.verify(verifiable, [], true);
    return Promise.resolve({ verified: true });
  } catch (e) {
    console.error(e);
    return Promise.reject({ verified: false, error: (e as Error).message });
  }
}
