# did:webvh integration (didwebvh-ts v3)

## Library

- Repo: [decentralized-identity/didwebvh-ts](https://github.com/decentralized-identity/didwebvh-ts)
- Unreleased **v3.0.0** on `main` adds `getResolver()` → `{ webvh: DIDResolver }` for standard `did-resolver` `Resolver`
- Published npm latest (2026): **2.8.0** — old `{ did, doc, meta, controlled }` shape, no `getResolver()`
- v3 depends on `did-resolver` **^5.0.1**; verifier currently uses **^4.1.0**

## What didwebvh-ts does during resolution

1. Fetches DID log from `https://{host}/.well-known/did.jsonl` (or `{path}/did.jsonl`)
2. Validates log chain (Ed25519 `eddsa-jcs-2022`), witnesses (`did-witness.json`), SCID, update keys
3. Returns W3C `DIDResolutionResult` — verifier only needs `didDocument` for VC proof checks

## Verifier touchpoints

| File | Change |
|------|--------|
| `api/package.json` | Add `didwebvh-ts`; bump `did-resolver` to ^5 |
| `api/src/services/documentLoader/didresolver.ts` | Spread `getWebvhResolver()` into `Resolver` |
| `api/src/services/documentLoader/index.ts` | Handle `didResolutionMetadata.error`, null doc, deactivated |
| `api/src/services/verifier/jwt.ts` | Ed25519 `Multikey` in `verifyWithMultikey` (webvh default VM type) |

## gotchas

- Name clash: alias `import { getResolver as getWebvhResolver } from 'didwebvh-ts'`
- `getResolver()` currently creates new `Resolver` per call — singleton recommended (webvh resolution is expensive)
- DIDs resolved via `getResolver()` are not TTL-cached in `documentLoader` today
- VM fragment lookup only searches `verificationMethod[]`, not relationship arrays
- Until v3 npm publish: install from GitHub tag/commit

See [verification_system.md](./verification_system.md) for overall DID resolution flow.
