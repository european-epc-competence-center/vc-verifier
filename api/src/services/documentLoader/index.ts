// @ts-ignore
import jsonldSignatures from "jsonld-signatures";
import { getResolver } from "./didresolver.js";
import { fetch_jsonld_or_jwt, fetchIPFS } from "../fetch/index.js";
import { contexts } from "./context/index.js";
import { TTLCache } from "./ttlCache.js";

// TTL cache for dynamically fetched documents (configurable via DOCUMENT_CACHE_TTL_HOURS, defaults to 1 hour)
const cacheTTLHours = process.env.DOCUMENT_CACHE_TTL_HOURS ? Number.parseInt(process.env.DOCUMENT_CACHE_TTL_HOURS) : 1;
const cache = new TTLCache<any>(cacheTTLHours);

// Single shared resolver instance so its internal cache (cache: true) is reused
// across all DID lookups within a process lifetime. Without this, each call to
// getResolver() inside the documentLoader would create a fresh instance with an
// empty cache, causing redundant network fetches for every credential verification.
const didResolver = getResolver();

const documentLoader: (url: string) => Promise<any> =
  jsonldSignatures.extendContextLoader(async (url: string) => {
    // Fetch did documents
    if (url.startsWith("did:")) {
      const [did, verificationMethod] = url.split("#");

      // fetch document (shared resolver caches the DID document across lookups)
      const didDocument: any = (await didResolver.resolve(url)).didDocument;

      if (!didDocument) {
        throw new Error(`Could not resolve DID document for: ${did}`);
      }

      // if a verifcation method of the DID document is queried (not yet implemented in the official resolver)
      if (verificationMethod && didDocument) {
        const verificationMethodDoc: any | undefined =
          didDocument.verificationMethod.filter(function (method: any) {
            return method.id === url || method.id === verificationMethod;
          })[0];

        if (!verificationMethodDoc)
          throw new jsonldSignatures.VerificationError(
            new Error(
              `${verificationMethod} is an unknown verification method for ${did}`
            )
          );

        return {
          contextUrl: null,
          documentUrl: url,
          // deliver verification method with the DID doc context
          document: Object.assign(verificationMethodDoc, {
            "@context":
              verificationMethodDoc["@context"] || didDocument["@context"],
          }),
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

function decodeJWTPayload(jwt: string): any {
  try {
    // JWTs use base64url encoding; atob() only handles standard base64,
    // so replace - with + and _ with / before decoding.
    const base64 = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function isJWT(value: any): value is string {
  return typeof value === 'string' && value.startsWith('ey') && value.split('.').length === 3;
}

function isStatusListCredential(document: any): boolean {
  if (!document) return false;
  const payload = isJWT(document) ? decodeJWTPayload(document) : document;
  
  const types = payload?.type || [];
  return Array.isArray(types) && (
    types.includes("BitstringStatusListCredential") ||
    types.includes("StatusList2021Credential") ||
    types.includes("RevocationList2020Credential")
  );
}

function isVerifiableCredential(document: any): boolean {
  if (!document) return false;
  const payload = isJWT(document) ? decodeJWTPayload(document) : document;
  
  return payload?.type && 
         Array.isArray(payload.type) && 
         payload.type.includes("VerifiableCredential");
}

export { documentLoader };
