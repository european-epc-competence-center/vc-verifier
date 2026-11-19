// @ts-ignore
import jsonldSignatures from "jsonld-signatures";
import { getResolver } from "./didresolver.js";
import {
  findVerificationMethod,
  normalizeDIDDocument,
} from "./didDocument.js";
import { fetch_jsonld_or_jwt, fetchIPFS } from "../fetch/index.js";
import { contexts } from "./context/index.js";
import { TTLCache } from "./ttlCache.js";
import {
  decodeVerifiableInput,
  unwrapEnvelopedCredential,
} from "../verifier/envelope.js";

type DIDResolutionMetadata = {
  error?: string;
  message?: string;
  problemDetails?: {
    detail?: string;
    title?: string;
  };
};

type DIDResolutionResult = {
  didResolutionMetadata?: DIDResolutionMetadata;
  didDocument?: any | null;
  didDocumentMetadata?: {
    deactivated?: boolean;
  };
};

/** Resolution failure that preserves the resolver's machine-readable code. */
class DIDResolutionError extends Error {
  readonly code: string;

  constructor(url: string, code: string, detail: string) {
    super(`DID resolution failed for ${url} (${code}): ${detail}`);
    this.name = "DIDResolutionError";
    this.code = code;
  }
}

/** Chooses the most useful human-readable detail supplied by a resolver. */
function resolutionErrorDetail(metadata: DIDResolutionMetadata): string {
  return (
    metadata.problemDetails?.detail ||
    metadata.message ||
    metadata.problemDetails?.title ||
    "The resolver did not provide further details."
  );
}

/** Rejects failed, deactivated, or empty results and returns a usable document. */
function getResolvedDIDDocument(
  url: string,
  result: DIDResolutionResult
): any {
  const resolutionMetadata = result?.didResolutionMetadata ?? {};

  if (resolutionMetadata.error) {
    throw new DIDResolutionError(
      url,
      resolutionMetadata.error,
      resolutionErrorDetail(resolutionMetadata)
    );
  }

  if (result?.didDocumentMetadata?.deactivated === true) {
    throw new DIDResolutionError(
      url,
      "deactivated",
      "The DID is deactivated."
    );
  }

  if (!result?.didDocument) {
    throw new DIDResolutionError(
      url,
      "notFound",
      "The resolver returned no DID document."
    );
  }

  return result.didDocument;
}

/**
 * Resolver codes that may stem from an upstream outage rather than an
 * authoritative answer: web-did-resolver reports transport failures as
 * `notFound`, didwebvh-ts as `internalError`. Errors thrown by a resolver
 * (instead of reported in its metadata) are treated as transient as well.
 */
const TRANSIENT_RESOLUTION_ERRORS = new Set(["notFound", "internalError"]);

function isTransientResolutionError(error: unknown): boolean {
  return (
    !(error instanceof DIDResolutionError) ||
    TRANSIENT_RESOLUTION_ERRORS.has(error.code)
  );
}

// TTL cache for remote documents (DOCUMENT_CACHE_TTL_HOURS, default 1 h).
// Credentials, contexts and schemas are served from it until they expire.
// DID documents and status lists are refreshed on every lookup, so key
// rotation, deactivation and revocation take effect immediately; their cached
// copy only bridges transient upstream outages (see `TTLCache.load`).
// An unparsable value would yield a NaN expiry that never expires (and a fallback served forever).
const configuredTTLHours = Number(process.env.DOCUMENT_CACHE_TTL_HOURS || 1);
const cacheTTLHours = configuredTTLHours > 0 ? configuredTTLHours : 1;
const cache = new TTLCache<any>(cacheTTLHours);

/** Resolves and validates the complete result before using any document it contains. */
async function resolveDIDDocument(url: string): Promise<any> {
  return normalizeDIDDocument(
    getResolvedDIDDocument(url, await getResolver().resolve(url))
  );
}

async function loadDocument(url: string): Promise<any> {
  if (url.startsWith("did:")) {
    // Every fragment of a DID URL dereferences into the same DID document.
    const didDocument = await cache.load(
      url.split("#")[0],
      () => resolveDIDDocument(url),
      isTransientResolutionError
    );
    // Dereference verification methods locally from the validated DID document.
    return url.includes("#")
      ? findVerificationMethod(url, didDocument)
      : didDocument;
  }

  const cached = contexts.get(url) ?? cache.get(url);
  if (cached !== undefined && !isStatusListCredential(cached)) return cached;

  return cache.load(url, () =>
    url.startsWith("ipfs://") ? fetchIPFS(url) : fetch_jsonld_or_jwt(url)
  );
}

const documentLoader: (url: string) => Promise<any> =
  jsonldSignatures.extendContextLoader(async (url: string) => ({
    contextUrl: null,
    documentUrl: url,
    document: await loadDocument(url),
  }));

const STATUS_LIST_TYPES = [
  "BitstringStatusListCredential",
  "StatusList2021Credential",
  "RevocationList2020Credential",
];

/** Recognizes JSON-LD, VC-JOSE, VC-JWT (`vc` claim) and enveloped status lists. */
function isStatusListCredential(document: any): boolean {
  try {
    const credential = decodeVerifiableInput(unwrapEnvelopedCredential(document));
    const types = [credential?.type].flat();
    return STATUS_LIST_TYPES.some((type) => types.includes(type));
  } catch {
    return false; // Undecodable JWTs fail the status check anyway.
  }
}

export { DIDResolutionError, documentLoader };
