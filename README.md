[![Tests](https://github.com/european-epc-competence-center/vc-verifier/actions/workflows/tests.yml/badge.svg)](https://github.com/european-epc-competence-center/vc-verifier/actions)
[![Build API](https://github.com/european-epc-competence-center/vc-verifier/actions/workflows/build-all.yml/badge.svg)](https://github.com/orgs/european-epc-competence-center/packages?repo_name=vc-verifier)

<div align="center">
  <p>
    <a href="https://ssi.eecc.de/verifier">
      <img src="assets/logo.png" alt="EECC VC Verifier" width="140">
    </a>
  </p>
</div>

# VC Verifier

The [EECC VC Verifier](https://ssi.eecc.de/verifier/) verifies [W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model/) (JSON-LD and JWT formats) and presentations using cryptographic signature verification and revocation checking. The released component is the REST API. A legacy web UI in `frontend/` can still be built locally and is not published.

## Repository Structure

```
vc-verifier/
├── api/          # TypeScript/Express verification API (the release)
│   ├── src/      # Source code
│   ├── __tests__ # Jest tests
│   └── Dockerfile
├── frontend/     # Legacy Vue.js UI, local build only (frontend/README.md)
├── scripts/      # API release script (release.js)
├── package.json  # `npm run release` from the repo root; releases the API only
├── assets/       # Images for README and UI
├── docker-compose.yml
└── .github/workflows/  # CI: tests.yml, build-all.yml (API image and GitHub Release)
```

## Usage

**Deployed instance**: https://ssi.eecc.de/verifier/

**API docs (Swagger)**: https://ssi.eecc.de/api/verifier/swagger/

### Local setup

```bash
docker-compose up    # API image
```

Or run the API for development:

```bash
cd api && npm install && npm run dev      # API on port 3000
```

The legacy UI is not part of `docker-compose`. Build and run it from `frontend/` (see `frontend/README.md`).

Environment variables (see `docker-compose.yml`):
- `VC_REGISTRY` — credential registry URL
- `API_PORT` — host and container port for the API
- `GS1_GLOBAL_DID` — trusted issuer DID for GS1 prefix licences

### Release

Releases follow the API version. On `main`, with notes under `## [Unreleased]` in `CHANGELOG.md`:

```bash
npm run release:patch   # from the repo root; or release:minor / release:major
```

That bumps `api/package.json`, `api/package-lock.json`, and `api/src/swagger.ts`, moves the changelog section to `## X.Y.Z (YYYY-MM-DD)`, commits, tags `vX.Y.Z`, and pushes. The tag workflow publishes the API image and opens the GitHub Release. `npm run release -- patch --skip-git` updates the files and leaves git alone.

## Features

### Credential Selection

Credentials can be submitted for verification in four ways:

1. **Upload** — JSON file(s) containing a credential, presentation, or array of either; or a TXT file with a JWT token
2. **Paste** — paste a JWT token or JSON-LD credential/presentation as plain text (toggle "File Upload" → "Text Input")
3. **Credential ID** — provide a URL that resolves to the credential; the verifier fetches and verifies it
4. **Subject ID** — provide a subject identifier; the verifier queries the credential registry for all associated credentials

Each input field has a QR scanner button to scan credentials from a device camera.

![Credential Selector](assets/select.png)

### Presentation Request (OpenID4VP)

Click the send/arrow button (top right of the selector) to open the Presentation Request page. This generates a QR code encoding an [OpenID4VP](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html) presentation request. A compatible wallet app can scan the QR code and submit a presentation, which is then automatically verified and displayed.

- Select "Any Credential" to accept any credential type, or "Custom Credential" to specify one or more credential types
- The verifier polls for the wallet's response and redirects to the results view once received

![Presentation Request](assets/openid_presentation_request.png)

### Credential Verification

For each credential the verifier:
- Verifies the cryptographic signature using the issuer's public key (resolved via DID)
- Checks revocation/suspension status if a `credentialStatus` field is present
- Displays the result with issuer, validity dates, and credential subject data

Supported proof types: `Ed25519Signature2018`, `Ed25519Signature2020`, `JsonWebSignature2020` (ES256), and `DataIntegrityProof` with `eddsa-rdfc-2022`, `ecdsa-rdfc-2019`, `rsa-rdfc-2025`, `ecdsa-sd-2023` cryptosuites. JWT-format credentials (VC-JWT) are also supported.

Supported status types: `StatusList2021Entry`, `BitstringStatusListEntry`, `RevocationList2020Status`.

![Credential view](assets/credential.png)

### Presentation Verification

Verifying a presentation checks the presentation proof and all contained credentials independently. A successfully verified presentation can contain revoked credentials.

![Presentation view](assets/presentation.png)

### GS1 Trust Ecosystem Verification

The `/api/verifier/gs1` endpoint verifies credentials from the [GS1 Digital License ecosystem](https://www.gs1.org/services/verified-by-gs1) using the [`@eecc/vc-verifier-rules`](https://github.com/european-epc-competence-center/vc-verifier-rules) library, which adds GS1-specific validation on top of standard cryptographic verification:

- **JSON Schema validation** against GS1 credential schemas (key, company prefix, prefix, product data, organization data)
- **Trust chain verification**: the library recursively loads and cryptographically verifies the full chain of chained GS1 credentials (e.g., GS1 prefix licence → company prefix → key credential), using this verifier's own signature checking for each link
- **GS1 business rules**: license delegation rules and credential type constraints

The GS1 verifier first performs full standard verification (signature + status), then runs the GS1 rules. Results include both the standard `results` array and a `gs1Result` object with any rule violations and error codes.

**Example**: [GS1 prefix credential 05](https://ssi.eecc.de/verifier/#/verify?credentialId=https%3A%2F%2Fid.gs1.org%2Fvc%2Flicence%2Fgs1_prefix%2F05)

### Credential Retrieval

Verified credentials can be downloaded as a rendered PDF, raw JSON, or as a QR code image using the buttons at the bottom right of each credential card.

## Examples

- **Verified Product Passport**: https://id.eecc.de/01/04012345999990/10/20210401-A/21/XYZ-1234
- **GS1 Prefix Credential**: https://id.gs1.org/vc/licence/gs1_prefix/05
- **Revoked Credential**: https://ssi.eecc.de/api/registry/vc/0a720a69-34f0-4ed0-b767-a0a5f9212020

## License

Copyright 2022-2026 European EPC Competence Center GmbH (EECC). Corresponding Author: Christian Fries <christian.fries@eecc.de>

Licensed under the [Apache License, Version 2.0](LICENSE).
