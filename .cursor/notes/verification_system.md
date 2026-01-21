# Verification System Deep Dive

## Overview

The verification system is the core functionality of the VC Verifier. It supports multiple credential formats (JSON-LD, JWT), various cryptographic suites, and different status checking mechanisms.

## Supported Standards

### W3C Verifiable Credentials
- **V1.1**: JSON-LD format with Linked Data Proofs
- **V2.0**: Data Integrity Proofs, JWT format (vc-jwt)
- **Presentations**: Both embedded and standalone

### Cryptographic Suites

#### JSON-LD Signature Suites

**Ed25519Signature2018**
- Library: `@digitalbazaar/ed25519-signature-2018`
- Key type: Ed25519VerificationKey2018
- Use: Legacy suite, still supported

**Ed25519Signature2020**
- Library: `@digitalbazaar/ed25519-signature-2020`
- Key type: Ed25519VerificationKey2020
- Use: Current Ed25519 standard

**JsonWebSignature2020** (ES256)
- Library: `@eecc/es256-signature-2020` (EECC custom)
- Key type: JsonWebKey with ES256
- Use: ECDSA P-256 signatures

#### Data Integrity Cryptosuites

**eddsa-rdfc-2022**
- Library: `@digitalbazaar/eddsa-rdfc-2022-cryptosuite`
- Proof type: DataIntegrityProof
- Canonicalization: RDFC-1.0
- Use: Modern EdDSA with RDFC

**ecdsa-rdfc-2019**
- Library: `@digitalbazaar/ecdsa-rdfc-2019-cryptosuite`
- Proof type: DataIntegrityProof
- Use: ECDSA with RDFC

**rsa-rdfc-2025**
- Library: `@eecc/rsa-rdfc-2025-cryptosuite` (EECC custom)
- Proof type: DataIntegrityProof
- Use: RSA signatures with RDFC

**ecdsa-sd-2023** (Selective Disclosure)
- Library: `@digitalbazaar/ecdsa-sd-2023-cryptosuite`
- Proof type: DataIntegrityProof
- Use: ECDSA with selective disclosure
- Special: Uses verify cryptosuite (`createVerifyCryptosuite()`)

### JWT Support

**VC-JWT** (JSON Web Token format)
- Library: `jose` + `@noble/curves`
- Algorithms: EdDSA, Ed25519, ES256, ES384, ES512
- Key formats: JWK, Ed25519VerificationKey2020

## Verification Flow

### Main Verification Entry Point

**Method**: `Verifier.verify(input, challenge?, domain?)`

**Input Types**:
1. **String**: Assumed JWT, validated and parsed
2. **Object**: JSON-LD Verifiable (Credential or Presentation)

### Verification Path Selection

```
Verifier.verify(input)
    ↓
  Is string?
    Yes → verifyJWTInput()
    No → verifyObjectInput()
        ↓
      Is VerifiableCredential?
        Yes → verifyCredential()
      Is VerifiablePresentation?
        Yes → verifyPresentation()
```

## JSON-LD Verification (Linked Data Proofs)

### Credential Verification Flow

**Method**: `Verifier.verifyCredential(credential, suite)`

**Steps**:
1. Extract proof(s) from credential
2. Get appropriate cryptographic suite(s) via `getSuites()`
3. Determine if DataIntegrityProof or legacy suite
4. **If DataIntegrityProof**:
   - Use `jsonld-signatures.verify()`
   - Manual status check (not yet in jsigs)
5. **If legacy suite**:
   - Use `@digitalbazaar/vc.verifyCredential()`
   - Built-in status check
6. Normalize result (make errors enumerable)
7. Return verification result

### Presentation Verification Flow

**Method**: `Verifier.verifyPresentation(presentation, suite, options)`

**Steps**:
1. Extract challenge and domain (from options or proof)
2. Get status check function for contained credentials
3. Determine if DataIntegrityProof or legacy suite
4. **If DataIntegrityProof**:
   - Use `jsonld-signatures.verify()` with `AuthenticationProofPurpose`
   - Includes status checking
5. **If legacy suite**:
   - Use `@digitalbazaar/vc.verify()`
   - Verifies presentation AND all contained credentials
6. Return comprehensive result with:
   - Presentation verification result
   - Individual credential verification results

### Suite Selection Logic

**Function**: `getSuite(proof: Proof): unknown`

**Logic**:
```typescript
switch (proof.type) {
  case 'Ed25519Signature2018':
    return new Ed25519Signature2018();
  
  case 'Ed25519Signature2020':
    return new Ed25519Signature2020();
  
  case 'JsonWebSignature2020':
    return new ES256Signature2020();
  
  case 'DataIntegrityProof':
    return new DataIntegrityProof({
      cryptosuite: getDataIntegritySuite(proof.cryptosuite)
    });
}
```

