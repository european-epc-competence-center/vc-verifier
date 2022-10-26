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
 * @typedef {object} VerifierRespsonse
 * @property {SignedCredential} credential.required - The JSON-LD context URIs of the credential
 * @property {boolean} verified.required - The id of the the credential as an IRI
 */

/**
 * GET /verify/vc/{vcid}
 * @summary Verifies a single VC given its id
 * @tags Verify
 * @param {string} vcid.path.required The identifier of the verifiable credential
 * @return {VerifierRespsonse} 200 - success response - application/json
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
          "created": "2022-10-25T15:54:49Z",
          "proofPurpose": "assertionMethod",
          "verificationMethod": "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
          "proofValue": "z4mKhVSAQFh5SCtgDPdVxUM9GspjcGJycGpEjtCqXA6suGSb2NJAizoa9wSBKW3oFhUA7f8EJRDbeRT1gMPu26smt"
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
    ]
  }
 */
 verifyRouter.get('/vc/:vcid', verifyCredential);

/**
 * POST /verify/vc
 * @summary Verifies an array of VCs
 * @tags Verify
 * @param {array<VerifierRespsonse>} request.body.required - Array of verifiable credentials
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
          "created": "2022-10-25T15:54:49Z",
          "proofPurpose": "assertionMethod",
          "verificationMethod": "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
          "proofValue": "z4mKhVSAQFh5SCtgDPdVxUM9GspjcGJycGpEjtCqXA6suGSb2NJAizoa9wSBKW3oFhUA7f8EJRDbeRT1gMPu26smt"
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
    ]
  }
]
 */
 verifyRouter.post('/vc', verifyCredentials);

/**
 * GET /verify/id/{subjectId}
 * @summary Verifies a all queryable vcs of an subjectId
 * @tags Verify
 * @param {string} subjectId.path.required The identifier of the verifiable credential
 * @return {array<VerifierRespsonse>} 200 - success response - application/json
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
          "created": "2022-10-25T15:54:49Z",
          "proofPurpose": "assertionMethod",
          "verificationMethod": "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
          "proofValue": "z4mKhVSAQFh5SCtgDPdVxUM9GspjcGJycGpEjtCqXA6suGSb2NJAizoa9wSBKW3oFhUA7f8EJRDbeRT1gMPu26smt"
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
    ]
  }
]
 */
 verifyRouter.get('/id/:subjectId', verifySubjectsVCs);

