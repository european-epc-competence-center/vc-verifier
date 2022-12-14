import { Router } from 'express';
import { VerifyRoutes } from '../../routes/index.js';


const verifyRoutes = new VerifyRoutes();
const { verifyCredential, verifyCredentials, verifySubjectsVCs } = verifyRoutes

export const verifyRouter = Router();


/**
 * API model of a credentialSubject
 * @summary The minimal form of a credential subject
 * @typedef {object} CredentialSubject
 * @property {string} id.required - The identifier of the identity which the credential refers to
 */


/**
 * API model of a signed credential
 * @summary Refers to W3C Credential
 * @typedef {object} SignedCredential
 * @property {array<string>} context.required - The JSON-LD context URIs of the credential
 * @property {string} id.required - The id of the the credential as an IRI
 * @property {array<string>} type.required - The types of the credential
 * @property {string} issuer.required - The DID of the issuer of the credential
 * @property {string} issuanceDate.required - The issuance date of the credential in ISO format 2022-09-26T09:01:07.437Z 
 * @property {string} expirationDate - The expiration date of the credential in ISO format 2022-09-26T09:01:07.437Z 
 * @property {CredentialSubject} credentialSubject.required - The actual claim of the credential
 * @property {object} proof.required - The cryptographic signature of the issuer over the credential
 */

/**
 * Verifier response object
 * @summary The respsonse object of the verifier containing the original credential and the verification result
 * @typedef {object} VerifierResponse
 * @property {array<object>} results.required - Array of results including both successes and errors
 * @property {boolean} verified.required - Boolean if the whole verification was successful
 */

/**
 * GET /api/verifier/vc/{vcid}
 * @summary Verifies a single VC given its id
 * @tags Verify
 * @param {string} vcid.path.required The identifier of the verifiable credential
 * @return {VerifierResponse} 200 - success response - application/json
 * @return {object} 404 - not found response - application/json
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
 verifyRouter.get('/vc/:vcid', verifyCredential);

/**
 * POST /api/verifier/vc
 * @summary Verifies an array of VCs
 * @tags Verify
 * @param {array<VerifierResponse>} request.body.required - Array of verifiable credentials
 * @return {array<object>} 200 - success response - application/json
 * @return {object} 400 - bad request response - application/json
 * 
 * @example request - Example request
[
  {
    "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://ssi.eecc.de/api/registry/context/product-passport"
    ],
    "id": "https://ssi.eecc.de/api/registry/vc/c6e6e206-1538-4da3-b8d6-c7225fc52c5b",
    "type": ["VerifiableCredential", "ProductPassportCredential"],
    "credentialSubject": {
        "id": "https://gs1.org/digital-link",
        "property": "Example property"
    },
    "proof": {
      "type": "Ed25519Signature2020",
      "created": "2022-09-26T09:01:07.000Z",
      "proofPurpose": "assertionMethod",
      "verificationMethod": "did:web:ssi.eecc.de#z6Mks681c8vdENF2Qk6cZEvV82YfoqDAkC9KyqnpdgMy2oyv",
      "proofValue": "z4wxpr1MJyVrmFEGAuwRy7FhFtcCcPiRb74hFgDyvVCsxUdPDkd6afyEVSe8JEs7Y82XLpAsXfRnaTSzyg2NLGMSm"
    }
  }
]
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
 verifyRouter.post('/vc', verifyCredentials);

/**
 * GET /api/verifier/id/{subjectId}
 * @summary Verifies a all queryable vcs of an subjectId
 * @tags Verify
 * @param {string} subjectId.path.required The identifier of the verifiable credential
 * @return {array<VerifierResponse>} 200 - success response - application/json
 * @return {object} 404 - not found response - application/json
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
 verifyRouter.get('/id/:subjectId', verifySubjectsVCs);

