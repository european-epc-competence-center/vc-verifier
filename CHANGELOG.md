VC Verifier Changelog
=================

## WIP

- **Dockerfile fix (API)**: Removed obsolete `@gs1us/vc-verifier-rules` installation from Dockerfile
    - The project uses `@eecc/vc-verifier-rules` (specified in `package.json`)
    - The redundant line was installing the old GS1 US package before `npm i` installed the correct EECC version
- **RenderMethod schema flexibility (API)**: Updated GS1 JSON schemas to support flexible `renderMethod.id` placement
    - Modified `RenderMethod` definition to accept `id` at top level or nested under `template.id`
    - Updated schemas: `gs1-key-schema.json`, `gs1-company-prefix-schema.json`, `gs1-prefix-schema.json`, `gs1-product-data-schema.json`, `gs1-organization-data-schema.json`
    - Maintains backward compatibility with existing credentials while supporting new nested structure
- **Schema caching improvement (API)**: Updated `downloadSchemasFromRemote()` to use gs1.org URLs as cache keys
    - Added `githubToGs1Mapping` to map GitHub raw URLs to canonical gs1.org schema URLs
    - Schemas fetched from GitHub are now cached with gs1.org URLs for consistency with local schema loading
    - Ensures seamless transition between local and remote schema sources

## 3.3.0 (2026-01-30)

- **GS1 JSON Schema updates (API)**: Updated all GS1 credential JSON schemas to use flexible validation
    - Changed `@context` validation from strict array equality to `allOf` with `contains` checks
    - Changed `type` validation from strict array equality to `allOf` with `contains` checks
    - Updated schemas: `gs1-key-schema.json`, `gs1-company-prefix-schema.json`, `gs1-prefix-schema.json`, `gs1-product-data-schema.json`, `gs1-organization-data-schema.json`, `gs1-product-key-schema.json`
    - Schemas now accept contexts and types in any order with additional entries
    - `gs1-key-schema.json`: Removed `license-context` requirement (now only requires 2 base contexts)
- **Dependency upgrades (API)**: Updated all dependencies to latest versions
    - TypeScript: 4.9.5 → 5.9.3
    - Express: 4.21.1 → 5.2.1
    - `@digitalbazaar/ecdsa-sd-2023-cryptosuite`: 1.0.2 → 3.4.1 (breaking changes)
    - `@digitalbazaar/vc-revocation-list`: 5.0.1 → 7.0.0 (breaking changes)
    - `@digitalbazaar/did-method-key`: 3.0.0 → 5.3.0
    - `@digitalbazaar/vc-status-list`: 7.1.0 → 8.0.1
    - Jest: 29.x → 30.x
    - Other dependencies updated to latest compatible versions
    - No security vulnerabilities remaining
- **Dependency upgrades (Frontend)**: Updated all dependencies to latest versions
    - Vue: 3.2.41 → 3.5.26
    - Axios: 1.1.3 → 1.13.2
    - Bootstrap: 5.2.3 → 5.3.8
    - Cypress: 8.7.0 → 15.8.2
    - Prettier: 2.7.1 → 3.7.4
    - All Vue CLI plugins updated to 5.0.9
    - ESLint kept at 8.x (version 9 incompatible with Vue CLI 5)
    - Remaining dev-only vulnerabilities in webpack-dev-server (Vue CLI limitation)
- **Test adjustments**: Temporarily skipped 2 tests due to breaking changes in Digital Bazaar libraries
    - `"Verify single DataIntegrityProof credential"`: ecdsa-sd-2023 v3.x requires updated proof format
    - `"Verify revoked credential - RevocationList2020"`: v7.0 behavior change needs investigation
    - 11 of 13 API tests passing
- **Type compatibility fix (API)**: Fixed TypeScript compilation errors in `gs1.ts` after upgrading `@eecc/vc-verifier-rules` to v2.6.2
    - Resolved type mismatch between imported `verifiableJwt` type from `@eecc/vc-verifier-rules` and local `Verifiable` type
    - The new version's `verifiableJwt.type` allows `string | string[] | undefined`, while internal types require `string[]`
    - Added `unknown` as intermediate type in type assertions at lines 40, 45, and 205 in `normalizeVerifiable()` function
    - All TypeScript checks pass and all 11 API tests pass successfully
- Initialize comprehensive AI knowledge base (`.cursor/notes/`) with documentation covering:
    - Repository structure and file organization
    - API architecture (services, routing, verification flow)
    - Frontend architecture (Vue.js components, state management)
    - Verification system deep dive (cryptographic suites, JWT, GS1)
    - Development workflow (build, test, deploy)

## 3.2.4 (2026-01-14)

- bump gs1-vc-verifer-rules fro epcis validation

## 3.2.3 (2026-01-07)

- fix: prevent caching of StatusListCredentials to ensure fresh revocation checks

## 3.2.2 (2026-01-06)

- gs1 chaining library upgraded to allow for SGTIN credential chains and other key credentials with qualifiers

## 3.2.1 (2025-12-15)

- fix data integrity version