**Multiple Proofs**: Handled via `getSuites()` which calls `getSuite()` for each proof

## JWT Verification (VC-JWT)

### Detection

**Method**: `JWTService.isJWT(input: string): boolean`

**Pattern**: `/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/`

### Decoding

**Method**: `JWTService.decodeJWT(jwt: string)`

**Process**:
- Uses `jose.decodeJwt()` for payload
- Uses `jose.decodeProtectedHeader()` for header
- Returns `{ header, payload }` or error

### Verification

**Method**: `JWTService.verifyJWT(jwt: string)`

**Flow**:
1. Decode JWT
2. Extract parameters:
   - `issuer` from `iss` or `issuer.id`
   - `kid` from header
   - `alg` from header
3. Load verification method:
   - Construct URL: `issuer#kid` or just `kid` if absolute
   - Use documentLoader to fetch
4. Verify signature based on key type:
   - **JsonWebKey**: Use `jose.jwtVerify()` with imported JWK
   - **Ed25519VerificationKey**: Direct Ed25519 verification with `@noble/curves`
5. Check credential status (if present)
6. Return standardized result

### Ed25519 JWT Verification

**Manual verification** (not using JOSE):
- Extract signing input (`header.payload`)
- Extract signature (base64url decoded)
- Extract public key bytes from verification method
- Verify with `ed25519.verify(signature, signingInput, publicKey)`

**Supported Key Formats**:
- `publicKeyMultibase`
- `publicKeyBase58`
- `publicKeyJwk`

## Status Checking

### Status Types

**RevocationList2020Status**
- Library: `@digitalbazaar/vc-revocation-list`
- Function: `checkStatus2020`
- Format: Bitstring in credential

**StatusList2021Entry**
- Library: `@digitalbazaar/vc-status-list`
- Function: `checkStatus2021`
- Format: StatusList credential
- Purposes: revocation, suspension

**BitstringStatusListEntry**
- Custom implementation: `checkBitstringStatus()` in `status.ts`
- Format: Newer bitstring format

### Status Check Flow

**Function**: `getCheckStatus(credentialStatus)`

**Logic**:
1. Extract status type(s) from `credentialStatus`
2. Map to appropriate checking function
3. Return checking function (or throw if unsupported)

**Status Check Execution**:
```typescript
await checkStatus({
  credential,
  documentLoader,
  suite,
  verifyStatusListCredential: true,  // Always verify status list
  verifyMatchingIssuers: false       // Don't require issuer match
})
```

### Status in Presentations

**Special Handling**: 
- Extract status from all contained credentials
- Verify all have same status type
- Single status check for all

**Function**: `getPresentationStatus(presentation)`

### Status Caching

**Important**: Status credentials are **never cached** in documentLoader
- Ensures fresh revocation/suspension checks
- Prevents stale status information

## GS1 Integration

### GS1 Verifier

**Class**: `GS1Verifier` in `services/verifier/gs1.ts`

**Purpose**: Add GS1-specific validation rules on top of standard verification

### Verification Flow

**Method**: `GS1Verifier.verify(verifiable, challenge?, domain?)`

**Steps**:
1. Standard verification via `Verifier.verify()`
2. GS1 rules validation:
   - **Credential**: `checkGS1CredentialWithoutPresentation()`
   - **Presentation**: `checkGS1CredentialPresentationValidation()`
3. Merge results into unified response

### GS1 Rules Integration

**Package**: `@eecc/vc-verifier-rules`

**Configuration**:
```typescript
const gs1ValidatorRequest = {
  fullJsonSchemaValidationOn: true,
  gs1DocumentResolver: {
    externalCredentialLoader: loadExternalCredential,
    externalCredentialVerification: validateExternalCredential,
    externalJsonSchemaLoader: getJsonSchema
  }
}
```

**Type Compatibility Note** (v2.6.2+):
- The `@eecc/vc-verifier-rules` package defines types (`VerifiableCredential`, `verifiableJwt`) that differ slightly from internal types
- Key difference: GS1 types allow `type: string | string[] | undefined`, while internal types require `type: string[]`
- Solution: Use `normalizeVerifiable()` function in `gs1.ts` to convert GS1 types to internal types
- Type assertions use `unknown` as intermediate type for safe type conversion
- Always normalize GS1 types before passing to `Verifier.verify()`

### External Credential Verification

**Function**: `validateExternalCredential(credential, challenge?, domain?)`

**Process**:
1. Verify credential via `Verifier.verify()`
2. Check signature validity
3. Check status validity
4. Map to GS1 error codes:
   - `VC-100`: Signature failed
   - `VC-110`: Status failed (revoked)
