import { Router } from "express";
import { VerifyRoutes } from "../../routes/index.js";

const verifyRoutes = new VerifyRoutes();
const { fetchAndVerify, verify, verifySubjectsVCs, verifyGS1 } = verifyRoutes;

export const verifyRouter = Router();

/**
 * @tags Verify - Cryptographic verification of W3C Verifiable Credentials and Presentations (JSON-LD and VC-JWT)
 */

/**
 * A Verifiable Credential or Presentation encoded as a compact JWT string
 * @typedef {string} JwtVerifiable
 */

/**
 * Plain-text error response body
 * @typedef {string} ErrorResponse
 */

/**
 * API model of a credentialSubject
 * @summary The subject of a credential claim
 * @typedef {object} CredentialSubject
 * @property {string} id.required - Identifier of the identity the credential refers to (typically a DID)
 */

/**
 * API model of a signed credential
 * @summary W3C Verifiable Credential (JSON-LD)
 * @typedef {object} SignedCredential
 * @property {array<string>} context.required - JSON-LD `@context` URIs
 * @property {string} id - Credential IRI
 * @property {array<string>} type.required - Credential types (must include `VerifiableCredential`)
 * @property {string} issuer.required - Issuer DID or object with `id`
 * @property {string} issuanceDate.required - Issuance timestamp (ISO 8601, e.g. `2022-09-26T09:01:07.437Z`)
 * @property {string} expirationDate - Optional expiration timestamp (ISO 8601)
 * @property {CredentialSubject} credentialSubject.required - Claims about the subject
 * @property {object} proof.required - Linked-data proof or Data Integrity proof over the credential
 */

/**
 * API model of a signed presentation
 * @summary W3C Verifiable Presentation (JSON-LD)
 * @typedef {object} SignedPresentation
 * @property {array<string>} context.required - JSON-LD `@context` URIs
 * @property {array<string>} type.required - Must include `VerifiablePresentation`
 * @property {string} holder - Presenter DID (or object with `id`)
 * @property {array<SignedCredential>} verifiableCredential - Credentials included in the presentation
 * @property {object} proof.required - Authentication proof over the presentation (holder signature)
 */

/**
 * API model of a verifiable — either a credential or a presentation (JSON-LD)
 * @summary W3C Verifiable Credential or Verifiable Presentation
 * @typedef {object} Verifiable
 * @property {array<string>} context.required - JSON-LD `@context` URIs
 * @property {array<string>} type.required - Types of the verifiable
 * @property {object} proof.required - Cryptographic proof (credentials: assertion; presentations: authentication)
 */

/**
 * Verifier response object
 * @summary Verification outcome for a credential or presentation
 * @typedef {object} VerifierResponse
 * @property {boolean} verified.required - `true` when all applicable proofs and status checks passed
 * @property {array<object>} results - Proof-level results for standalone credentials
 * @property {array<object>} credentialResults - Per-credential results when verifying a presentation
 * @property {object} presentationResult - Presentation proof result (presentations only)
 */

/**
 * GS1 validation rule error from `@eecc/vc-verifier-rules`
 * @summary Single GS1 business-rule violation
 * @typedef {object} GS1CredentialValidationRule
 * @property {string} code.required - Machine-readable rule code (e.g. `GS1-200`, `VC-100`, `VC-110`)
 * @property {string} rule.required - Human-readable description of the failed rule
 */

/**
 * GS1 rules validation result for a single credential (and optional resolved chain credential)
 * @summary Result from `@eecc/vc-verifier-rules` for one credential
 * @typedef {object} GS1RulesResult
 * @property {string} credentialId.required - Id of the validated credential
 * @property {string} credentialName.required - GS1 credential type name (e.g. `GS1PrefixLicenseCredential`, `ProductDataCredential`)
 * @property {boolean} verified.required - `true` when all GS1 JSON Schema and business rules passed for this credential
 * @property {array<GS1CredentialValidationRule>} errors.required - Failed rules; empty array when `verified` is `true`
 * @property {SignedCredential} credential - Decoded credential payload, when available
 * @property {GS1RulesResult} resolvedCredential - Nested result for an externally resolved credential in the GS1 licence chain (e.g. prefix licence backing an extended licence)
 */

/**
 * GS1 rules validation result for a presentation
 * @summary Aggregated GS1 validation for all credentials in a presentation
 * @typedef {object} GS1RulesResultContainer
 * @property {boolean} verified.required - `true` only when every entry in `result` passed GS1 validation
 * @property {array<GS1RulesResult>} result.required - One `GS1RulesResult` per credential in the presentation; resolved chain credentials may appear as additional entries
 */

/**
 * Combined W3C cryptographic and GS1 business-rule verification response
 * @summary Response item from `POST /api/verifier/gs1`
 * @typedef {object} GS1VerificationResponse
 * @property {boolean} verified.required - `true` when both W3C verification (`results` / `statusResult`) and GS1 rules (`gs1Result`) passed
 * @property {GS1RulesResult|GS1RulesResultContainer} gs1Result.required - GS1 rules outcome: a single credential returns `GS1RulesResult`; a presentation returns `GS1RulesResultContainer`
 * @property {array<object>} results - W3C proof verification results (same structure as `POST /api/verifier`)
 * @property {object} statusResult - Revocation/suspension status check result
 * @property {string} errorMessage - Top-level processing error when verification could not complete
 */

