# Plan: did:webvh verification with didwebvh-ts 3.0.0

**Status:** Implement when 3.0.0 is published on npm. This is a plan, not an implemented feature.

**Basis:** Reviewed on 2026-09-10 against verifier commit `c4e712d` (API 3.6.4) and upstream [`80b3901`](https://github.com/decentralized-identity/didwebvh-ts/tree/80b3901cf5168967d82b3f5a6d231f7d25496c71). npm reported 2.8.0 as latest during that review. Check the actual release for changes before starting.

## Scope

Add `did:webvh` to the verifier's existing DID resolution and credential verification flow. Preserve working `did:web`, `did:key`, JSON-LD, JWT, presentation, status-list, and GS1 behavior.

`didwebvh-ts` validates the DID log: SCID, history hashes, update signatures, key transitions, and required witnesses. The verifier still checks the credential signature, issuer or holder authorization, and credential status. Log update keys are not automatically credential signing keys; no new VC cryptosuite is needed just to support this DID method.

For the first release, verify against the **latest active DID state**. Historical credential verification, persistent DID caching, and browser-side wallet validation are separate follow-ups. Reject explicit webvh history selectors rather than silently ignoring them or selecting old keys from a credential's claimed signing time.

## 1. Install and register the published library

**Files:** `api/package.json`, `api/package-lock.json`, `api/src/services/documentLoader/didresolver.ts`.

Before changing dependencies, run the current API build/tests and record the baseline. Then:

- Install exact `didwebvh-ts@3.0.0` and commit the updated lockfile.
- Confirm the npm package exports `getResolver()` and works with the verifier's ESM/TypeScript setup and Node 24 Docker image.
- Prefer aligning `did-resolver` with the released dependency, currently upstream `^5.0.1`. Test the existing web and custom key resolvers before accepting that major upgrade. The prerelease registry worked with both v4 and v5 in a probe, so v5 is not proven essential just for dispatch.
- Keep the existing compiler/test tooling unless the published package demonstrates a compatibility problem.

Preserve the local `getResolver()` export and register webvh alongside the existing methods:

```ts
import { Resolver } from 'did-resolver';
import * as key from './custom/key.js';
import * as web from 'web-did-resolver';
import { getResolver as getWebvhResolver } from 'didwebvh-ts';

const resolver = new Resolver(
  {
    ...key.getResolver(),
    ...web.getResolver(),
    ...getWebvhResolver(),
  },
  { cache: false },
);

export function getResolver() {
  return resolver;
}
```

The library includes a default Ed25519 verifier for history proofs; no custom callback or old-result-shape adapter is needed.

**Caching:** the current code creates a resolver per call. Making it shared while keeping `cache: true` would retain results indefinitely. Start with the built-in cache disabled. Reuse the validated document within a verification when checking its key and controller authorization, so those checks do not accidentally use different states. Choose the smallest implementation that fits the existing flow; this does not require a general cache framework. The next verification must resolve afresh.

**Installation note:** the source investigation encountered a broken `json-canonicalize@2.0.1` package; 2.0.0 matched upstream's lockfile and worked. Recheck clean installation of the actual release before adding any dependency override. This does not establish that the future bundled npm release has the same problem.

## 2. Fix the shared DID document loader

**File:** `api/src/services/documentLoader/index.ts`.

### Check the complete resolution result

The current loader immediately extracts `.didDocument`, losing error and deactivation metadata. Instead:

1. Resolve the DID URL and retain the complete result.
2. Reject `didResolutionMetadata.error`, including when a document is present.
3. Reject `didDocumentMetadata.deactivated === true`.
4. Reject a missing DID document.
5. Only then return the document or locate its requested key.

The library normally returns failures as metadata rather than throwing. Preserve a useful error code/message through the existing JWT and JSON-LD response handling; test the serialized API response, not just the thrown error. Never fall back to `did:web` or an unvalidated `did.json` when webvh resolution fails.

### Locate the requested verification method

The existing lookup only searches `verificationMethod[]` and misses relative IDs such as `#key-1`.

- Match absolute IDs and fragment-relative IDs consistently. Preserve the existing bare-fragment compatibility behavior.
- Search top-level methods and method objects embedded in verification relationships. Merely finding a key does not authorize its use for a particular purpose.
- Fail for an unknown or ambiguous key instead of selecting the first key.
- Return a copy rather than mutating the resolver's document with `Object.assign`.
- Keep method IDs and relationship references consistent in the key/controller views, and preserve the JSON-LD context needed by the existing suites.

Keep `extendContextLoader`, the `{ contextUrl, documentUrl, document }` contract, and non-DID fetching/caching behavior. Do not turn this change into a general DID-URL resource dereferencer.

Let the library validate DID/history identity binding. Do not add an unconditional document-ID equality check that would reject a legitimate webvh location move, or treat `alsoKnownAs` as permission to substitute another issuer.

## 3. Support Ed25519 Multikey JWTs

**File:** `api/src/services/verifier/jwt.ts`, plus dependency manifests.

Currently, every `Multikey` is sent to `EcdsaMultikey.from()`. This fails for Ed25519 keys with “Unsupported public multikey header.”

Change `verifyWithMultikey` to dispatch by validated key codec:

| Key | Handling |
| --- | --- |
| Ed25519 Multikey | Decode with `@digitalbazaar/ed25519-multikey`, export public JWK, verify with `jose.jwtVerify` |
| Existing supported EC Multikey | Keep the ECDSA decoder and JWK verification |
| Unsupported/malformed key | Return a verification failure |

Declare newly imported packages as direct dependencies. Validate that the JWT algorithm matches the key; do not select a decoder from the DID method or JWT header alone. The existing `extractPublicKeyBytes` helper can assist, but its key-length heuristic is not sufficient validation of a Multikey.

Preserve working JWK and legacy Ed25519 branches. The new JWK-based branch should enforce present `exp`/`nbf` claims through `jose`; do not introduce a blanket requirement that all existing tokens contain `exp` or rewrite legacy JWT validation in this change.

Also handle relative JWT key IDs in `loadVerificationMethod`: `#key-1` currently passes through as though it were an absolute URL. Resolve a relative VC key against its issuer, and a relative VP key against the presentation's signing identity. Preserve self-contained `did:key` expansion and currently supported absolute key URLs.

## 4. Close the existing credential authorization gaps

**Files:** `api/src/services/verifier/index.ts`, `jwt.ts`, `status.ts`; check failure propagation in `gs1.ts`.

A valid signature and a valid DID log do not establish that the key is authorized to issue as the claimed issuer. The following are concrete gaps in the inspected code, not extra DID-library features:

| Path | Necessary change |
| --- | --- |
| JWT credential | Check issuer binding and `assertionMethod` authorization after signature verification; `purposeResult.valid` must not simply equal signature success |
| Data Integrity credential | Replace generic `AssertionProofPurpose` with credential issuance validation, such as the public `CredentialIssuancePurpose` export from `@digitalbazaar/vc` |
| JWT status-list credential | Apply the same issuance checks: `status.ts` calls `JWTService.verifyJWT` directly and would otherwise bypass changes in the main verifier |
| GS1 external credential | Ensure a failed overall verification stays failed even if individual signature results are true or `results` is absent |

Use a shared credential-authorization helper where practical. For the wallet's direct-controller issuance, the key's controller must match the credential issuer and authorize the key for assertion. Preserve any intentionally supported delegation model through explicit tests rather than assuming all DID subjects and controllers are identical.

Keep these checks at **credential boundaries**. `JWTService` also handles presentations and generic JWTs; adding an issuer/assertion requirement to every JWT would break those uses. JWT VPs already use `AuthenticationProofPurpose` and holder binding. Retain those checks and their challenge/domain/`holderBinding` options.

Use the existing envelope/VC-JWT decoding flow, retaining the outer JWT `iss` when processing a nested `vc` body. Support existing string/object issuer forms, reject conflicting issuer claims, and verify the original signed bytes. Avoid making the status-list path recursively invoke full status verification just to check issuer authorization.

Implement this step as a distinct, tested change. It intentionally rejects unauthorized credentials the current code may accept; document that correction. Do not broaden it into unrelated JWT, presentation-policy, or GS1 trust-rule changes.

## 5. Prove wallet interoperability and preserve current behavior

The wallet already calls the external verifier and serves `did.jsonl`; no Java verification API change is required. The library derives the public log URL, for example:

```text
did:webvh:SCID:wallet.example.com:api:registry:did:acme
  -> https://wallet.example.com/api/registry/did/acme/did.jsonl
```

Test from the verifier's Node 24 container with access to the HTTPS log and any required witness file. Upstream uses native `fetch`, not this project's `node-fetch` helper, so mock/check the actual transport.

Use real signed fixtures produced by the wallet's Java implementation. At least one integration test must run the fetched log through the published resolver and verify an actual credential; mocking the entire document loader would miss the interoperability question.

Keep the regression suite focused on these outcomes:

| Test group | Required coverage |
| --- | --- |
| Valid webvh flows | Wallet-issued JSON-LD and JWT credentials/presentations, including Ed25519 Multikey and an existing supported JWK/EC key |
| Invalid resolution | Tampered history, wrong SCID, missing required witness proofs, deactivation, and error metadata with a non-null document all fail |
| Key lookup | Absolute/relative key IDs, embedded methods, unknown keys, and working key/controller purpose validation |
| Authorization | Wrong issuer or unauthorized assertion key fails for a normal VC and a JWT status-list VC; the failure survives GS1 aggregation |
| Freshness | A subsequent verification sees rotation/deactivation; key and controller checks within one verification use consistent state |
| Existing methods/formats | Current `did:web`, Ed25519/P-256 `did:key`, JWT, JSON-LD, and envelope fixtures still pass |
| Existing application behavior | Challenge/domain/holder options, revocation/suspension, mixed-method status lists, GS1 trusted roots, and API result shapes remain unchanged |
| Initial scope | Explicit webvh historical selectors are rejected clearly; no automatic retry with old keys |

Use the existing Jest setup and restore mocked native fetch after tests. Keep time-sensitive fixtures deterministic. There is no need to reproduce the library's entire conformance suite in this repository.

From `vc-verifier/api`:

```bash
npm ci
npm run build-tsc
npm test -- --runInBand
```

Compare against the baseline and resolve unexplained regressions before release. Do not weaken verification checks or change trust roots to make a fixture pass. Sharing key material or `alsoKnownAs` does not automatically make a webvh alias a trusted GS1 issuer.

## 6. Implementation order and release

1. Capture the baseline; install/check the published package and register the resolver.
2. Fix loader result handling and key lookup; add Ed25519 Multikey JWT support.
3. Add the credential authorization fixes with their regression tests.
4. Run wallet fixture integration, the existing API suite, and a Node 24 production-image smoke test.
5. Update release notes and deploy a pinned verifier image after staging validation.

Keep a previous tested image available for rollback. Rolling back removes webvh support, so coordinate issuer rollout accordingly; do not add an automatic fallback to did:web verification.

## References and follow-ups

- [Upstream registry adapter](https://github.com/decentralized-identity/didwebvh-ts/blob/80b3901cf5168967d82b3f5a6d231f7d25496c71/src/resolver.ts)
- [Resolution-result handling](https://github.com/decentralized-identity/didwebvh-ts/blob/80b3901cf5168967d82b3f5a6d231f7d25496c71/src/resolver-result.ts)
- [Upstream migration guide](https://github.com/decentralized-identity/didwebvh-ts/blob/80b3901cf5168967d82b3f5a6d231f7d25496c71/docs/UPGRADE_2.x_to_3.0.md)
- [Verifier architecture notes](./verification_system.md)

The investigation confirmed resolver v4/v5 compatibility in a probe, reproduced the Ed25519 Multikey decoding failure, and ran 52 upstream tests successfully. That evidence does not replace testing the published package in this verifier.

Defer historical credential verification, persistent caching, and wallet frontend DID validation. Historical resolution alone is insufficient: key and controller authorization must use the intended version, with an explicit policy for later deactivation and untrusted signing timestamps. No detailed implementation of these follow-ups is required for this release.
