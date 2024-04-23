import { SDJwtVcInstance } from "@sd-jwt/sd-jwt-vc";
import type { DisclosureFrame } from "@sd-jwt/types";
import { ES256, digest, generateSalt } from "@sd-jwt/crypto-nodejs";

const createSignerVerifier = async () => {
  const { privateKey, publicKey } = await ES256.generateKeyPair();
  return {
    signer: await ES256.getSigner(privateKey),
    verifier: await ES256.getVerifier(publicKey),
  };
};

const { signer, verifier } = await createSignerVerifier();

export async function verifySDJWT(
  verifiable: string,
  nonce?: string,
  aud?: string
): Promise<VerificationResult> {
  const sdjwt = new SDJwtVcInstance({
    signer,
    verifier,
    signAlg: "EdDSA",
    hasher: digest,
    hashAlg: "SHA-256",
    saltGenerator: generateSalt,
  });

  const decodedObject = await sdjwt.decode(verifiable);

  const verified = await sdjwt.verify(verifiable, []);

  console.log(verified);

  return { verified: true };
}