/**
 * GET /api/verifier/vc/{vcid}
 * @summary Fetch and verify a credential by URL
 * @description Fetches a Verifiable Credential from the URL in `vcid`, then verifies issuer signature, DID resolution, and credential status (revocation/suspension). The path parameter must be the full credential URL; URL-encode it when it contains reserved characters.
 * @tags Verify
 * @operationId fetchAndVerifyCredential
 * @param {string} vcid.path.required - Full URL of the Verifiable Credential to fetch and verify
 * @return {VerifierResponse} 200 - Verification result - application/json
 * @return {ErrorResponse} 404 - Credential not found at the given URL - text/plain
 * @return {ErrorResponse} 400 - Verification failed or request invalid - text/plain
 * @example response - 200 - credentials verified
  {
    "verified": true,
    "results": [
      {
        "proof": {
          "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://ssi.eecc.de/api/registry/context/productpassport/eeccproduct",
            "https://w3id.org/security/suites/ed25519-2020/v1"
          ],
          "type": "Ed25519Signature2020",
          "created": "2022-11-03T14:18:36Z",
          "proofPurpose": "assertionMethod",
          "verificationMethod": "did:web:ssi.eecc.de#products",
          "proofValue": "z3uJvNNEkTKzPBHdRiCB8u4oa2hK7CLfbFWkdMdcMNxQfEnE2Jhmjd1evwCoWFv3kB1BL4peFYHqjwknzYozfLZVu"
        },
        "verified": true,
        "verificationMethod": {
          "id": "did:web:ssi.eecc.de#products",
          "type": "Ed25519VerificationKey2020",
          "controller": "did:web:ssi.eecc.de",
          "publicKeyMultibase": "z6Mkiaw6Uva4gJnZizeFLyxhMfy6V6eWzCm6pwNCzvSQhHy6",
          "@context": [
            "https://www.w3.org/ns/did/v1",
            "https://w3id.org/security/suites/ed25519-2020/v1",
            "https://w3id.org/security/suites/x25519-2020/v1"
          ]
        },
        "purposeResult": {
          "valid": true
        }
      }
    ]
  }
 */
verifyRouter.get("/vc/:vcid", fetchAndVerify);

