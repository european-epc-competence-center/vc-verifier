# Plan: did:webvh verification with didwebvh-ts 3.0.0

**Status:** Implementation in progress against a locally built, pinned upstream snapshot. Keep the webvh feature branch unmerged until the published npm package passes release validation.

**Basis:** Reviewed on 2026-09-10 against verifier commit `c4e712d` (API 3.6.4) and upstream [`80b3901`](https://github.com/decentralized-identity/didwebvh-ts/tree/80b3901cf5168967d82b3f5a6d231f7d25496c71). On 2026-09-11, direct upstream and npm checks reported HEAD [`3a9f65f`](https://github.com/decentralized-identity/didwebvh-ts/tree/3a9f65fd838cf750422add545c3d3a314dc61dd1), a source package version of 3.0.0, and npm latest 2.8.0. The newer manifest uses pnpm 11.13.0, TypeScript, and Vitest. The detailed code investigation below refers to `80b3901`; review the intervening changes before selecting the implementation snapshot. A source version of 3.0.0 does not identify the eventual npm release contents.

## Scope

Add `did:webvh` to the verifier's existing DID resolution and credential verification flow. Preserve working `did:web`, `did:key`, JSON-LD, JWT, presentation, status-list, and GS1 behavior.

`didwebvh-ts` validates the DID log: SCID, history hashes, update signatures, key transitions, and required witnesses. The verifier still checks the credential signature, issuer or holder authorization, and credential status. Log update keys are not automatically credential signing keys; no new VC cryptosuite is needed just to support this DID method.

For normal verification, resolve the DID URL through the upstream resolver; an unqualified DID resolves to its latest state. This integration does not add a verifier-specific policy for historical selectors, so explicit selectors follow the upstream resolver's behavior. Persistent DID caching and browser-side wallet validation are separate follow-ups.

### Current implementation checkpoint (2026-09-14)

- The pinned development artifact, resolver v5 alignment, Node 24 CI switch, resolution-result validation, and webvh resolver registration are committed.
- Verification-method lookup (checklist step 7) was committed in `2c4295d`; the absolute DID-URL path matching regression identified during review remains a separate correction.
- Wallet interoperability fixtures (step 6) now cover the supplied ES256 JWT and `ecdsa-rdfc-2019` JSON-LD VC using the actual snapshot resolver, including rejection of modified credentials, history contents, and log proofs. [Fixture provenance and coverage limits](../../api/__tests__/fixtures/didwebvh/README.md) record the successful host Node 24 HTTPS check. Production-container validation remains outstanding.
- Both wallet samples use an absolute `#next-test-key` DID URL and a P-256 JWK, so steps 9–10 are not prerequisites for this fixture coverage. DID-state reuse and issuance-authorization work remain outstanding; passing these fixtures does not establish those guarantees.
- A Node 22 CI matrix and verifier-specific historical-selector handling are not in scope for this integration.

## Development dependency and branch workflow

Use a branch such as `codex/did-webvh-integration`. Develop against one reviewed, immutable upstream commit; do not track a moving branch or depend on a sibling checkout in the committed verifier manifests. Keep each implementation commit buildable and include its focused regression tests. Resolver registration on this branch is not a production-readiness signal.

### Build and package the snapshot

1. Capture the verifier baseline before changing dependencies (commit 1 below).
2. Clone upstream separately, review changes since `80b3901`, and check out the chosen full commit SHA. `3a9f65fd838cf750422add545c3d3a314dc61dd1` is the candidate observed on 2026-09-11, not an instruction to follow future HEAD automatically.
3. Use upstream's declared package-manager version and committed lockfile. For that candidate, run the following in its checkout using a compatible Node runtime:

   ```bash
   pnpm install --frozen-lockfile
   pnpm test
   pnpm run build
   npm pack
   ```

   Build explicitly: the current `prepublishOnly` hook does not run during `npm pack`. Check the resulting archive includes the exported JavaScript entry points and TypeScript declarations. These are planned commands, not a claim that this candidate has passed them.
4. Copy the archive into `api/vendor/`, naming it `didwebvh-ts-3.0.0-3a9f65f.tgz` for this candidate. Install from the verifier's `api` directory:

   ```bash
   npm install --save-exact ./vendor/didwebvh-ts-3.0.0-3a9f65f.tgz
   ```

   The saved dependency should be a relative `file:vendor/...tgz` reference. Commit the archive, `package.json`, and `package-lock.json` together. Use a new filename for each new snapshot or rebuilt artifact; never silently replace an archive referenced by the lockfile.
5. Add a short `api/vendor/README.md` with the source URL/full SHA, any local patches (prefer none), Node and package-manager versions, build commands, archive checksum, and test results. The archive makes installation reproducible; the provenance records how it was built. The verifier lockfile controls its installed dependency tree, which may differ from upstream's development tree.
6. Temporarily add `COPY vendor/ ./vendor/` before `npm ci` in both the `deps` and `builder` stages of `api/Dockerfile`. Ensure the archive is included in the Docker build context. Prove a fresh checkout can run `npm ci` and build the image without the upstream checkout or pnpm installed in the verifier environment.

Keep npm and the current compiler/Jest tooling in the verifier. Use `npm link` only for optional upstream debugging; the committed branch and integration tests must consume the packed artifact. No private registry or upstream fork publication is needed for this workflow.

**Installation caveat:** the earlier source investigation encountered a broken `json-canonicalize@2.0.1` package; 2.0.0 matched upstream's then-current lockfile and worked. Recheck the selected snapshot's clean build and the verifier's clean installation. Add a narrow, documented workaround only if the problem reproduces; reassess it at release. The old observation does not establish that the new snapshot or published package has the same problem.

### Two validation gates

- **Development gate:** the pinned archive installs cleanly, works with this verifier's ESM/TypeScript setup, and passes the incremental checks below. Implementation and review can proceed before publication.
- **Merge/release gate:** install exact registry `didwebvh-ts@3.0.0`, review changes since the snapshot, and pass clean installation, full regression tests, real wallet integration, and Node 24 production-image validation. Remove temporary snapshot packaging before merging the feature branch. If upstream publishes an incompatible release, adapt and retest rather than treating the version change as administrative.

Independent loader, JWT, or authorization fixes may be proposed for earlier merge only when their commits and tests work without the snapshot dependency. Keep each behavior correction documented. Otherwise, retain the sequence on the feature branch and rebase as needed while waiting.

## Resolver registration and resolution lifetime

**Files:** `api/package.json`, `api/package-lock.json`, `api/src/services/documentLoader/didresolver.ts`.

Confirm the selected artifact exports `getResolver()` and works in Node 24. Keep the current top-level `did-resolver` v4 initially if compatibility checks pass. Upstream currently depends on `^5.0.1`; the earlier adapter probe worked with both v4 and v5, so a major upgrade is not assumed necessary. If alignment to v5 is required or chosen, make it a separate commit with existing web and custom key resolver regressions.

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

The reviewed library includes a default Ed25519 verifier for history proofs; confirm this remains true in the selected snapshot. No custom callback or old-result-shape adapter is expected.

**Caching:** the current code creates a resolver per call. Making it shared while keeping `cache: true` would retain results indefinitely. Start with the built-in cache disabled. Reuse the validated document within a verification when checking its key and controller authorization, so those checks do not accidentally use different states. Choose the smallest implementation that fits the existing flow; this does not require a general cache framework. The next verification must resolve afresh.

## Shared DID document loader

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

## Ed25519 Multikey JWTs and relative key IDs

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

## Credential authorization

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

Implement these corrections in the separate tested commits below. They intentionally reject unauthorized credentials the current code may accept; document that behavior change. Do not broaden them into unrelated JWT, presentation-policy, or GS1 trust-rule changes.

## Wallet interoperability and regression coverage

The wallet already calls the external verifier and serves `did.jsonl`; no Java verification API change is required. The library derives the public log URL, for example:

```text
did:webvh:SCID:wallet.example.com:api:registry:did:acme
  -> https://wallet.example.com/api/registry/did/acme/did.jsonl
```

Test from the verifier's Node 24 container with access to the HTTPS log and any required witness file. Upstream uses native `fetch`, not this project's `node-fetch` helper, so mock/check the actual transport.

Use real signed fixtures produced by the wallet's Java implementation, with provenance and no private signing keys. Bring these into the branch immediately after resolver registration. First run a fetched log through the actual snapshot resolver and verify a credential using an already-supported key format if available. If the wallet only supplies Ed25519 Multikey JWTs, commit the passing log-resolution test first and add credential verification as soon as the decoder and any necessary relative-key support land; do not manufacture a passing result or commit an expected-failing test as acceptance evidence. Missing wallet fixtures block interoperability sign-off, but not independent loader/JWT work.

By the development gate's final validation, at least one test must fetch a wallet-produced log, validate it through the real resolver, and verify an actual wallet credential including issuance authorization. Repeat against the registry package at the release gate. Mocking native fetch to serve exact fixture bytes is suitable for deterministic tests; mocking the resolver or entire document loader is not sufficient. Separately smoke-test live HTTPS log/witness retrieval from the Node 24 container.

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

Use the existing Jest setup and restore mocked native fetch after tests. Keep time-sensitive fixtures deterministic. There is no need to reproduce the library's entire conformance suite in this repository.

From `vc-verifier/api`:

```bash
npm ci
npm run build-tsc
npm test -- --runInBand
```

Compare against the baseline and resolve unexplained regressions before release. Do not weaken verification checks or change trust roots to make a fixture pass. Sharing key material or `alsoKnownAs` does not automatically make a webvh alias a trusted GS1 issuer.

## Commit-by-commit implementation checklist

The technical sections above define behavior; this checklist defines commit boundaries. Add tests with the change they exercise instead of deferring all coverage to the end. Run the API build and relevant tests for each code/dependency commit, and run the full suite at the integration and release gates. Split a commit further if it becomes difficult to review; do not combine unrelated cleanup or dependency upgrades.

1. **`docs: record webvh implementation baseline`**
   - Run `npm ci`, `npm run build-tsc`, and `npm test -- --runInBand` on the unchanged API under Node 24. Record the verifier SHA, runtime versions, results, and any existing failures in this note or a linked implementation record.
   - Check fixture availability and select/review the upstream SHA. Record missing inputs rather than claiming interoperability.
   - Done when failures can be distinguished from later regressions and the snapshot choice is explicit.

2. **`build: add pinned didwebvh development artifact`**
   - Build/test/package upstream as above. Add the tarball, provenance, manifest/lockfile updates, and both Docker copy instructions together. Do not register the resolver yet.
   - Verify package imports/exports and clean API installation/build; build the production image from the repository's normal build context.
   - Done when this checkout can consume the artifact without the upstream source directory. If resolver v5 alignment is needed, insert a separate dependency/test commit here.

3. **`ci: use Node 24`**
   - Run the existing API test workflow on Node 24, matching the production runtime used for this feature branch.
   - A Node 22 compatibility matrix is not part of this integration plan.
   - Done when the API tests execute on Node 24.

4. **`fix: reject failed or inactive DID resolution`**
   - Retain and validate full resolution results in the loader before returning a document/key. Preserve useful errors in serialized API responses.
   - Test error metadata with and without a document, missing documents, deactivation, and existing method success. Add an API-level error propagation test.
   - Done when neither JWT nor JSON-LD paths can treat failed resolution as usable key material.

5. **`feat: register the webvh resolver`**
   - Register the snapshot adapter alongside web/key and disable persistent resolver caching.
   - Test dispatch and absence of fallback on webvh failure. Existing web/key dispatch must still pass.
   - Done when basic webvh resolution works on the branch. Full verification readiness still depends on the later commits.

6. **`test: add wallet webvh interoperability fixtures`**
   - Add the wallet-generated log, credential, and any witness fixtures with provenance. Exercise the real resolver through native fetch and check the DID/key result.
   - Add the earliest passing actual-credential test permitted by the wallet's available key format. If it needs key lookup, decoder, or relative-key support from commits 7, 9, or 10, record the dependency and complete the test with the last required change.
   - Done when the fetched wallet log passes the actual snapshot library, with any remaining credential-test dependency explicit.

7. **`fix: resolve DID verification methods consistently`**
   - Normalize relative/absolute method IDs and relationship references, search embedded methods, preserve contexts, and return copies. Complete any early wallet credential test blocked solely by method lookup.
   - Test unknown and ambiguous IDs, bare-fragment compatibility, embedded keys, and unmodified source documents.
   - Done when key and controller views agree and existing JSON-LD purpose checks still work.

8. **`fix: reuse DID state within each verification`**
   - Add the smallest request-scoped resolution reuse needed by key and controller checks. Thread it through the applicable JWT, JSON-LD, presentation, and credential-authorization paths without introducing persistent caching.
   - Test that one verification uses one validated state for a DID, and a subsequent verification sees rotation/deactivation. Keep non-DID loader behavior unchanged.
   - Done when purpose validation cannot accidentally use a newer state than signature-key resolution. Keep this test in place as authorization paths are added.

9. **`feat: verify Ed25519 Multikey JWT signatures`**
   - Add the direct decoder dependency and validated codec dispatch, preserving existing EC/JWK/legacy Ed25519 behavior.
   - Test valid Ed25519 and existing EC tokens, malformed/unsupported keys, algorithm mismatch, and present `exp`/`nbf` claims. Complete the wallet JWT signature test here if its key IDs already work; otherwise complete it in commit 10.
   - Done when the wallet key codec verifies without changing generic JWT policy. Issuance authorization is added in commits 11–12.

10. **`fix: resolve relative JWT verification key IDs`**
    - Resolve VC fragments against the signing issuer and VP fragments against the presentation's signing identity; retain absolute URLs and `did:key` expansion.
    - Test VC and VP fragments, missing/invalid signing identity, absolute IDs, and existing holder/challenge/domain behavior. Complete any wallet credential signature test deferred for relative-key support.
    - Done when fragments reach the intended DID loader and do not become standalone URLs.

11. **`fix: enforce issuance authorization for JWT credentials`**
    - Add a reusable issuance check at credential boundaries, including normal JWT VCs and JWT status-list VCs in the same commit so neither bypasses it.
    - Retain outer `iss` for nested `vc` bodies, handle string/object issuers, reject conflicting claims, and verify original signed bytes. Keep generic JWT and VP behavior unchanged; avoid recursive status checking.
    - Test wrong issuer, unauthorized assertion key, issuer conflicts, valid issuance, and status-list issuance failures using the same validated DID state.
    - Done when signature success alone cannot set credential purpose success on either path.

12. **`fix: enforce Data Integrity credential issuance purpose`**
    - Use credential issuance validation in place of generic assertion purpose, preserving established delegation only where supported by explicit tests.
    - Test issuer/controller binding and assertion authorization, alongside valid JSON-LD credentials and unchanged VP authentication options.
    - Done when the wallet JSON-LD flow and existing formats pass with correct issuance checks.

13. **`fix: preserve credential failures in GS1 aggregation`**
    - Ensure an overall verification failure stays failed even when signature subresults are true or `results` is absent.
    - Test both shapes and existing trusted-root behavior; do not change trust rules for webvh aliases.
    - Done when the authorization failures from the preceding commits survive aggregation.

14. **`test: complete webvh integration and regression coverage`**
    - Fill only gaps in the coverage table: tampered history, SCID, required witnesses, deactivation, valid credential/presentation flows, status behavior, and freshness.
    - Run the full API suite/build, clean Docker build, and live Node 24 HTTPS/witness smoke test. Compare against the baseline and record results and fixture provenance.
    - Done when the development implementation passes end to end, including issuance authorization. Keep the feature branch unmerged while awaiting the registry release; periodically rebase and rerun affected checks after changes.

15. **`build: replace webvh snapshot with npm 3.0.0`** — after publication
    - In `api`, run `npm install --save-exact didwebvh-ts@3.0.0`. Confirm the lockfile resolves the registry artifact, then remove the temporary tarball, its packaging note, and the temporary Docker copy instructions. Retain the snapshot SHA/results in this implementation record.
    - Review release changes since the snapshot, recheck any workaround, and adapt code in separate focused commits if needed. Do not assume identical contents because both versions say 3.0.0.
    - Run clean `npm ci`, build, full regression/wallet tests, and the Node 24 production-image smoke test again. Confirm no snapshot paths or install-time dependency on the upstream checkout remains.
    - Done when the published artifact satisfies the merge gate.

16. **`docs: document webvh support and authorization corrections`**
    - Update release notes with `did:webvh` support and the intentional rejection of previously accepted unauthorized credentials. Record final validation evidence.
    - Done when the feature branch is ready for final review and merge. Deployment follows the existing release process after staging validation; use a pinned verifier image.

Keep a previous tested image available for rollback. Rolling back removes webvh support, so coordinate issuer rollout accordingly; do not add an automatic fallback to did:web verification.

## References and follow-ups

- [Candidate snapshot manifest](https://github.com/decentralized-identity/didwebvh-ts/blob/3a9f65fd838cf750422add545c3d3a314dc61dd1/package.json)
- [npm lifecycle scripts](https://docs.npmjs.com/cli/v11/using-npm/scripts/)
- [Upstream registry adapter](https://github.com/decentralized-identity/didwebvh-ts/blob/80b3901cf5168967d82b3f5a6d231f7d25496c71/src/resolver.ts)
- [Resolution-result handling](https://github.com/decentralized-identity/didwebvh-ts/blob/80b3901cf5168967d82b3f5a6d231f7d25496c71/src/resolver-result.ts)
- [Upstream migration guide](https://github.com/decentralized-identity/didwebvh-ts/blob/80b3901cf5168967d82b3f5a6d231f7d25496c71/docs/UPGRADE_2.x_to_3.0.md)
- [Verifier architecture notes](./verification_system.md)

The original investigation confirmed resolver v4/v5 compatibility in a probe, reproduced the Ed25519 Multikey decoding failure, and ran 52 upstream tests successfully. This evidence applies to the earlier reviewed snapshot; it does not replace testing the selected development artifact or the published package in this verifier.

Defer any verifier-specific historical credential policy, persistent caching, and wallet frontend DID validation. No detailed implementation of these follow-ups is required for this release.
