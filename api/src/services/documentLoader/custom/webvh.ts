import type {
  DIDResolutionResult,
  DIDResolver,
  ParsedDID,
} from "did-resolver";
import { ed25519 } from "@noble/curves/ed25519.js";
import { resolveDID } from "didwebvh-ts";

/**
 * Adapter for `didwebvh-ts` 2.8.0, which validates DID logs but ships neither a
 * `did-resolver` binding nor a verifier. Remove it once a release exports
 * `getResolver()` with a built-in verifier.
 */

type ResolutionOptions = Parameters<typeof resolveDID>[1];

/**
 * DID log entries are signed with `eddsa-jcs-2022`. The library resolves the
 * update key and strips its multicodec header before calling this.
 */
const logProofVerifier = {
  async verify(
    signature: Uint8Array,
    message: Uint8Array,
    publicKey: Uint8Array
  ): Promise<boolean> {
    try {
      // Strict RFC 8032: reject low-order keys and non-canonical signatures,
      // so a degenerate update key cannot authorize log entries.
      return ed25519.verify(signature, message, publicKey, { zip215: false });
    } catch {
      return false;
    }
  },
};

/** Builds resolution options: the verifier plus any historical selector. */
function resolutionOptions(parsed: ParsedDID): ResolutionOptions {
  const query = new URLSearchParams(parsed.query ?? "");
  const versionId = query.get("versionId");
  const versionTime = query.get("versionTime");
  const versionNumber = query.get("versionNumber");

  return {
    verifier: logProofVerifier,
    ...(versionId ? { versionId } : {}),
    ...(versionTime ? { versionTime: new Date(versionTime) } : {}),
    ...(versionNumber ? { versionNumber: Number.parseInt(versionNumber) } : {}),
  };
}

export function getResolver(): Record<string, DIDResolver> {
  async function resolve(
    did: string,
    parsed: ParsedDID
  ): Promise<DIDResolutionResult> {
    const emptyResult = {
      didDocument: null,
      didDocumentMetadata: {},
    };

    let resolution;
    try {
      resolution = await resolveDID(did, resolutionOptions(parsed));
    } catch (error) {
      // The library reports validation failures as metadata, but transport and
      // option errors still throw.
      return {
        ...emptyResult,
        didResolutionMetadata: {
          error: "notFound",
          message: error instanceof Error ? error.message : String(error),
        },
      };
    }

    const { error, problemDetails, ...documentMetadata } = resolution.meta ?? {};

    if (error) {
      return {
        ...emptyResult,
        didResolutionMetadata: { error, problemDetails },
      };
    }

    return {
      didDocument: resolution.doc ?? null,
      didDocumentMetadata: documentMetadata,
      didResolutionMetadata: { contentType: "application/did+ld+json" },
    };
  }

  return { webvh: resolve };
}
