// @ts-ignore
import jsonldSignatures from "jsonld-signatures";
import { getResolver } from "./didresolver.js";
import { fetch_jsonld_or_jwt, fetchIPFS } from "../fetch/index.js";
import { contexts } from "./context/index.js";
import { TTLCache } from "./ttlCache.js";

// TTL cache for dynamically fetched documents (configurable via DOCUMENT_CACHE_TTL_HOURS, defaults to 1 hour)
const cacheTTLHours = process.env.DOCUMENT_CACHE_TTL_HOURS ? Number.parseInt(process.env.DOCUMENT_CACHE_TTL_HOURS) : 1;
const cache = new TTLCache<any>(cacheTTLHours);


const documentLoader: (url: string) => Promise<any> =
  jsonldSignatures.extendContextLoader(async (url: string) => {
    // Fetch did documents
    if (url.startsWith("did:")) {
      const [did, verificationMethod] = url.split("#");

      // fetch document
      const didDocument: any = (await getResolver().resolve(url)).didDocument;

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
      
      if (url.startsWith("did:") || isVerifiableCredential(document)) {
        // Use TTL cache for DID documents and Verifiable Credentials
        cache.set(url, document);
      } else {
        // Use permanent cache for contexts, schemas, etc.
        contexts.set(url, document);
      }
      
    }

    return {
      contextUrl: null,
      documentUrl: url,
      document: document,
    };
  });

function isVerifiableCredential(document: any): boolean {
  if (!document) return false;
  const payload = typeof document === 'string' && document.startsWith('ey') && document.split('.').length === 3 ? JSON.parse(atob(document.split('.')[1])) : document;
  return payload?.type && 
         Array.isArray(payload.type) && 
         payload.type.includes("VerifiableCredential");
}

export { documentLoader };