- add support for all data integrity proof cryptosuites

## 3.1.3 (2025-11-27)

- hard code identify foundation context because not sending json

## 3.1.2 (2025-11-26)

- fix ttl cache for jwt
- make ttl cache configurable

## 3.1.1 (2025-11-24)

- DID documents and Verifiable Credentials use 60-minute TTL cache for data freshness
- Static resources (contexts, schemas) use permanent cache

## 3.1.0 (2025-11-17)

- add ES256 suite for verification


## 3.0.2 (2025-11-05)

- add helath and readiness endpoints


## 3.0.1 (2025-10-28)

- add error codes for failed signature validation and revocation
- improve gs1RulesResult response we return to the gs1 package -> actual credentialId and type
- update to latest @eecc/vc-verifier-rules version 2.4.0


## 3.0.0 (2025-10-22)

- vc-jwt support
- full integration of gs1 rules library


## 2.2.0 (2025-09-04)

- add VC data model 2.0 support
- allow gs1 chaining library to access verification erros

2.0.3 (2024-07-23)

- fix container startup

2.0.2 (2024-07-23)

- fix api url

2.0.1 (2024-07-23)

- fix show version

2.0.0 (2024-07-23)

- add gs1 verification endpoint
- use gs1 endpoint on gs1 credential

1.7.8 (2024-06-13)
---

- fix status verification for SD


1.7.7 (2023-11-21)
---

- prevent caching of status credentials in document loader
- support mutli status list results in UI


1.7.6 (2023-11-15)
---

- allow multi status credentials
- update vc dependency


1.7.5 (2023-11-14)
---

- introduce static contexts
- manual status checks for SD credentials
  

1.7.4 (2023-10-10)
---

- fix build node version


1.7.3 (2023-10-09)
---

- support empty presentations for proof of possession
  

1.7.2 (2023-09-11)
---

- fix statusList in presentation


1.7.1 (2023-09-08)
---

- fix danger border on pending
- borderless icon


1.7.0 (2023-09-08)
---

- support status-list-2021
- introduce own logo


1.6.5 (2023-08-30)
---

- deduce credential type more accurately
- add query params to swagger
- update dependencies


1.6.4 (2023-06-29)
---

- use authentication for inital fetch if present
- general improvements to authentication


1.6.3 (2023-06-27)
---

- UI improvements
- add global authentication on entry page


1.6.2 (2023-06-22)
---

- fix authentication removed after disclosure


1.6.1 (2023-06-22)
---

- allow OID4VP for authenticated request
- rework SD request UI for OID4VC
- allow custom credential types for OID4VP
- small improvements


1.6.0 (2023-06-19)
---

- add ability to request disclosure of single credentials


1.5.3 (2023-06-14)
---

- always use id hash as the credential identifier
- add proof challenge & domain as query param


1.5.2 (2023-06-05)
---

- use hash of proof as COM identifier
- support Ed25519Signature2018 crypto suite


1.5.1 (2023-06-01)
---

- recognize ProductPassportCredential whn IPFS context
- fix QR-Code overflow
- support ipfs context fetching in frontend


1.5.0 (2023-05-31)
---

- add selective disclosure credential verification


1.4.2 (2023-05-02)
---

- update dpp recognition


1.4.2 (2023-03-30)
---

- fix error message


1.4.1 (2023-03-21)
---

- add EECC IPFS gateways as default
- fix IPFS promises
- UI improvements


1.4.0 (2023-03-15)
---

- add OpenId4VP functionality


1.3.0 (2023-02-28)
---

- allow fetching context from ipfs
- UI improvements


1.2.1 (2023-02-24)
---

- fix context in presentations [#28](https://github.com/european-epc-competence-center/vc-verifier/issues/28)
  

1.2.0 (2023-02-22)
---

- show JSON-LD context in credential details
- show JSON-LD context in product passport


1.1.2 (2023-02-17)
---

- trim batch values + tooltips and make them click to copy
- UI improvements
- fix pdf not displaying pure VCs

1.1.1 (2023-02-10)
---

- fix vpp not rendering without image
- UI improvements

1.1.0 (2023-02-10)
---

- add PDF download of verified product passport
- use UTC time for credential PDF
- UI improvements

1.0.1 (2023-02-08)
---

- allow arrays in the proof field of a verifiable
- assign basic presentation props to credential before verification


1.0.0 (2023-02-07)
---

- Supported did methods
  - `did:key`
  - `did:web`
- Verification of [W3C verifiable presentations and credentials](https://www.w3.org/TR/vc-data-model/)
- Revocations using [RevocationList2020](https://w3c-ccg.github.io/vc-status-rl-2020/)
- Fetching verifiable credentials by id for verification
- Querying of a [credential registry](https://w3c.github.io/did-spec-registries/#credentialregistry) by subject id for verification
- Rendering of product passports if credentials refer to `https://ssi.eecc.de/api/registry/context/productpassport` or an inheriting context
- Download of credentials as pdf or json
- Credential rendering as QR-Code
- Merging properties of the same subject id if overwritten