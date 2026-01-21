# VC Verifier - AI Knowledge Base Index

## Project Overview

EECC VC Verifier is a full-stack application for verifying W3C Verifiable Credentials (VCs) and Presentations. It consists of two main subprojects: an Express-based TypeScript API and a Vue.js frontend.

**License**: AGPL-3.0  
**Maintainer**: European EPC Competence Center GmbH (EECC)  
**Current Version**: 3.2.1

## Repository Structure

```
vc-verifier/
├── api/              # Backend verification API (TypeScript, Express)
├── frontend/         # Vue.js 3 frontend application
├── CHANGELOG.md      # Root changelog (refers to subprojects)
├── docker-compose.yml # Container orchestration
└── .cursor/          
    ├── rules/        # Cursor AI rules (changelog, notes)
    └── notes/        # This knowledge base
```

## Notes Files

### Core Documentation

- **[repository_structure.md](./repository_structure.md)** - Detailed folder structure and file organization for both API and frontend subprojects

- **[api_architecture.md](./api_architecture.md)** - Backend architecture, services, routing patterns, verification flow, and key modules

- **[frontend_architecture.md](./frontend_architecture.md)** - Vue.js frontend structure, components, state management, routing, and UI patterns

- **[verification_system.md](./verification_system.md)** - Deep dive into how credential verification works: cryptographic suites, status checking, JWT handling, and GS1 integration

- **[development_workflow.md](./development_workflow.md)** - Build processes, testing setup, Docker containerization, and deployment patterns

## Key Technologies

### Backend (API)
- **Runtime**: Node.js with TypeScript (ES2022 modules)
- **Framework**: Express.js 5
- **Verification Libraries**: Digital Bazaar's VC libraries
- **Standards**: W3C VC Data Model, JSON-LD, JWT, DID resolution
- **Testing**: Jest with Supertest

### Frontend
- **Framework**: Vue.js 3 (Composition API & Options API)
- **State**: Vuex 4
- **Routing**: Vue Router 4
- **UI**: Bootstrap 5 with custom SCSS
- **Build**: Vue CLI 5

## Quick Navigation

### Working on API Features
1. Read [api_architecture.md](./api_architecture.md) for service layer understanding
2. Check [verification_system.md](./verification_system.md) for verification logic
3. Update `api/CHANGELOG.md` (note: separate changelog per subproject)

### Working on Frontend Features
1. Read [frontend_architecture.md](./frontend_architecture.md) for component structure
2. Check [repository_structure.md](./repository_structure.md) for file locations
3. Update `frontend/CHANGELOG.md` when making changes

### Adding New Verification Features
1. Study [verification_system.md](./verification_system.md) for existing patterns
2. Understand the document loader caching in `api/src/services/documentLoader/`
3. Add new cryptosuites or proof types in `api/src/services/verifier/index.ts`

### Deployment & Operations
1. Review [development_workflow.md](./development_workflow.md)
2. Check `docker-compose.yml` for service configuration
3. Both subprojects have separate Dockerfiles

## Important Patterns & Conventions

### Changelog Management
- **Each subproject has its own CHANGELOG.md** (see `.cursor/rules/changelog-conventions.mdc`)
- Root `CHANGELOG.md` contains consolidated history
- Always update the relevant subproject's changelog
- WIP section at top for unreleased changes

### Code Organization
- API uses ES2022 modules (`.js` imports in TypeScript)
- Frontend uses standard Vue.js conventions
- Shared types defined in `api/src/types.d.ts`

### Testing
- API: Jest tests in `api/__tests__/`
- Frontend: Unit tests with Jest, E2E with Cypress
- Run tests before committing

## Environment Variables

### API
- `PORT` - API server port (default: 3000)
- `VC_REGISTRY` - Credential registry URL
- `DOCUMENT_CACHE_TTL_HOURS` - Cache TTL for dynamic documents (default: 1)

### Frontend
- `VUE_APP_VERIFIER_API` - Backend API URL
- `VC_REGISTRY` - Credential registry URL
- `OPENID_ENDPOINT` - OpenID endpoint URL

## Reference Links

- [W3C VC Data Model](https://www.w3.org/TR/vc-data-model/)
- [Digital Bazaar VC Libraries](https://github.com/digitalbazaar)
- Production: https://ssi.eecc.de/verifier/
