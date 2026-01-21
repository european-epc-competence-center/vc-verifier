# API Architecture

## Overview

The API is a TypeScript Express application that provides verification services for W3C Verifiable Credentials and Presentations. It follows a layered architecture with clear separation of concerns.

## Architecture Layers

```
HTTP Request
    ↓
Router Layer (api/src/routers/)
    ↓
Route Handler Layer (api/src/routes/)
    ↓
Service Layer (api/src/services/)
    ↓
External Libraries (Digital Bazaar, etc.)
```

## Entry Point (`index.ts`)

**Location**: `api/src/index.ts`

### Responsibilities
- Initialize Express app
- Configure middleware (CORS, body-parser)
- Mount routers
- Set up Swagger documentation
- Start HTTP server

### Key Middleware
```typescript
app.use(bodyParser.json())           // JSON body parsing
app.use(cors())                      // CORS headers
app.use(bodyParser.urlencoded())     // Form data parsing
```

### Router Mounting
```typescript
app.use('/', healthRouter)                  // Health checks (no /api prefix)
app.use('/api/verifier', verifyRouter)     // Verification endpoints
```

**Note**: Health endpoints have no `/api` prefix for Kubernetes probe compatibility.

## Router Layer

**Pattern**: Thin wrapper around route handlers

### Verify Router (`routers/verify/index.ts`)

Defines HTTP endpoints and delegates to route handlers:

```typescript
verifyRouter.get("/vc/:vcid", fetchAndVerify);        // Fetch and verify by ID
verifyRouter.post("/", verify);                       // Verify array of verifiables
verifyRouter.get("/id/:subjectId", verifySubjectsVCs); // Query by subject
verifyRouter.post("/gs1", verifyGS1);                 // GS1-specific verification
```

Contains extensive JSDoc comments for Swagger API documentation.

### Health Router (`routers/health/index.ts`)

Simple health and readiness endpoints for container orchestration.

## Route Handler Layer

**Pattern**: Class-based handlers with business logic

### VerifyRoutes Class (`routes/verify/index.ts`)

Methods correspond to router endpoints:

#### `fetchAndVerify(req, res)`
- Fetches credential from URL (path param `vcid`)
- Calls `Verifier.verify()`
- Returns verification result

#### `verify(req, res)`
- Accepts array of verifiables in body
- Supports query params: `challenge`, `domain`, `nonce`, `audience`, `aud`
- Verifies all in parallel with `Promise.all()`
- Returns array of verification results

#### `verifySubjectsVCs(req, res)`
- Queries credential registry by subject ID
- Fetches array of credentials
- Verifies each credential
- Returns array of results

#### `verifyGS1(req, res)`
- Similar to `verify()` but uses `GS1Verifier`
- Performs GS1 rules validation in addition to standard verification

## Service Layer

### Core Verifier (`services/verifier/index.ts`)

**Main Class**: `Verifier`

#### `Verifier.verify(input, challenge?, domain?)`

**Flow**:
1. Detect input type (JWT string vs JSON-LD object)
2. If JWT: delegate to `JWTService.verifyJWT()`
3. If JSON-LD: 
   - Extract proof(s)
   - Determine verifiable type (Credential vs Presentation)
   - Get appropriate cryptographic suite(s)
   - Verify signature
   - Check revocation/suspension status

**Supported Proof Types**:
- `Ed25519Signature2018`
- `Ed25519Signature2020`
- `JsonWebSignature2020` (ES256)
- `DataIntegrityProof` with cryptosuites:
  - `eddsa-rdfc-2022`
  - `ecdsa-rdfc-2019`
  - `rsa-rdfc-2025`
  - `ecdsa-sd-2023` (Selective Disclosure)

**Status Check Types**:
- `StatusList2021Entry`
- `RevocationList2020Status`
- `BitstringStatusListEntry`

#### Key Methods

**`getSuite(proof)`**: Returns appropriate cryptographic suite instance
**`getSuites(proof | proof[])`**: Handles single or multiple proofs
**`getCheckStatus(credentialStatus)`**: Returns status checking function
**`isDataIntegrityProof(proof)`**: Determines proof type for routing

### JWT Service (`services/verifier/jwt.ts`)

**Class**: `JWTService`

#### Methods

**`isJWT(input: string): boolean`**
- Regex-based JWT format detection

**`decodeJWT(jwt: string): JWTDecoded | {error}`**
- Decodes header and payload using `jose` library

**`verifyJWT(jwt: string): Promise<JWTDetectionResult>`**
- Extracts issuer, kid, algorithm
- Loads verification method via documentLoader
- Verifies signature with JWK or Ed25519
- Returns standardized result structure

**Verification Methods**:
- `verifyWithJWK()` - Uses JOSE library for JWK-based verification
- `verifyEd25519()` - Direct Ed25519 signature verification with `@noble/curves`

### GS1 Verifier (`services/verifier/gs1.ts`)

**Class**: `GS1Verifier`

Integrates with `@eecc/vc-verifier-rules` package for GS1-specific validation.

#### `GS1Verifier.verify(verifiable, challenge?, domain?)`

**Flow**:
1. Perform standard credential verification (`Verifier.verify()`)
2. Perform GS1 rules validation:
   - Single credential: `checkGS1CredentialWithoutPresentation()`
   - Presentation: `checkGS1CredentialPresentationValidation()`
3. Merge results into unified response

**Error Codes**:
- `VC-100`: Signature verification failed
- `VC-110`: Status verification failed (revoked)
- `GS1-010`: Credential resolution error