/**
 * POST /api/verifier
 * @summary Verify one or more credentials or presentations
 * @description Primary verification endpoint. Send a JSON array of verifiables as JSON-LD objects or compact JWT strings. For presentations, verifies the holder proof and each enclosed credential. Query aliases: `nonce` → `challenge`, `audience` / `aud` → `domain`.
 * @tags Verify
 * @operationId verifyVerifiables
 * @param {array<Verifiable|JwtVerifiable>} request.body.required - Credentials, presentations, or JWT strings to verify - application/json
 * @param {string} challenge.query - Presentation challenge/nonce; injected into the proof when absent
 * @param {string} nonce.query - Alias for `challenge` (JWT/OIDC convention)
 * @param {string} domain.query - Expected presentation domain/audience; skipped when omitted
 * @param {string} audience.query - Alias for `domain`
 * @param {string} aud.query - Alias for `domain` (JWT convention)
 * @param {boolean} holderBinding.query - When `true` (default), require presentation holder to match credential subjects and JWT holder claims to match the signing key
 * @return {array<VerifierResponse>} 200 - One result per input verifiable - application/json
 * @return {ErrorResponse} 400 - Invalid request body or query parameters - text/plain
 * 
 * @example request - Credential request
[
  {
    "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://ref.gs1.org/gs1/vc/licence-context/",
        "https://ssi.eecc.de/api/registry/context",
        "https://w3id.org/vc/status-list/2021/v1",
        "https://w3id.org/security/suites/ed25519-2020/v1"
    ],
    "id": "https://ssi.eecc.de/api/registry/vc/8ee256f6-9374-4dd4-afc3-8916f4a29573",
    "type": [
        "VerifiableCredential",
        "GS1PrefixLicenceCredential"
    ],
    "issuer": {
        "id": "did:web:ssi.eecc.de",
        "image": "https://id.eecc.de/assets/img/logo_big.png",
        "name": "EECC"
    },
    "issuanceDate": "2023-11-22T13:20:58Z",
    "credentialStatus": [
        {
            "id": "https://ssi.eecc.de/api/registry/vc/revocation/did:web:ssi.eecc.de/1#12",
            "type": "StatusList2021Entry",
            "statusPurpose": "revocation",
            "statusListIndex": "12",
            "statusListCredential": "https://ssi.eecc.de/api/registry/vc/revocation/did:web:ssi.eecc.de/1"
        },
        {
            "id": "https://ssi.eecc.de/api/registry/vc/suspension/did:web:ssi.eecc.de/1#5",
            "type": "StatusList2021Entry",
            "statusPurpose": "suspension",
            "statusListIndex": "5",
            "statusListCredential": "https://ssi.eecc.de/api/registry/vc/suspension/did:web:ssi.eecc.de/1"
        }
    ],
    "credentialSubject": {
        "id": "did:web:eecc.de",
        "licenceValue": "040471110",
        "alternativeLicenceValue": "040471110",
        "organizationName": "European EPC Competence Center",
        "partyGLN": "40471110"
    },
    "proof": {
        "type": "Ed25519Signature2020",
        "created": "2023-11-22T13:20:58Z",
        "proofPurpose": "assertionMethod",
        "verificationMethod": "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
        "proofValue": "z3MmgAE6NWZMXdrk3ncbuBmxWNxNS3ZWF8samxd5mzAiqrR4Ru1TcxB92dQhC9GmgFd1d5Lz2dHM2WoVwoMBxehTF"
    }
}
]
 * @example request - Presentation request
[
  {
    "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://ssi.eecc.de/api/registry/context",
        "https://w3id.org/security/suites/ed25519-2020/v1"
    ],
    "type": [
        "VerifiablePresentation"
    ],
    "verifiableCredential": [
        {
            "@context": [
                "https://www.w3.org/2018/credentials/v1",
                "https://ssi.eecc.de/api/registry/context/productpassport",
                "https://w3id.org/security/suites/ed25519-2020/v1"
            ],
            "id": "https://ssi.eecc.de/api/registry/vc/cf43356c-a9f3-418a-a3ff-baca5a14d668",
            "type": [
                "VerifiableCredential",
                "ProductPassportCredential"
            ],
            "issuer": {
                "id": "did:web:ssi.eecc.de",
                "image": "https://id.eecc.de/assets/img/logo_big.png",
                "name": "EECC"
            },
            "issuanceDate": "2023-01-25T16:01:26Z",
            "credentialSubject": {
                "id": "https://id.eecc.de/01/04012345999990/10/20210401-A/21/XYZ-1234",
                "digital_link": "https://id.eecc.de/01/04012345999990/10/20210401-A/21/XYZ-1234"
            },
            "proof": {
                "type": "Ed25519Signature2020",
                "created": "2023-01-25T16:01:26Z",
                "proofPurpose": "assertionMethod",
                "verificationMethod": "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
                "proofValue": "z5YUnCUVWgAwc1iTQ61jtUyjBNLZELGMxnbsekFDQLd4ZNbPo45we4xxZjV5pqb3jqPo7ryKMmMY9dySNERz1huLJ"
            }
        },
        {
            "@context": [
                "https://www.w3.org/2018/credentials/v1",
                "https://ssi.eecc.de/api/registry/context/productpassport",
                "https://w3id.org/security/suites/ed25519-2020/v1"
            ],
            "id": "https://ssi.eecc.de/api/registry/vc/03bb6e67-ecf3-4b71-99bd-fc4c7c37b8ce",
            "type": [
                "VerifiableCredential",
                "ProductPassportCredential"
            ],
            "issuer": {
                "id": "did:web:ssi.eecc.de",
                "image": "https://id.eecc.de/assets/img/logo_big.png",
                "name": "EECC"
            },
            "issuanceDate": "2023-01-25T16:01:01Z",
            "credentialSubject": {
                "id": "https://id.eecc.de/01/04012345999990/10/20210401-A",
                "country_of_origin": "Germany",
                "digital_link": "https://id.eecc.de/01/04012345999990/10/20210401-A",
                "production_date": "2021-04-01"
            },
            "proof": {
                "type": "Ed25519Signature2020",
                "created": "2023-01-25T16:01:01Z",
                "proofPurpose": "assertionMethod",
                "verificationMethod": "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
                "proofValue": "z5AUbYQjMaK27aLWUibQWGLXUNeP1dgEHHdCFGm13GvEwa3sV2BxtDjwSyJdrgeJsqXTZG7fqwyRVMRrP6CmfLMhF"
            }
        }
    ],
    "holder": {
        "id": "did:web:ssi.eecc.de",
        "image": "https://id.eecc.de/assets/img/logo_big.png",
        "name": "EECC"
    },
    "proof": {
        "type": "Ed25519Signature2020",
        "created": "2023-02-02T14:29:09Z",
        "verificationMethod": "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
        "proofPurpose": "authentication",
        "challenge": "testchallenge",
        "domain": "ssi.eecc.de",
        "proofValue": "z4A8Xexpe2bjH5WefUKErHvvvaYRHWz4ogWHq9r31EHo44CJX7drJpyyPVwfN5ohxTMMsmrkaWwbWQkUWf1iq3CC8"
    }
  }
]
 * @example response - 200 - Credentials verified
[
  {
    "verified": true,
    "results": [
      {
        "proof": {
          "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://ssi.eecc.de/api/registry/context/productpassport/eeccproduct",
            "https://w3id.org/security/suites/ed25519-2020/v1"
          ],
          "type": "Ed25519Signature2020",
          "created": "2022-11-03T14:18:36Z",
          "proofPurpose": "assertionMethod",
          "verificationMethod": "did:web:ssi.eecc.de#products",
          "proofValue": "z3uJvNNEkTKzPBHdRiCB8u4oa2hK7CLfbFWkdMdcMNxQfEnE2Jhmjd1evwCoWFv3kB1BL4peFYHqjwknzYozfLZVu"
        },
        "verified": true,
        "verificationMethod": {
          "id": "did:web:ssi.eecc.de#products",
          "type": "Ed25519VerificationKey2020",
          "controller": "did:web:ssi.eecc.de",
          "publicKeyMultibase": "z6Mkiaw6Uva4gJnZizeFLyxhMfy6V6eWzCm6pwNCzvSQhHy6",
          "@context": [
            "https://www.w3.org/ns/did/v1",
            "https://w3id.org/security/suites/ed25519-2020/v1",
            "https://w3id.org/security/suites/x25519-2020/v1"
          ]
        },
        "purposeResult": {
          "valid": true
        }
      }
    ]
  }
]
 * @example response - 200 - Presentations verified
[
  {
    "verified": true,
    "presentationResult": {
      "verified": true,
      "results": [
        {
          "proof": {
            "@context": [
              "https://www.w3.org/2018/credentials/v1",
              "https://ssi.eecc.de/api/registry/context",
              "https://w3id.org/security/suites/ed25519-2020/v1"
            ],
            "type": "Ed25519Signature2020",
            "created": "2023-02-02T14:29:09Z",
            "verificationMethod": "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
            "proofPurpose": "authentication",
            "challenge": "testchallenge",
            "domain": "ssi.eecc.de",
            "proofValue": "z4A8Xexpe2bjH5WefUKErHvvvaYRHWz4ogWHq9r31EHo44CJX7drJpyyPVwfN5ohxTMMsmrkaWwbWQkUWf1iq3CC8"
          },
          "verified": true,
          "verificationMethod": {
            "id": "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
            "type": "Ed25519VerificationKey2020",
            "controller": "did:web:ssi.eecc.de",
            "publicKeyMultibase": "z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
            "@context": [
              "https://www.w3.org/ns/did/v1",
              "https://w3id.org/security/suites/ed25519-2020/v1",
              "https://w3id.org/security/suites/x25519-2020/v1"
            ]
          },
          "purposeResult": {
            "valid": true,
            "controller": {
              "@context": [
                "https://www.w3.org/ns/did/v1",
                "https://w3id.org/security/suites/ed25519-2020/v1",
                "https://w3id.org/security/suites/x25519-2020/v1"
              ],
              "id": "did:web:ssi.eecc.de",
              "verificationMethod": [
                {
                  "id": "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
                  "type": "Ed25519VerificationKey2020",
                  "controller": "did:web:ssi.eecc.de",
                  "publicKeyMultibase": "z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd"
                },
                {
                  "id": "did:web:ssi.eecc.de#products",
                  "type": "Ed25519VerificationKey2020",
                  "controller": "did:web:ssi.eecc.de",
                  "publicKeyMultibase": "z6Mkiaw6Uva4gJnZizeFLyxhMfy6V6eWzCm6pwNCzvSQhHy6"
                },
                {
                  "id": "did:web:ssi.eecc.de#z6MknBXhTcvvJRpNk8cdC9LgCccj8W4n26zXUawCAYV6DwPG",
                  "type": "Ed25519VerificationKey2020",
                  "controller": "did:web:ssi.eecc.de",
                  "publicKeyMultibase": "z6MknBXhTcvvJRpNk8cdC9LgCccj8W4n26zXUawCAYV6DwPG"
                }
              ],
              "assertionMethod": [
                "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
                "did:web:ssi.eecc.de#products",
                "did:web:ssi.eecc.de#z6MknBXhTcvvJRpNk8cdC9LgCccj8W4n26zXUawCAYV6DwPG"
              ],
              "authentication": [
                "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd"
              ],
              "capabilityDelegation": [
                "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd"
              ],
              "capabilityInvocation": [
                "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd"
              ],
              "service": [
                {
                  "id": "did:web:ssi.eecc.de#website",
                  "type": "LinkedDomains",
                  "serviceEndpoint": "https://id.eecc.de"
                },
                {
                  "id": "did:web:ssi.eecc.de#eecc-registry",
                  "type": "CredentialRegistry",
                  "serviceEndpoint": "https://ssi.eecc.de/api/registry/vcs/"
                }
              ]
            }
          }
        }
      ]
    },
    "credentialResults": [
      {
        "verified": true,
        "results": [
          {
            "proof": {
              "@context": [
                "https://www.w3.org/2018/credentials/v1",
                "https://ssi.eecc.de/api/registry/context/productpassport",
                "https://w3id.org/security/suites/ed25519-2020/v1"
              ],
              "type": "Ed25519Signature2020",
              "created": "2023-01-25T16:01:26Z",
              "proofPurpose": "assertionMethod",
              "verificationMethod": "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
              "proofValue": "z5YUnCUVWgAwc1iTQ61jtUyjBNLZELGMxnbsekFDQLd4ZNbPo45we4xxZjV5pqb3jqPo7ryKMmMY9dySNERz1huLJ"
            },
            "verified": true,
            "verificationMethod": {
              "id": "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
              "type": "Ed25519VerificationKey2020",
              "controller": "did:web:ssi.eecc.de",
              "publicKeyMultibase": "z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
              "@context": [
                "https://www.w3.org/ns/did/v1",
                "https://w3id.org/security/suites/ed25519-2020/v1",
                "https://w3id.org/security/suites/x25519-2020/v1"
              ]
            },
            "purposeResult": {
              "valid": true
            }
          }
        ],
        "credentialId": "https://ssi.eecc.de/api/registry/vc/cf43356c-a9f3-418a-a3ff-baca5a14d668"
      },
      {
        "verified": true,
        "results": [
          {
            "proof": {
              "@context": [
                "https://www.w3.org/2018/credentials/v1",
                "https://ssi.eecc.de/api/registry/context/productpassport",
                "https://w3id.org/security/suites/ed25519-2020/v1"
              ],
              "type": "Ed25519Signature2020",
              "created": "2023-01-25T16:01:01Z",
              "proofPurpose": "assertionMethod",
              "verificationMethod": "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
              "proofValue": "z5AUbYQjMaK27aLWUibQWGLXUNeP1dgEHHdCFGm13GvEwa3sV2BxtDjwSyJdrgeJsqXTZG7fqwyRVMRrP6CmfLMhF"
            },
            "verified": true,
            "verificationMethod": {
              "id": "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
              "type": "Ed25519VerificationKey2020",
              "controller": "did:web:ssi.eecc.de",
              "publicKeyMultibase": "z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
              "@context": [
                "https://www.w3.org/ns/did/v1",
                "https://w3id.org/security/suites/ed25519-2020/v1",
                "https://w3id.org/security/suites/x25519-2020/v1"
              ]
            },
            "purposeResult": {
              "valid": true
            }
          }
        ],
        "credentialId": "https://ssi.eecc.de/api/registry/vc/03bb6e67-ecf3-4b71-99bd-fc4c7c37b8ce"
      }
    ]
  }
]
 */
