const VERIFICATION_RELATIONSHIPS = [
  "authentication",
  "assertionMethod",
  "keyAgreement",
  "capabilityInvocation",
  "capabilityDelegation",
] as const;

/** Converts an optional value into an array for uniform traversal. */
function toArray(value: any): any[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

/** Converts fragment-only key IDs into absolute IDs for consistent matching. */
function normalizeVerificationMethodId(did: string, id: string): string {
  if (id.startsWith("#")) return `${did}${id}`;

  // Preserve compatibility with documents that use a bare fragment value.
  if (!id.includes(":") && !id.includes("/") && !id.includes("#")) {
    return `${did}#${id}`;
  }

  return id;
}

/** Copies one method or relationship entry and normalizes its ID when it has one. */
function normalizeVerificationEntry(did: string, entry: any): any {
  if (typeof entry === "string") {
    return normalizeVerificationMethodId(did, entry);
  }

  if (entry && typeof entry === "object" && typeof entry.id === "string") {
    return {
      ...entry,
      id: normalizeVerificationMethodId(did, entry.id),
    };
  }

  return entry;
}

/** Returns a DID-document copy with absolute IDs in verification properties. */
export function normalizeDIDDocument(didDocument: any): any {
  if (typeof didDocument.id !== "string") return { ...didDocument };

  const normalized = { ...didDocument };
  const properties = ["verificationMethod", ...VERIFICATION_RELATIONSHIPS];

  for (const property of properties) {
    const value = didDocument[property];
    if (value === undefined) continue;

    normalized[property] = Array.isArray(value)
      ? value.map((entry: any) =>
          normalizeVerificationEntry(didDocument.id, entry)
        )
      : normalizeVerificationEntry(didDocument.id, value);
  }

  return normalized;
}

/** Identifies a complete embedded method rather than an ID-only reference. */
function isEmbeddedVerificationMethod(entry: any): boolean {
  return Boolean(
    entry &&
      typeof entry === "object" &&
      typeof entry.id === "string" &&
      typeof entry.type === "string" &&
      entry.controller
  );
}

/** Collects methods declared at the top level or inside relationships. */
function collectVerificationMethods(didDocument: any): any[] {
  const embedded = VERIFICATION_RELATIONSHIPS.flatMap((relationship) =>
    toArray(didDocument[relationship]).filter(isEmbeddedVerificationMethod)
  );

  return [...toArray(didDocument.verificationMethod), ...embedded];
}

/** Returns the bare DID of a DID URL, dropping parameters, path, and query. */
function didFromUrl(didUrl: string): string {
  return didUrl.split(/[;/?]/)[0];
}

/** Returns the one method matching a DID URL. */
export function findVerificationMethod(url: string, didDocument: any): any {
  const [didUrl, fragment] = url.split("#");
  // Match the requested DID, so a document identifying another DID cannot
  // supply the key. Relative IDs inside the document resolve against its own id.
  const requestedDid = didFromUrl(didUrl);
  const verificationMethodId = `${requestedDid}#${fragment}`;
  const matches = collectVerificationMethods(didDocument).filter(
    (method) => method?.id === verificationMethodId
  );

  if (matches.length === 0) {
    throw new Error(
      `${fragment} is an unknown verification method for ${requestedDid}`
    );
  }

  // Never choose a key based on document order when an ID is defined twice.
  if (matches.length > 1) {
    throw new Error(
      `${fragment} is defined more than once in ${requestedDid}`
    );
  }

  return {
    ...matches[0],
    "@context": matches[0]["@context"] || didDocument["@context"],
  };
}
