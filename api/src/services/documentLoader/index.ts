// @ts-ignore
import jsonldSignatures from "jsonld-signatures";
import { getResolver } from "./didresolver.js";
import { fetch_jsonld_or_jwt, fetchIPFS } from "../fetch/index.js";
import { contexts } from "./context/index.js";
import { TTLCache } from "./ttlCache.js";

// Fresh TTL: how long remote resources are considered up-to-date (default 1 h)
const cacheTTLHours = process.env.DOCUMENT_CACHE_TTL_HOURS
  ? Number.parseInt(process.env.DOCUMENT_CACHE_TTL_HOURS)
  : 1;

// Stale TTL: how long to keep entries as a fallback when the remote is
// unavailable (default 24 h, must be >= fresh TTL)
const cacheStaleTTLHours = process.env.DOCUMENT_CACHE_STALE_TTL_HOURS
  ? Math.max(Number.parseInt(process.env.DOCUMENT_CACHE_STALE_TTL_HOURS), cacheTTLHours)
  : Math.max(cacheTTLHours * 24, 24);

const cache = new TTLCache<any>(cacheTTLHours, cacheStaleTTLHours);


const documentLoader: (url: string) => Promise<any> =
  jsonldSignatures.extendContextLoader(async (url: string) => {
    // ── DID documents ────────────────────────────────────────────────────────
    if (url.startsWith("did:")) {
      const [did, verificationMethod] = url.split("#");

      // Check TTL cache first (keyed on the base DID without fragment)
      let didDocument: any = cache.get(did);

      if (!didDocument) {
        // Try live resolution
        let resolved: any = null;
        try {
          resolved = (await getResolver().resolve(did)).didDocument;
        } catch (resolveError) {
          console.warn(`DID resolution threw for ${did}:`, resolveError);
        }

        if (resolved) {
          didDocument = resolved;
          cache.set(did, didDocument);
        } else {
          // Fall back to stale entry if the remote is unavailable
          const stale = cache.getStale(did);
          if (stale) {
            console.warn(`DID resolution failed for ${did}, serving stale cached document`);
            didDocument = stale;
          }
        }
      }

      // Extract the specific verification method when a fragment is present
      if (verificationMethod && didDocument) {
        const verificationMethodDoc: any | undefined =
          didDocument.verificationMethod?.filter(function (method: any) {
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

    // ── Static pre-loaded contexts ───────────────────────────────────────────
    let document = contexts.get(url);

    // ── TTL cache ────────────────────────────────────────────────────────────
    if (!document) {
      document = cache.get(url);
    }

    // ── Live fetch ───────────────────────────────────────────────────────────
    if (!document) {
      try {
        if (url.startsWith("ipfs://")) {
          document = await fetchIPFS(url);
        } else {
          document = await fetch_jsonld_or_jwt(url);
        }

        // Determine caching strategy based on document type:
        //  - Status list credentials: TTL cache so revocation checks stay
        //    reasonably fresh while surviving short remote outages
        //  - Other VCs: TTL cache
        //  - Static resources (contexts, schemas, …): permanent cache
        if (isStatusListCredential(document) || isVerifiableCredential(document)) {
          cache.set(url, document);
        } else {
          contexts.set(url, document);
        }
      } catch (fetchError) {
        // Remote unavailable – try the stale entry as a graceful fallback
        const stale = cache.getStale(url);
        if (stale) {
          console.warn(`Fetch failed for ${url}, serving stale cached document:`, fetchError);
          document = stale;
        } else {
          throw fetchError;
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
  const payload =
    typeof document === "string" &&
    document.startsWith("ey") &&
    document.split(".").length === 3
      ? JSON.parse(atob(document.split(".")[1]))
      : document;

  const types = payload?.type || [];
  return (
    Array.isArray(types) &&
    (types.includes("BitstringStatusListCredential") ||
      types.includes("StatusList2021Credential") ||
      types.includes("RevocationList2020Credential"))
  );
}

function isVerifiableCredential(document: any): boolean {
  if (!document) return false;
  const payload =
    typeof document === "string" &&
    document.startsWith("ey") &&
    document.split(".").length === 3
      ? JSON.parse(atob(document.split(".")[1]))
      : document;

  return (
    payload?.type &&
    Array.isArray(payload.type) &&
    payload.type.includes("VerifiableCredential")
  );
}

export { documentLoader };
