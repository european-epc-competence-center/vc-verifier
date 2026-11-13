/**
 * Data Integrity requires every `previousProof` value to be the `id` of
 * another proof on the same document. `jsonld-signatures` verifies each
 * proof's signature and does not check that link.
 */

export function previousProofReferenceError(proof: unknown): Error | undefined {
  const proofs = asProofs(proof);
  const ids = new Set<string>();
  for (const entry of proofs) {
    if (typeof entry?.id === 'string') ids.add(entry.id);
  }

  for (const entry of proofs) {
    if (!entry || entry.previousProof === undefined) continue;
    const references = Array.isArray(entry.previousProof)
      ? entry.previousProof
      : [entry.previousProof];
    for (const reference of references) {
      if (typeof reference !== 'string' || !ids.has(reference)) {
        return new Error(
          'previousProof does not identify a proof on this document.'
        );
      }
    }
  }
  return undefined;
}

function asProofs(proof: unknown): Array<{ id?: unknown; previousProof?: unknown } | null> {
  if (!proof || typeof proof !== 'object') return [];
  return (Array.isArray(proof) ? proof : [proof]) as Array<{
    id?: unknown;
    previousProof?: unknown;
  } | null>;
}
