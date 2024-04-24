import { verifyDataIntegrityProof } from "./dataintegrity.js";
import { verifySDJWT } from "./sdjwt.js";

export class Verifier {
  static async verify(
    verifiable: Verifiable | string,
    challenge?: string,
    domain?: string
  ): Promise<VerificationResult> {
    // vc-jwt or sd-jwt
    if (typeof verifiable == "string" && verifiable.startsWith("ey"))
      return await verifySDJWT(verifiable, challenge, domain, false);

    // DataIntegrityProof
    if (typeof verifiable == "object")
      return await verifyDataIntegrityProof(verifiable, challenge, domain);

    throw new Error("Unrecognized credential type!");
  }
}
