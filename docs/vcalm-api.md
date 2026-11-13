# VCALM verifier API

Contract for the [VCALM v1.0](https://www.w3.org/TR/vcalm-1.0/) verifier surface beside the existing EECC API. The routes are implemented at `/api/vcalm` and follow this document, including the harness status-code profile.

VCALM (Verifiable Credential API for Lifecycle Management) is the W3C Working Draft that replaced the older VC API. It defines HTTP endpoints for issuing, verifying, presenting, and managing credentials. This repository is a verifier, so the new surface covers verification only.

## Why a second API

`POST /api/verifier` is the API the UI, GS1 route, and existing clients use. It accepts a JSON array and returns HTTP 200 with `verified: false` when a proof fails. The W3C test harness does not speak that API.

The harness posts one document per request:

```json
{
  "verifiableCredential": { },
  "options": { "checks": ["proof"] }
}
```

or, for a presentation:

```json
{
  "verifiablePresentation": { },
  "options": { "challenge": "...", "domain": "..." }
}
```

It treats the HTTP status as the verdict. **200** means the document was accepted. **400** or **422** means it was rejected. A body with `verified: false` on a 200 response is counted as a pass. The VC 2.0 client also treats a 200 body that contains a non-empty `errors` array as a failure.

Those two behaviors cannot be one route. Adding VCALM fields to `POST /api/verifier` would break the frontend and the GS1 endpoint. The VCALM routes are a new mount that calls the same `verify` function.

## What this API has to fulfill

Two layers, and they are not the same specification.

### 1. Transport the harness can call

The suites that feed [canivc](https://canivc.com/) deliver documents through a frozen subset of the VC API / VCALM verify endpoints. The VC Data Model 2.0 suite calls this its "test suite HTTP API" and says the assertions care about the credential, not the wrapper. Meeting this layer is what makes a verifier show up in those reports.

Required behavior:

| Requirement | Detail |
|---|---|
| Credential route | `POST` JSON `{ verifiableCredential, options }` |
| Presentation route | `POST` JSON `{ verifiablePresentation, options }` |
| Success | HTTP 200, `Content-Type: application/json`, body has `verified: true` and no non-empty `errors` array |
| Rejection | HTTP 400 (422 is also accepted by the harness). Covers a failed proof, a failed status check that was requested, a bad challenge or domain, and a body the verifier cannot process |
| Not used | HTTP 401. The VC 2.0 assertions treat 401 as the wrong failure. No redirects |
| Challenge and domain | Read from `options.challenge` and `options.domain` on the presentation route. The existing query aliases (`challenge` / `nonce`, `domain` / `audience` / `aud`) stay on `/api/verifier` only |
| `options.checks` | When present, `"proof"` selects cryptographic verification and `"credentialStatus"` selects status verification. Proof-only suite requests send `checks: ["proof"]` and must not fetch a status list |
| Unknown options | Accept them. Suite manifests add their own keys (`credentialFormat`, `checks`, and others). Rejecting an unknown option as VCALM `UNKNOWN_OPTION_PROVIDED` fails every suite request |
| One document | Each call verifies the single object in the body. The response is one object, not an array |
| Public | No OAuth and no ZCAP. The harness can send either, but unauthenticated endpoints are the normal registration |
| Contexts | A credential or presentation that uses `https://www.w3.org/ns/credentials/v2` or `https://www.w3.org/ns/credentials/examples/v2` must load. The document loader already fetches unknown contexts |
| `did:key` | Suite vectors use `did:key` issuers. Ed25519 (`z6Mk`) and P-256 (`zDna`) already resolve in `api/src/services/documentLoader/custom/key.ts` |

### 2. VCALM verify shape, where it does not fight the harness

[VCALM §3.3](https://www.w3.org/TR/vcalm-1.0/) is the document the request and response fields follow.

Fulfill these parts:

- Credential body property `verifiableCredential`, including an `EnvelopedVerifiableCredential` (already unwrapped by `unwrapEnvelopedCredential` in `api/src/services/verifier/envelope.ts`).
- Presentation body property `verifiablePresentation`, with `options.challenge` and `options.domain` applied to the presentation proof.
- Response fields `verified`, `problemDetails`, and `results`. Include `credential` only when `options.returnCredential` is true. Include the presentation only when `options.returnPresentation` is true. The harness does not send those flags, so the default response omits the document.
- Problem details use the VCALM / RFC 9457 shape (`type`, `title`, `detail`) and the type URLs defined by the data model, Data Integrity, and Bitstring Status List specs. Put them in `problemDetails` on the JSON body.
- Verification of the presentation proof, each enclosed credential, and the holder binding between the presentation proof and its verification method. VCALM explicitly leaves "credential subject equals presentation holder" out of this endpoint. That check is `holderBinding` in `api/src/services/verifier/holder.ts`, and the VCALM routes pass `holderBinding: false`. `POST /api/verifier` keeps its default of `true`.

Do not follow the current VCALM presentation status-code rule. The draft says `POST /presentations/verify` returns 200 when the process ran, even if `verified` is false, and reserves 400 for a malformed request. The harness does the opposite: a failed presentation is 400. Implementing the draft's presentation rule makes every negative test a false pass. Both VCALM routes use the harness rule (200 only when `verified` is true, 400 otherwise). The body still carries `verified` and `problemDetails`, so a VCALM client can read the reason. Record this as a deliberate profile, not an oversight.

### Out of scope

This repository does not issue credentials. The following VCALM endpoints are not part of this work:

- `POST /credentials/issue`, `POST /credentials/status`, `GET` and `DELETE /credentials/{id}`
- `POST /credentials/derive`, presentation exchange, and workflow callbacks
- `POST /challenges` (the suites use a static challenge)
- A `gs1Result` field on the VCALM body (`POST /api/verifier/gs1` stays the GS1 API). `options.checks` containing `gs1Rules` runs those rules and reports a failure as `problemDetails`
- Replacing or versioning `POST /api/verifier`

VC Data Model 2.0 issuer statements need an issuer that secures credentials with `eddsa-rdfc-2022`. Those rows stay unimplemented. The cryptosuite verifier suites sign their own vectors and only need the two verify routes.

## Route contract

Mount under `/api/vcalm` so the prefix sits next to `/api/verifier`. The suite manifest stores the full URL, so the prefix is local.

### `POST /api/vcalm/credentials/verify`

Request:

```json
{
  "verifiableCredential": { },
  "options": {
    "checks": ["proof"],
    "returnResults": false,
    "returnProblemDetails": false,
    "returnCredential": false
  }
}
```

`verifiableCredential` is required. It may be a JSON-LD credential, an `EnvelopedVerifiableCredential`, or a compact JWT string. Missing or non-object bodies (except a JWT string) are HTTP 400.

Processing:

1. Read `options.checks`. Absent means proof and, when `credentialStatus` is present, status. Present means run only the named checks this verifier implements. `gs1Rules` selects `verifyGs1`. Ignore `credentialSchema` and any other check name.
2. Call `verify` with status checking gated by that decision. When `gs1Rules` is requested, call `verifyGs1` instead and drop `gs1Result` before mapping.
3. Map the result with the status rule below.

### `POST /api/vcalm/presentations/verify`

Request:

```json
{
  "verifiablePresentation": { },
  "options": {
    "challenge": "static-challenge",
    "domain": "https://w3c.github.io/vc-data-model-2.0-test-suite/",
    "checks": ["proof"]
  }
}
```

`verifiablePresentation` is required. Pass `options.challenge` and `options.domain` through to `verify`. Pass `holderBinding: false`. Apply the same `checks` rule to enclosed credentials.

The VC 2.0 suite also submits unsigned presentations. A presentation the verifier cannot process, including one with no proof when a proof is required, is HTTP 400.

### Status mapping

| `verify` outcome | HTTP | Body |
|---|---|---|
| `verified === true` | 200 | `{ "verified": true, "results": ..., "problemDetails": [] }` |
| `verified === false` | 400 | `{ "verified": false, "problemDetails": [ ... ] }` |
| Thrown error (unknown proof type, malformed object, resolver failure, unknown status type) | 400 | `{ "verified": false, "problemDetails": [ ... ] }` |

On 200, omit `errors`. The VC 2.0 helper rejects the call when that array is non-empty. `results` may be `{}` when `returnResults` is not true. `problemDetails` on 200 is an empty array.

On 400, map `result.error` / `result.errors` into `problemDetails`. Use a data-model or data-integrity `type` URL when the failure is cryptographic, and a generic invalid-input type when the body never reached verification. The harness does not parse this body; it exists for VCALM clients.

Do not answer 200 for a failed proof. That is the bug that makes the current `POST /api/verifier` unusable as a suite endpoint.

## Suites this surface can claim

Register only tags the verifier implements today (`api/src/services/verifier/suites.ts`).

| Tag | Suite | Ready when the routes exist |
|---|---|---|
| `eddsa-rdfc-2022` | `vc-di-eddsa-test-suite` | Yes. Proof-only manifest option `checks: ["proof"]` |
| `ecdsa-rdfc-2019` | `vc-di-ecdsa-test-suite` | Yes, with `supportedEcdsaKeyTypes: ["P-256"]` |
| `ecdsa-sd-2023` | `vc-di-ecdsa-test-suite` | Yes, P-256 only. Verification uses `createVerifyCryptosuite()` |
| `Ed25519Signature2020` | `vc-di-ed25519signature2020-test-suite` | Yes |
| `BitstringStatusList` | `vc-bitstring-status-list-test-suite` | Yes, on an endpoint whose manifest `options.checks` includes `credentialStatus` |
| `vc2.0` | `vc-data-model-2.0-test-suite` | Verifier and presentation-verifier rows only. Issuer rows need an issuer this repo does not have |

Leave these tags off the manifest until the code exists: `eddsa-jcs-2022`, `ecdsa-jcs-2019`, `bbs-2023`, `EnvelopingProof`, `JWT`. P-384 (`did:key` multibase prefix `z82`) is not registered in the did:key driver, so `supportedEcdsaKeyTypes` must not list `P-384`. Adding that prefix is a separate change and is not required to enter the P-256 columns.

Use two verifier entries when one URL cannot express both proof-only and status checks. The implementations repo allows several `verifiers` objects that share an endpoint and differ by `tags` and `options`. Point the proof suites at `checks: ["proof"]` and the status-list suite at `checks: ["proof", "credentialStatus"]`.

Example manifest, for a later pull request to [w3c/vc-test-suite-implementations](https://github.com/w3c/vc-test-suite-implementations). Do not send that pull request until a public deployment of these routes exists.

```json
{
  "name": "European EPC Competence Center GmbH (EECC)",
  "implementation": "EECC VC Verifier",
  "verifiers": [
    {
      "id": "https://ssi.eecc.de/api/vcalm/credentials/verify",
      "endpoint": "https://ssi.eecc.de/api/vcalm/credentials/verify",
      "supportedEcdsaKeyTypes": ["P-256"],
      "supports": { "vc": ["1.1", "2.0"] },
      "options": { "checks": ["proof"] },
      "tags": ["vc2.0", "eddsa-rdfc-2022", "ecdsa-rdfc-2019", "ecdsa-sd-2023", "Ed25519Signature2020"]
    },
    {
      "id": "https://ssi.eecc.de/api/vcalm/credentials/verify#status",
      "endpoint": "https://ssi.eecc.de/api/vcalm/credentials/verify",
      "options": { "checks": ["proof", "credentialStatus"] },
      "tags": ["BitstringStatusList"]
    }
  ],
  "vpVerifiers": [
    {
      "id": "https://ssi.eecc.de/api/vcalm/presentations/verify",
      "endpoint": "https://ssi.eecc.de/api/vcalm/presentations/verify",
      "options": { "checks": ["proof"] },
      "tags": ["vc2.0"]
    }
  ]
}
```

Confirm the host against the deployed verifier before opening the manifest PR. `https://ssi.eecc.de` is the production host in the README today.

## Existing API that must stay

`api/src/app.ts` mounts `verifyRouter` at `/api/verifier`. None of the following change:

- `POST /api/verifier` — JSON array, query `challenge` / `domain` / `holderBinding`, HTTP 200 with `verified: false` on a failed proof, HTTP 400 only when the handler throws
- `GET /api/verifier/vc/:vcid` and `GET /api/verifier/id/:subjectId`
- `POST /api/verifier/gs1`
- Default `holderBinding: true` on those routes
- Status checking whenever `credentialStatus` is present, on those routes

The frontend keeps calling `/api/verifier`. It does not need a VCALM client.

## Code changes

Follow the existing layering: router, route handler, service.

### New files

| File | Responsibility |
|---|---|
| `api/src/routers/vcalm/index.ts` | `POST /credentials/verify` and `POST /presentations/verify`, with JSDoc for the existing `express-jsdoc-swagger` setup |
| `api/src/routes/vcalm/index.ts` | HTTP handlers: write the status and JSON body from `verifyCredential` / `verifyPresentation` in `services/vcalm` |
| `api/src/services/vcalm/response.ts` | Map a `VerificationResult` or a thrown error to `{ status, body }` |
| `api/__tests__/vcalm.test.ts` | Supertest coverage of the contract below |
| `api/__tests__/vcalm-conformance.test.ts` | The canivc conformance rows this verifier can run without an issuer |

Export the router from `api/src/routers/index.ts` and mount it in `api/src/app.ts`:

```typescript
app.use('/api/vcalm', vcalmRouter);
```

### `verify` options

`verify` is `(input, options?: VerifyOptions)` and checks status when `credentialStatus` is present unless `options.checkStatus` is `false` (`api/src/services/verifier/index.ts`, `getCheckStatus`). Callers in `routes/verify/index.ts` and `gs1.ts` pass the same fields in that object:

```typescript
export interface VerifyOptions {
  challenge?: string;
  domain?: string;
  holderBinding?: boolean;
  /** When false, ignore credentialStatus. Default true. */
  checkStatus?: boolean;
}
```

`checkStatus: false` skips `getCheckStatus` for both JSON-LD and JWT credentials. Enclosed credentials in a presentation inherit the same flag. `holderBinding` defaults to `true` when the options object omits it.

`options.checks` containing `gs1Rules` does not add a flag to `verify`. `verifyCredential` / `verifyPresentation` in `services/vcalm` call `verifyGs1` (the same verifier as `POST /api/verifier/gs1`) and then drop `gs1Result` before the VCALM mapper runs. Rule failures become `problemDetails`.

### Option translation in the route

```text
checks absent                          → checkStatus: true
checks includes "credentialStatus"     → checkStatus: true
checks is an array without that entry  → checkStatus: false
checks includes "gs1Rules"             → verifyGs1, then drop gs1Result
options.challenge / options.domain     → VerifyOptions.challenge / domain
VCALM presentation route               → holderBinding: false
VCALM credential route                 → holderBinding omitted (no presentation)
```

Do not require `checks` to contain `"proof"`. Every suite request that reaches verification wants the proof checked, and a credential with no proof already fails inside `verify`.

### Response mapping

`normalizeResult` in `services/verifier/index.ts` already copies `error.errors` onto `errors` and returns `verified`. `response.ts` is the only place that chooses the HTTP status. The existing verify route must not import it.

`problemDetails[].type` should prefer the URLs the data model already defines (for example `https://www.w3.org/TR/vc-data-model-2.0#CRYPTOGRAPHIC_SECURITY_ERROR`). When the thrown error has no matching type, use a local type under a stable prefix such as `https://ssi.eecc.de/api/vcalm/problems/invalid-input` and put the message in `detail`. Do not put stack traces in `detail`.

### Swagger

Document both routes in the router JSDoc, in the same style as `api/src/routers/verify/index.ts`. State the status rule in the description so the published `/api/docs` page does not claim that 200 with `verified: false` is success. Mention the profile difference from the VCALM presentation clause in that description.

## Tests

`api/__tests__` runs offline through `api/test-support/setup-http.ts`. New tests use existing fixtures and Supertest against `src/app.ts`. They do not call the W3C suites.

Cover at least:

1. A valid fixture credential posted as `{ verifiableCredential }` returns 200 and `verified: true`, with no `errors` property.
2. The same credential with a corrupted `proofValue` returns 400 and `verified: false`.
3. A body that is a raw credential, or an array, returns 400. This locks the difference from `POST /api/verifier`.
4. `options.checks: ["proof"]` on a credential that has `credentialStatus` does not fetch the status list. Assert that the offline HTTP fixture layer saw no status-list request.
5. `options.checks` containing `credentialStatus` does perform the status check, using a fixture that already records the list.
6. A presentation with matching `options.challenge` and `options.domain` returns 200. A wrong challenge returns 400.
7. A presentation whose holder differs from the credential subject still returns 200 when the proof is valid (`holderBinding: false`).
8. `POST /api/verifier` with the same failing credential still returns 200 and `verified: false`.

`api/__tests__/vcalm-conformance.test.ts` repeats the conformance rows canivc shows for a verifier that does not issue:

- VC API Verifier, "Verify Credential - Data Integrity" (`w3c-ccg/vc-api-verifier-test-suite` `tests/10-vc-di.js`). The harness accepts HTTP 200 for the valid credential and HTTP 400 or 422 for each mutation. `result.status` in that file is the HTTP status.
- VC Data Model 2.0, "Basic Conformance" verifier statements (`w3c/vc-data-model-2.0-test-suite` `tests/1.03-conformance.js`). The non-conforming document is `{ "type": ["NonconformingDocument"] }` on both routes.

The JWT column (`tests/11-vc-jwt.js`) issues a credential before it mutates it, and it only runs for endpoints tagged `JWT`. This repository has no issuer, so that column is not claimed.

Run from `api`:

```sh
npm test -- --runInBand __tests__/vcalm-conformance.test.ts
npm test -- --runInBand
npm run build-tsc
```

## Running the W3C suites locally

The Jest file checks the same status rule on a local fixture. The published column is produced by the suite repositories, which are not part of this repository. Clone a suite as a sibling of `canivc` (the directory name must match the suite repo, for example `vc-data-model-2.0-test-suite`). Start this API with `npm run dev` from `api` so it can fetch `https://www.w3.org/ns/credentials/v2` and resolve `did:key`. The Jest offline fetch stub must not be active in that process.

In the suite root, copy `localConfig.example.cjs` to `localConfig.cjs`. Suites select endpoints with `filterByTag`, so each endpoint needs its tag. A `localConfig.cjs` with `testAllImplementations` left false runs only this file:

```js
const baseUrl = process.env.BASE_URL || 'http://localhost:3000/api/vcalm';
module.exports = {
  settings: {
    enableInteropTests: false,
    testAllImplementations: false
  },
  implementations: [{
    name: 'European EPC Competence Center GmbH (EECC)',
    implementation: 'EECC VC Verifier',
    verifiers: [{
      id: `${baseUrl}/credentials/verify`,
      endpoint: `${baseUrl}/credentials/verify`,
      supportedEcdsaKeyTypes: ['P-256'],
      options: { checks: ['proof'] },
      tags: ['vc2.0', 'eddsa-rdfc-2022', 'ecdsa-rdfc-2019', 'ecdsa-sd-2023', 'Ed25519Signature2020', 'vc-api']
    }, {
      id: `${baseUrl}/credentials/verify#status`,
      endpoint: `${baseUrl}/credentials/verify`,
      options: { checks: ['proof', 'credentialStatus'] },
      tags: ['BitstringStatusList']
    }],
    vpVerifiers: [{
      id: `${baseUrl}/presentations/verify`,
      endpoint: `${baseUrl}/presentations/verify`,
      tags: ['vc2.0']
    }]
  }]
};
```

Use the proof endpoint for the cryptosuite suites and the `#status` endpoint when the suite's requests must include `credentialStatus`. The VC API verifier suite reads the `vc-api` tag from [w3c-ccg/vc-test-suite-implementations](https://github.com/w3c-ccg/vc-test-suite-implementations). The Working Group suites read their tags from [w3c/vc-test-suite-implementations](https://github.com/w3c/vc-test-suite-implementations). One local file can carry both; each suite ignores tags it does not query.

