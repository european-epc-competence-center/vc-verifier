# VC Verifier - AI Knowledge Base Index

## Project Overview

EECC VC Verifier verifies W3C Verifiable Credentials (VCs) and Presentations. The released product is the Express TypeScript API. The Vue.js app in `frontend/` is a legacy UI that can be built locally and is not published.

**License**: Apache-2.0  
**Maintainer**: European EPC Competence Center GmbH (EECC)  
**Versions**: Releases follow `api/package.json` (also `api/src/swagger.ts` and `api/package-lock.json`). `scripts/release.js` bumps those files, rewrites the root changelog, and tags `vX.Y.Z`. Run `npm run release` from the repo root. The root `package.json` is private and only exposes those scripts. The API package has no release script.

## Repository Structure

```
vc-verifier/
├── api/              # Backend verification API (TypeScript, Express)
├── frontend/         # Legacy Vue.js UI (local build only; not in CI)
├── scripts/          # API release script
├── package.json      # Private; `npm run release` calls scripts/release.js
├── CHANGELOG.md      # The single changelog for the whole repo
├── docs/vcalm-api.md # VCALM verifier API contract for `/api/vcalm`
├── docker-compose.yml # Container orchestration
└── .cursor/          
    ├── rules/        # Cursor AI rules (changelog, notes)
    └── notes/        # This knowledge base
```

## Notes Files

### Core Documentation

- **[repository_structure.md](./repository_structure.md)** - Detailed folder structure and file organization for both API and frontend subprojects

- **[api_architecture.md](./api_architecture.md)** - Backend architecture, services, routing patterns, verification flow, and key modules

- **[frontend_architecture.md](./frontend_architecture.md)** - Legacy Vue.js UI: components, state, routing. Local build only (`frontend/README.md`)

- **[verification_system.md](./verification_system.md)** - Deep dive into how credential verification works: cryptographic suites, status checking, JWT handling, and GS1 integration

- **[development_workflow.md](./development_workflow.md)** - Build, test, Docker, and the API release script (`npm run release` from the repo root; tag `vX.Y.Z` publishes the API image and opens the GitHub Release)

- **[vcalm-api.md](../../docs/vcalm-api.md)** - Contract for the VCALM verifier at `/api/vcalm`. HTTP 200 only when `verified` is true. Proof checks stay in `verify`; VCALM code is `services/vcalm`, `routes/vcalm`, and `routers/vcalm`

## Key Technologies

### Backend (API)
- **Runtime**: Node.js with TypeScript 5.x (ES2022 modules)
- **Framework**: Express.js 5
- **Verification Libraries**: Digital Bazaar's VC libraries
- **Standards**: W3C VC Data Model v1.1 & v2.0, JSON-LD, JWT (VC-JWT), DID resolution
- **Testing**: Jest with Supertest

### Frontend
- **Framework**: Vue.js 3.5 (Composition API & Options API)
- **State**: Vuex 4
- **Routing**: Vue Router 4
- **UI**: Bootstrap 5.3 with custom SCSS
- **Build**: Vue CLI 5 (ESLint kept at 8.x — v9 incompatible with Vue CLI 5)

## Quick Navigation

### Working on API Features
1. Read [api_architecture.md](./api_architecture.md) for service layer understanding
2. Check [verification_system.md](./verification_system.md) for verification logic
3. Update the root `CHANGELOG.md` (`[Unreleased]` section)

### Working on Frontend Features
1. Read [frontend_architecture.md](./frontend_architecture.md) for component structure
2. Check [repository_structure.md](./repository_structure.md) for file locations
3. Update the root `CHANGELOG.md` when making changes

### Adding New Verification Features
1. Study [verification_system.md](./verification_system.md) for existing patterns
2. Understand the document loader caching in `api/src/services/documentLoader/`
3. Add new cryptosuites or proof types in `api/src/services/verifier/index.ts`

### Deployment & Operations
1. Review [development_workflow.md](./development_workflow.md)
2. Check `docker-compose.yml` for service configuration
3. The API image is published by CI. The frontend Dockerfile remains for a local image build

## Important Patterns & Conventions

### Changelog Management
- One root `CHANGELOG.md` (see `.cursor/rules/changelog-conventions.mdc`). Releases follow the API version
- `[Unreleased]` section at the top for unreleased changes; it becomes the release notes body

### Code Organization
- API uses ES2022 modules (`.js` imports in TypeScript)
- Frontend uses standard Vue.js conventions
- Shared types defined in `api/src/types.d.ts`

### Testing
- API: Jest tests in `api/__tests__/` — 2 skipped (DataIntegrityProof / RevocationList2020, see [development_workflow.md](./development_workflow.md)). `vcalm-conformance.test.ts` covers the canivc verifier conformance rows that do not need an issuer. Publishing a canivc column is the suite workflow plus an implementations-repo manifest; see [vcalm-api.md](../../docs/vcalm-api.md)
- Frontend: Unit tests with Jest, E2E with Cypress
- Run tests before committing

## Environment Variables

### API
- `PORT` - API server port (default: 3000)
- `VC_REGISTRY` - Credential registry URL
- `DOCUMENT_CACHE_TTL_HOURS` - Max age of cached remote documents served as outage fallback (default: 1)
- `GS1_GLOBAL_DID` - Trusted issuer DID for `GS1PrefixLicenseCredential` root of trust (default: `did:web:id.gs1.org`; required for non-production GS1 chains)
- `GS1_ALLOW_DID_WEBVH_TWIN` - When not `false`, `@eecc/vc-verifier-rules` accepts a `did:webvh` issuer where its twin `did:web` is expected (GS1 Global root check stays exact)

### Frontend
- `VUE_APP_VERIFIER_API` - Backend API URL
- `VC_REGISTRY` - Credential registry URL
- `OPENID_ENDPOINT` - OpenID endpoint URL

## Reference Links

- [W3C VC Data Model](https://www.w3.org/TR/vc-data-model/)
- [Digital Bazaar VC Libraries](https://github.com/digitalbazaar)
- Production: https://ssi.eecc.de/verifier/