**Features**:
- JSON Schema validation (enabled via `fullJsonSchemaValidationOn`)
- External credential loading
- Recursive credential verification

### Document Loader (`services/documentLoader/index.ts`)

**Critical Service**: Handles all remote resource fetching (contexts, DIDs, credentials)

#### Caching Strategy

**Two-tier caching**:
1. **Permanent cache** (`contexts` Map): Static resources (contexts, schemas)
2. **TTL cache** (`TTLCache`): Dynamic resources (DIDs, credentials)
   - Default TTL: 1 hour (configurable via `DOCUMENT_CACHE_TTL_HOURS`)

#### Resolution Flow

```
documentLoader(url)
    ↓
  DID URL? → DID Resolver → Cache → Return
    ↓
  Check permanent cache (contexts)
    ↓
  Check TTL cache
    ↓
  Not cached? → Fetch
    ↓
  IPFS? → fetchIPFS()
  HTTP? → fetch_jsonld_or_jwt()
    ↓
  Cache based on type:
    - VC/DID → TTL cache
    - Context/Schema → Permanent cache
    ↓
  Return document
```

#### DID Resolution

**Supported DID Methods**:
- `did:web` - Web-based DIDs
- `did:key` - Self-contained key DIDs

**Verification Method Handling**:
- Resolves full DID document
- Extracts specific verification method if fragment present (e.g., `did:web:example.com#key-1`)
- Merges context from DID document to verification method

### Fetch Service (`services/fetch/index.ts`)

**Functions**:
- `fetch_json(url)` - Generic JSON fetching
- `fetch_jsonld_or_jwt(url)` - Handles JSON-LD or JWT responses
- `fetchIPFS(url)` - IPFS gateway fetching

### Status Checking (`services/verifier/status.ts`)

**Function**: `checkBitstringStatus()`

Implements BitstringStatusList checking (newer status format).

## Type System

**Global Types** (`types.d.ts`):
- `Verifiable` - Union of Credential | Presentation
- `VerifiableCredential` - W3C VC structure
- `VerifiablePresentation` - W3C VP structure
- `Proof` - Cryptographic proof object
- `CredentialStatus` - Status metadata
- `verifiableJwt` - JWT string type

## Swagger Documentation

**Location**: `swagger.ts` + JSDoc in routers

**Configuration**:
- Swagger UI at `/api/verifier/swagger`
- OpenAPI docs at `/api/docs`
- JSDoc comments in router files generate schema

**Features**:
- Full request/response examples
- Type definitions
- Parameter documentation

## Error Handling Pattern

### Route Handlers
```typescript
try {
  // Business logic
  return res.status(200).json(result);
} catch (error) {
  return res.status(400).send("Error message: " + error);
}
```

### Services
- Throw errors for caller to handle
- Return structured error objects in verification results
- Non-enumerable error properties made enumerable for JSON serialization

## Verification Result Structure

### Credential Verification
```typescript
{
  verified: boolean,
  results: [{
    proof: {...},
    verified: boolean,
    verificationMethod: {...},
    purposeResult: { valid: boolean }
  }],
  statusResult?: {
    verified: boolean,
    error?: any
  },
  error?: Error,
  errors?: any[]
}
```

### Presentation Verification
```typescript
{
  verified: boolean,
  presentationResult: {
    verified: boolean,
    results: [...]
  },
  credentialResults: [
    { verified: boolean, results: [...], credentialId: string }
  ]
}
```

### GS1 Verification
```typescript
{
  verified: boolean,
  gs1Result: {
    verified: boolean,
    credentialId: string,
    credentialName: string,
    errors: [{ code: string, rule: string }]
  },
  statusResult?: {...},
  results?: [...]
}
```

## Configuration

### Environment Variables
- `PORT` - Server port (default: 3000)
- `VC_REGISTRY` - Credential registry URL (default: https://ssi.eecc.de/api/registry/vcs/)
- `DOCUMENT_CACHE_TTL_HOURS` - Document cache TTL (default: 1)

### Dependencies

**Core Libraries**:
- `express` - Web framework
- `@digitalbazaar/vc` - VC verification
- `@digitalbazaar/ed25519-signature-2020` - Ed25519 suite
- `@eecc/es256-signature-2020` - ES256 suite (EECC custom)
- `jose` - JWT handling
- `did-resolver` + `web-did-resolver` - DID resolution
- `jsonld` - JSON-LD processing (forked version with cache fix)

**GS1 Integration**:
- `@eecc/vc-verifier-rules` - GS1 rules validation

## Performance Considerations

### Parallel Verification
All array-based verification endpoints use `Promise.all()` for parallel processing.

### Caching Strategy
- Static contexts: Never expire (Map)
- Dynamic resources: 1-hour TTL (configurable)
- No caching for status credentials (always fresh check)

### Module Loading
- ES2022 modules enable tree-shaking
- Top-level await for schema preloading in GS1 module

## Testing Strategy

**Location**: `api/__tests__/`

**Test Types**:
- Unit tests for verification logic
- Integration tests with actual credentials
- JWT verification tests
- GS1 rules tests

**Framework**: Jest with Supertest for HTTP testing

## Security Considerations

### CORS
Enabled for all origins (public API).

### Input Validation
- Body parsing limits via body-parser
- Type checking via TypeScript
- Schema validation for GS1 credentials

### DID Resolution
- Only supports `did:web` and `did:key`
- HTTPS enforced for `did:web`

### Status Checking
- Always verifies status list credentials
- Supports revocation and suspension