verifyRouter.post("/", verify);

/**
 * GET /api/verifier/id/{subjectId}
 * @summary Fetch and verify all registry credentials for a subject
 * @description Queries the credential registry configured via `VC_REGISTRY` for credentials whose subject matches `subjectId`, fetches each credential, and verifies it. Returns one `VerifierResponse` per credential found.
 * @tags Verify
 * @operationId verifySubjectCredentials
 * @param {string} subjectId.path.required - Subject identifier (DID or value of `credentialSubject.id`)
 * @return {array<VerifierResponse>} 200 - Verification result for each credential - application/json
 * @return {ErrorResponse} 404 - No credentials found for the subject - text/plain
 * @return {ErrorResponse} 400 - Verification failed - text/plain
 * 
 * @example response - 200 - credentials verified
[
  {
    "verified": true,
    "results": [
      {
        "proof": {
          "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://ssi.eecc.de/api/registry/context/productpassport/eeccproduct",
            "https://w3id.org/security/suites/ed25519-2020/v1"
          ],
          "type": "Ed25519Signature2020",
          "created": "2022-11-03T14:18:36Z",
          "proofPurpose": "assertionMethod",
          "verificationMethod": "did:web:ssi.eecc.de#products",
          "proofValue": "z3uJvNNEkTKzPBHdRiCB8u4oa2hK7CLfbFWkdMdcMNxQfEnE2Jhmjd1evwCoWFv3kB1BL4peFYHqjwknzYozfLZVu"
        },
        "verified": true,
        "verificationMethod": {
          "id": "did:web:ssi.eecc.de#products",
          "type": "Ed25519VerificationKey2020",
          "controller": "did:web:ssi.eecc.de",
          "publicKeyMultibase": "z6Mkiaw6Uva4gJnZizeFLyxhMfy6V6eWzCm6pwNCzvSQhHy6",
          "@context": [
            "https://www.w3.org/ns/did/v1",
            "https://w3id.org/security/suites/ed25519-2020/v1",
            "https://w3id.org/security/suites/x25519-2020/v1"
          ]
        },
        "purposeResult": {
          "valid": true
        }
      }
    ]
  }
]
 */