Working Group suites declare Node.js 22 or newer. The VC API verifier suite workflow uses Node.js 20. From the suite root:

```sh
npm install
npm test
```

`npm test` installs the implementations package from `main` and writes `reports/`, including `reports/index.json`. Issuer rows in the data-model suite fail or skip. That is the missing issuer. Fix verifier failures before any manifest pull request.

Suggested order, one suite at a time:

1. `vc-di-eddsa-test-suite` (`eddsa-rdfc-2022` verifier vectors)
2. `vc-di-ecdsa-test-suite` (P-256 `ecdsa-rdfc-2019` and `ecdsa-sd-2023`)
3. `vc-di-ed25519signature2020-test-suite`
4. `vc-bitstring-status-list-test-suite` against the status-checks endpoint
5. `vc-data-model-2.0-test-suite` verifier and `vpVerifier` cases
6. `vc-api-verifier-test-suite` for the Data Integrity conformance matrix. Its default issuer is Digital Bazaar (`ISSUER_NAME` overrides that). The JWT matrix still needs a `JWT` issuer

### Preview in canivc

canivc does not store results. `src/_data/results.js` fetches each suite's published `index.json`. With the suite checkouts as siblings of the canivc checkout:

```sh
cd ../canivc
npm install
npm run serve:local
```