5. Return GS1-formatted result

### JSON Schema Validation

**Schemas**: Located in `api/src/services/verifier/schemas/`

**Types**:
- `gs1-company-prefix-schema.json`
- `gs1-key-schema.json`
- `gs1-organization-data-schema.json`
- `gs1-prefix-schema.json`
- `gs1-product-data-schema.json`
- `gs1-product-key-schema.json`

**Loading**: Schemas are downloaded and cached on module initialization

**Function**: `getJsonSchema(schemaUrl)` - Returns cached schema or throws

### GS1 Credential Chaining

**Feature**: Recursive credential loading and verification

**Process**:
1. Credential A references Credential B (by URL)
2. GS1 verifier loads Credential B via `loadExternalCredential()`
3. Verifies Credential B via `validateExternalCredential()`
4. Validates chaining rules (e.g., GS1 prefix delegation)
5. Returns aggregated validation result

## Document Loading

### documentLoader Function

**Core Service**: Central to all verification

**Responsibilities**:
- Resolve DID documents
- Fetch JSON-LD contexts
- Load credentials by URL
- Cache appropriately

### Caching Strategy

**Two-tier approach**:

**1. Permanent Cache** (Map)
- Static contexts
- JSON schemas
- Never expires
- Preloaded contexts

**2. TTL Cache** (class-based)
- DID documents (default: 1 hour)
- Verifiable credentials (default: 1 hour)
- Configurable via `DOCUMENT_CACHE_TTL_HOURS`

**Status Credentials Exception**: Never cached (always fresh)

### DID Resolution

**Supported Methods**:
- `did:web` - via `web-did-resolver`
- `did:key` - via `@digitalbazaar/did-method-key`

**Resolution Process**:
1. Check cache
2. Resolve via appropriate resolver
3. Cache result
4. Return DID document

**Verification Method Extraction**:
- If URL has fragment (e.g., `did:web:example.com#key-1`)
- Extract specific verification method
- Inherit context from parent DID document

### IPFS Support

**Function**: `fetchIPFS(url)`

**Process**:
- Parse IPFS URL (`ipfs://...`)
- Try EECC gateways
- Fall back to public gateways
- Return JSON document

## Error Handling

### Verification Errors

**Structure**:
```typescript
{
  verified: false,
  error: Error,
  errors: [
    { message, ... }
  ]
}
```

**Error Normalization**: Non-enumerable error properties made enumerable for JSON serialization

### Status Check Errors

**Structure**:
```typescript
{
  statusResult: {
    verified: false,
    error: { message, ... }
  }
}
```

### GS1 Errors

**Structured Error Codes**:
```typescript
{
  gs1Result: {
    verified: false,
    errors: [
      { code: "VC-100", rule: "Signature verification failed" },
      { code: "VC-110", rule: "Credential revoked" }
    ]
  }
}
```

## Performance Optimizations

### Parallel Verification
- Array of credentials verified in parallel via `Promise.all()`
- Each credential's verification is independent

### Caching
- Reduces redundant fetches
- Separate TTL for dynamic vs static resources
- Cache key is the URL

### Suite Instantiation
- Suite instances created once per verification
- Reused across multiple proof checks if multiple proofs

## Security Considerations

### Signature Verification
- All signatures verified with well-established libraries
- No custom cryptography implementations (except wrapper code)

### Status Checking
- Always verify status list credential itself
- Prevent forged status lists
- Fresh checks (no caching of status credentials)

### DID Resolution Security
- `did:web` enforces HTTPS
- `did:key` is self-contained (no network fetch)
- Malicious DID documents can't execute code

### Input Validation
- JWT format validated before parsing
- Proof type validated before suite selection
- Unknown proof types rejected with clear error

### Presentation Challenges
- Support for challenge/nonce in presentation proofs
- Prevents replay attacks
- Domain/audience validation

## Testing Strategy

### Unit Tests
- Individual suite verification
- JWT parsing and verification
- Status checking
- Suite selection logic

### Integration Tests
- Full verification flows
- Real credentials from test registry
- Revocation checking
- GS1 validation

### Test Credentials
- Located in test files
- Cover all proof types
- Include revoked credentials
- Include presentations

## Future Extensibility

### Adding New Cryptosuites

**Steps**:
1. Install cryptosuite library
2. Import in `services/verifier/index.ts`
3. Add case in `getDataIntegritySuite()` switch
4. Add tests

### Adding New Status Types

**Steps**:
1. Implement check function (or import library)
2. Add case in `getCheckStatus()` switch
3. Add constant in `STATUS_TYPES`
4. Add tests

### Adding DID Methods

**Steps**:
1. Install resolver library
2. Register in `didresolver.ts`
3. Test resolution
4. Document supported features