verifyRouter.get("/id/:subjectId", verifySubjectsVCs);

/**
 * POST /api/verifier/gs1
 * @summary Verify GS1 Verifiable Credentials and Presentations
 * @description Same request shape and query parameters as `POST /api/verifier`, with additional GS1 VC business-rule validation via `@eecc/vc-verifier-rules`. Validates JSON Schema, licence chains (prefix → extended credentials), digital links, and GS1-specific subject fields. The `gs1Result` field mirrors `gs1RulesResult` / `gs1RulesResultContainer` from vc-verifier-rules.
 * @tags Verify
 * @operationId verifyGS1Verifiables
 * @param {array<Verifiable|JwtVerifiable>} request.body.required - GS1 credentials, presentations, or JWT strings to verify - application/json
 * @param {string} challenge.query - Presentation challenge/nonce; injected into the proof when absent
 * @param {string} nonce.query - Alias for `challenge`
 * @param {string} domain.query - Expected presentation domain/audience; skipped when omitted
 * @param {string} audience.query - Alias for `domain`
 * @param {string} aud.query - Alias for `domain`
 * @param {boolean} holderBinding.query - When `true` (default), require presentation holder to match credential subjects and JWT holder claims to match the signing key
 * @return {array<GS1VerificationResponse>} 200 - One combined W3C + GS1 result per input verifiable - application/json
 * @return {ErrorResponse} 400 - Invalid request or GS1 rule validation error - text/plain
 * @example response - 200 - GS1 credential passed
  {
    "verified": true,
    "gs1Result": {
      "credentialId": "https://ssi.eecc.de/api/registry/vc/8ee256f6-9374-4dd4-afc3-8916f4a29573",
      "credentialName": "GS1PrefixLicenceCredential",
      "verified": true,
      "errors": []
    },
    "results": [{ "verified": true, "purposeResult": { "valid": true } }]
  }
 * @example response - 200 - GS1 credential failed business rules
  {
    "verified": false,
    "gs1Result": {
      "credentialId": "https://example.com/vc/123",
      "credentialName": "GS1PrefixLicenseCredential",
      "verified": false,
      "errors": [
        { "code": "GS1-140", "rule": "The issuer of prefix license credential does not match the expected value." }
      ]
    },
    "results": [{ "verified": true, "purposeResult": { "valid": true } }]
  }
 * @example response - 200 - GS1 presentation with per-credential results
  {
    "verified": true,
    "gs1Result": {
      "verified": true,
      "result": [
        {
          "credentialId": "https://example.com/vc/product",
          "credentialName": "ProductDataCredential",
          "verified": true,
          "errors": []
        }
      ]
    },
    "credentialResults": [{ "verified": true, "credentialId": "https://example.com/vc/product" }],
    "presentationResult": { "verified": true }
  }
 * 
 * @example request - Credential request
[
  {
    "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://ref.gs1.org/gs1/vc/licence-context/",
        "https://ssi.eecc.de/api/registry/context",
        "https://w3id.org/vc/status-list/2021/v1",
        "https://w3id.org/security/suites/ed25519-2020/v1"
    ],
    "id": "https://ssi.eecc.de/api/registry/vc/8ee256f6-9374-4dd4-afc3-8916f4a29573",
    "type": [
        "VerifiableCredential",
        "GS1PrefixLicenceCredential"
    ],
    "issuer": {
        "id": "did:web:ssi.eecc.de",
        "image": "https://id.eecc.de/assets/img/logo_big.png",
        "name": "EECC"
    },
    "issuanceDate": "2023-11-22T13:20:58Z",
    "credentialStatus": [
        {
            "id": "https://ssi.eecc.de/api/registry/vc/revocation/did:web:ssi.eecc.de/1#12",
            "type": "StatusList2021Entry",
            "statusPurpose": "revocation",
            "statusListIndex": "12",
            "statusListCredential": "https://ssi.eecc.de/api/registry/vc/revocation/did:web:ssi.eecc.de/1"
        },
        {
            "id": "https://ssi.eecc.de/api/registry/vc/suspension/did:web:ssi.eecc.de/1#5",
            "type": "StatusList2021Entry",
            "statusPurpose": "suspension",
            "statusListIndex": "5",
            "statusListCredential": "https://ssi.eecc.de/api/registry/vc/suspension/did:web:ssi.eecc.de/1"
        }
    ],
    "credentialSubject": {
        "id": "did:web:eecc.de",
        "licenceValue": "040471110",
        "alternativeLicenceValue": "040471110",
        "organizationName": "European EPC Competence Center",
        "partyGLN": "40471110"
    },
    "proof": {
        "type": "Ed25519Signature2020",
        "created": "2023-11-22T13:20:58Z",
        "proofPurpose": "assertionMethod",
        "verificationMethod": "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
        "proofValue": "z3MmgAE6NWZMXdrk3ncbuBmxWNxNS3ZWF8samxd5mzAiqrR4Ru1TcxB92dQhC9GmgFd1d5Lz2dHM2WoVwoMBxehTF"
    }
}
]
 * @example request - Presentation request
[
  {
    "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://ssi.eecc.de/api/registry/context",
        "https://w3id.org/security/suites/ed25519-2020/v1"
    ],
    "type": [
        "VerifiablePresentation"
    ],
    "verifiableCredential": [
        {
            "@context": [
                "https://www.w3.org/2018/credentials/v1",
                "https://ssi.eecc.de/api/registry/context/productpassport",
                "https://w3id.org/security/suites/ed25519-2020/v1"
            ],
            "id": "https://ssi.eecc.de/api/registry/vc/cf43356c-a9f3-418a-a3ff-baca5a14d668",
            "type": [
                "VerifiableCredential",
                "ProductPassportCredential"
            ],
            "issuer": {
                "id": "did:web:ssi.eecc.de",
                "image": "https://id.eecc.de/assets/img/logo_big.png",
                "name": "EECC"
            },
            "issuanceDate": "2023-01-25T16:01:26Z",
            "credentialSubject": {
                "id": "https://id.eecc.de/01/04012345999990/10/20210401-A/21/XYZ-1234",
                "digital_link": "https://id.eecc.de/01/04012345999990/10/20210401-A/21/XYZ-1234"
            },
            "proof": {
                "type": "Ed25519Signature2020",
                "created": "2023-01-25T16:01:26Z",
                "proofPurpose": "assertionMethod",
                "verificationMethod": "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
                "proofValue": "z5YUnCUVWgAwc1iTQ61jtUyjBNLZELGMxnbsekFDQLd4ZNbPo45we4xxZjV5pqb3jqPo7ryKMmMY9dySNERz1huLJ"
            }
        },
        {
            "@context": [
                "https://www.w3.org/2018/credentials/v1",
                "https://ssi.eecc.de/api/registry/context/productpassport",
                "https://w3id.org/security/suites/ed25519-2020/v1"
            ],
            "id": "https://ssi.eecc.de/api/registry/vc/03bb6e67-ecf3-4b71-99bd-fc4c7c37b8ce",
            "type": [
                "VerifiableCredential",
                "ProductPassportCredential"
            ],
            "issuer": {
                "id": "did:web:ssi.eecc.de",
                "image": "https://id.eecc.de/assets/img/logo_big.png",
                "name": "EECC"
            },
            "issuanceDate": "2023-01-25T16:01:01Z",
            "credentialSubject": {
                "id": "https://id.eecc.de/01/04012345999990/10/20210401-A",
                "country_of_origin": "Germany",
                "digital_link": "https://id.eecc.de/01/04012345999990/10/20210401-A",
                "production_date": "2021-04-01"
            },
            "proof": {
                "type": "Ed25519Signature2020",
                "created": "2023-01-25T16:01:01Z",
                "proofPurpose": "assertionMethod",
                "verificationMethod": "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
                "proofValue": "z5AUbYQjMaK27aLWUibQWGLXUNeP1dgEHHdCFGm13GvEwa3sV2BxtDjwSyJdrgeJsqXTZG7fqwyRVMRrP6CmfLMhF"
            }
        }
    ],
    "holder": {
        "id": "did:web:ssi.eecc.de",
        "image": "https://id.eecc.de/assets/img/logo_big.png",
        "name": "EECC"
    },
    "proof": {
        "type": "Ed25519Signature2020",
        "created": "2023-02-02T14:29:09Z",
        "verificationMethod": "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
        "proofPurpose": "authentication",
        "challenge": "testchallenge",
        "domain": "ssi.eecc.de",
        "proofValue": "z4A8Xexpe2bjH5WefUKErHvvvaYRHWz4ogWHq9r31EHo44CJX7drJpyyPVwfN5ohxTMMsmrkaWwbWQkUWf1iq3CC8"
    }
  }
]
 * @example response - 200 - Credentials verified
[
  {
    "verified": true,
    "results": [
      {
        "proof": {
          "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://ssi.eecc.de/api/registry/context/productpassport/eeccproduct",
            "https://w3id.org/security/suites/ed25519-2020/v1"
          ],
          "type": "Ed25519Signature2020",
          "created": "2022-11-03T14:18:36Z",
          "proofPurpose": "assertionMethod",
          "verificationMethod": "did:web:ssi.eecc.de#products",
          "proofValue": "z3uJvNNEkTKzPBHdRiCB8u4oa2hK7CLfbFWkdMdcMNxQfEnE2Jhmjd1evwCoWFv3kB1BL4peFYHqjwknzYozfLZVu"
        },
        "verified": true,
        "verificationMethod": {
          "id": "did:web:ssi.eecc.de#products",
          "type": "Ed25519VerificationKey2020",
          "controller": "did:web:ssi.eecc.de",
          "publicKeyMultibase": "z6Mkiaw6Uva4gJnZizeFLyxhMfy6V6eWzCm6pwNCzvSQhHy6",
          "@context": [
            "https://www.w3.org/ns/did/v1",
            "https://w3id.org/security/suites/ed25519-2020/v1",
            "https://w3id.org/security/suites/x25519-2020/v1"
          ]
        },
        "purposeResult": {
          "valid": true
        }
      }
    ]
  }
]
 * @example response - 200 - Presentations verified
[
  {
    "verified": true,
    "presentationResult": {
      "verified": true,
      "results": [
        {
          "proof": {
            "@context": [
              "https://www.w3.org/2018/credentials/v1",
              "https://ssi.eecc.de/api/registry/context",
              "https://w3id.org/security/suites/ed25519-2020/v1"
            ],
            "type": "Ed25519Signature2020",
            "created": "2023-02-02T14:29:09Z",
            "verificationMethod": "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
            "proofPurpose": "authentication",
            "challenge": "testchallenge",
            "domain": "ssi.eecc.de",
            "proofValue": "z4A8Xexpe2bjH5WefUKErHvvvaYRHWz4ogWHq9r31EHo44CJX7drJpyyPVwfN5ohxTMMsmrkaWwbWQkUWf1iq3CC8"
          },
          "verified": true,
          "verificationMethod": {
            "id": "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
            "type": "Ed25519VerificationKey2020",
            "controller": "did:web:ssi.eecc.de",
            "publicKeyMultibase": "z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
            "@context": [
              "https://www.w3.org/ns/did/v1",
              "https://w3id.org/security/suites/ed25519-2020/v1",
              "https://w3id.org/security/suites/x25519-2020/v1"
            ]
          },
          "purposeResult": {
            "valid": true,
            "controller": {
              "@context": [
                "https://www.w3.org/ns/did/v1",
                "https://w3id.org/security/suites/ed25519-2020/v1",
                "https://w3id.org/security/suites/x25519-2020/v1"
              ],
              "id": "did:web:ssi.eecc.de",
              "verificationMethod": [
                {
                  "id": "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
                  "type": "Ed25519VerificationKey2020",
                  "controller": "did:web:ssi.eecc.de",
                  "publicKeyMultibase": "z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd"
                },
                {
                  "id": "did:web:ssi.eecc.de#products",
                  "type": "Ed25519VerificationKey2020",
                  "controller": "did:web:ssi.eecc.de",
                  "publicKeyMultibase": "z6Mkiaw6Uva4gJnZizeFLyxhMfy6V6eWzCm6pwNCzvSQhHy6"
                },
                {
                  "id": "did:web:ssi.eecc.de#z6MknBXhTcvvJRpNk8cdC9LgCccj8W4n26zXUawCAYV6DwPG",
                  "type": "Ed25519VerificationKey2020",
                  "controller": "did:web:ssi.eecc.de",
                  "publicKeyMultibase": "z6MknBXhTcvvJRpNk8cdC9LgCccj8W4n26zXUawCAYV6DwPG"
                }
              ],
              "assertionMethod": [
                "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
                "did:web:ssi.eecc.de#products",
                "did:web:ssi.eecc.de#z6MknBXhTcvvJRpNk8cdC9LgCccj8W4n26zXUawCAYV6DwPG"
              ],
              "authentication": [
                "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd"
              ],
              "capabilityDelegation": [
                "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd"
              ],
              "capabilityInvocation": [
                "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd"
              ],
              "service": [
                {
                  "id": "did:web:ssi.eecc.de#website",
                  "type": "LinkedDomains",
                  "serviceEndpoint": "https://id.eecc.de"
                },
                {
                  "id": "did:web:ssi.eecc.de#eecc-registry",
                  "type": "CredentialRegistry",
                  "serviceEndpoint": "https://ssi.eecc.de/api/registry/vcs/"
                }
              ]
            }
          }
        }
      ]
    },
    "credentialResults": [
      {
        "verified": true,
        "results": [
          {
            "proof": {
              "@context": [
                "https://www.w3.org/2018/credentials/v1",
                "https://ssi.eecc.de/api/registry/context/productpassport",
                "https://w3id.org/security/suites/ed25519-2020/v1"
              ],
              "type": "Ed25519Signature2020",
              "created": "2023-01-25T16:01:26Z",
              "proofPurpose": "assertionMethod",
              "verificationMethod": "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
              "proofValue": "z5YUnCUVWgAwc1iTQ61jtUyjBNLZELGMxnbsekFDQLd4ZNbPo45we4xxZjV5pqb3jqPo7ryKMmMY9dySNERz1huLJ"
            },
            "verified": true,
            "verificationMethod": {
              "id": "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
              "type": "Ed25519VerificationKey2020",
              "controller": "did:web:ssi.eecc.de",
              "publicKeyMultibase": "z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
              "@context": [
                "https://www.w3.org/ns/did/v1",
                "https://w3id.org/security/suites/ed25519-2020/v1",
                "https://w3id.org/security/suites/x25519-2020/v1"
              ]
            },
            "purposeResult": {
              "valid": true
            }
          }
        ],
        "credentialId": "https://ssi.eecc.de/api/registry/vc/cf43356c-a9f3-418a-a3ff-baca5a14d668"
      },
      {
        "verified": true,
        "results": [
          {
            "proof": {
              "@context": [
                "https://www.w3.org/2018/credentials/v1",
                "https://ssi.eecc.de/api/registry/context/productpassport",
                "https://w3id.org/security/suites/ed25519-2020/v1"
              ],
              "type": "Ed25519Signature2020",
              "created": "2023-01-25T16:01:01Z",
              "proofPurpose": "assertionMethod",
              "verificationMethod": "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
              "proofValue": "z5AUbYQjMaK27aLWUibQWGLXUNeP1dgEHHdCFGm13GvEwa3sV2BxtDjwSyJdrgeJsqXTZG7fqwyRVMRrP6CmfLMhF"
            },
            "verified": true,
            "verificationMethod": {
              "id": "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
              "type": "Ed25519VerificationKey2020",
              "controller": "did:web:ssi.eecc.de",
              "publicKeyMultibase": "z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
              "@context": [
                "https://www.w3.org/ns/did/v1",
                "https://w3id.org/security/suites/ed25519-2020/v1",
                "https://w3id.org/security/suites/x25519-2020/v1"
              ]
            },
            "purposeResult": {
              "valid": true
            }
          }
        ],
        "credentialId": "https://ssi.eecc.de/api/registry/vc/03bb6e67-ecf3-4b71-99bd-fc4c7c37b8ce"
      }
    ]
  }
]
 */
verifyRouter.post("/gs1", verifyGS1);