`CANIVC_LOCAL_REPORTS=1` reads `../<suite-repo>/reports/index.json` and falls back to the published URL when that file is absent. Open the report page for the suite and confirm the EECC column.

### Publishing the column

A pull request to canivc is not how an implementation appears. canivc already lists these suite report URLs. The column appears after both of the following happen:

1. The public deployment is registered. Open a manifest pull request, using the example in [Suites this surface can claim](#suites-this-surface-can-claim), and only after the local verifier rows pass. Working Group tags go to `w3c/vc-test-suite-implementations`. The VC API Data Integrity matrix also needs `w3c-ccg/vc-test-suite-implementations` with the tag `vc-api` on `POST /api/vcalm/credentials/verify`. Leave `JWT` off. Endpoints must be public HTTPS. The suites do not use the Jest process.
2. The suite workflow runs. `Generate W3C Interoperability Report` (Working Group) and `Generate Interop Report` (VC API verifier) run on Sunday at 05:00 UTC and on `workflow_dispatch`. Each run executes `npm test` against the manifests on `main`, then deploys the `reports/` directory to `gh-pages`. canivc reads that deployment, for example `https://w3c.github.io/vc-data-model-2.0-test-suite/index.json`.

To start a run after the manifest is on `main`, from a checkout of canivc, with the GitHub CLI authenticated for `workflow`:

```sh
scripts/rerun-test-reports.sh vc-data-model-2.0-test-suite
scripts/test-report-status.sh
```

The rerun script lists the Working Group suites only. The VC API verifier suite is published the same way and is already a canivc source; trigger it directly:

```sh
gh workflow run main.yml --repo w3c-ccg/vc-api-verifier-test-suite --ref main
```

`scripts/rerun-test-reports.sh --list` prints the Working Group suite names the script knows. Adding a suite that canivc does not yet fetch is a separate change to `src/_data/results.js` in canivc.

## Work sequence

1. **Options on `verify`.** Add `checkStatus` without changing current call results. Unit-test that `checkStatus: false` skips status and the default still checks it.
2. **Response mapper.** Pure function, tested without HTTP.
3. **Routes.** Mount `/api/vcalm`, implement both handlers, add the Supertest cases above, including the regression that `/api/verifier` is unchanged.
4. **Swagger text** for the two routes and the status profile.
5. **Local suite runs** in the order above. Fix mismatches the fixtures did not catch (context loading, `did:key` variants, unsigned presentations, `errors` leaking into a 200).
6. **Deploy**, then open the implementations-repo manifest with only the tags that passed.

Changelog entries for the code belong under `[Unreleased]` when the routes land. The manifest pull request is a separate repository.

## Acceptance

The work is done when all of the following hold:

- `POST /api/vcalm/credentials/verify` and `POST /api/vcalm/presentations/verify` implement the request, status, and body rules in this document.
- `POST /api/verifier`, `/gs1`, and the GET routes behave as they do today, including HTTP 200 for a failed proof.
- The Jest suite and `npm run build-tsc` pass.
- A local run of the EdDSA, ECDSA (P-256), Ed25519Signature2020, and Bitstring Status List verifier suites reports passes for this implementation.
- The VC 2.0 verifier and presentation-verifier statements that do not require this implementation to issue a credential pass locally.
- The public manifest is opened only after those runs, and only with the tags listed above.
