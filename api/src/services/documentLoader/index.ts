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

// TTL cache for dynamically fetched documents (configurable via DOCUMENT_CACHE_TTL_HOURS, defaults to 1 hour)
const cacheTTLHours = process.env.DOCUMENT_CACHE_TTL_HOURS ? Number.parseInt(process.env.DOCUMENT_CACHE_TTL_HOURS) : 1;
const cache = new TTLCache<any>(cacheTTLHours);


const documentLoader: (url: string) => Promise<any> =
  jsonldSignatures.extendContextLoader(async (url: string) => {
    // Fetch did documents
    if (url.startsWith("did:")) {
      // Resolve and validate the complete result before using any document it contains.
      const resolutionResult = await getResolver().resolve(url);
      const didDocument = normalizeDIDDocument(
        getResolvedDIDDocument(url, resolutionResult)
      );

      // Dereference verification methods locally from the validated DID document.
      if (url.includes("#")) {
        return {
          contextUrl: null,
          documentUrl: url,
          document: findVerificationMethod(url, didDocument),
        };
      }

      return {
        contextUrl: null,
        documentUrl: url,
        document: didDocument,
      };
    }

    // First check pre-loaded contexts
    let document = contexts.get(url);
    
    // If not in pre-loaded contexts, check TTL cache
    if (!document) {
      document = cache.get(url);
    }

    // fetch if not in any cache
    if (!document) {
      if (url.startsWith("ipfs://")) {
        document = await fetchIPFS(url);
      } else {
        document = await fetch_jsonld_or_jwt(url);
      }
      
      // Determine caching strategy based on document type
      // StatusListCredentials are never cached, always fetch fresh for revocation checks
      if (!isStatusListCredential(document)) {
        if (url.startsWith("did:") || isVerifiableCredential(document)) {
          // Use TTL cache for DID documents and Verifiable Credentials
          cache.set(url, document);
        } else {
          // Use permanent cache for contexts, schemas, etc.
          contexts.set(url, document);
        }
      }
      
    }

    return {
      contextUrl: null,
      documentUrl: url,
      document: document,
    };
  });

function isStatusListCredential(document: any): boolean {
  if (!document) return false;
  const payload = typeof document === 'string' && document.startsWith('ey') && document.split('.').length === 3 ? JSON.parse(atob(document.split('.')[1])) : document;
  
  const types = payload?.type || [];
  return Array.isArray(types) && (
    types.includes("BitstringStatusListCredential") ||
    types.includes("StatusList2021Credential") ||
    types.includes("RevocationList2020Credential")
  );
}

function isVerifiableCredential(document: any): boolean {
  if (!document) return false;
  const payload = typeof document === 'string' && document.startsWith('ey') && document.split('.').length === 3 ? JSON.parse(atob(document.split('.')[1])) : document;
  
  return payload?.type && 
         Array.isArray(payload.type) && 
         payload.type.includes("VerifiableCredential");
}

export { DIDResolutionError, documentLoader };
