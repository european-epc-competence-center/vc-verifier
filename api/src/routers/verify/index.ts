import { Router } from 'express';
import { VerifyRoutes } from '../../routes/index.js';


const verifyRoutes = new VerifyRoutes();
const { fetchAndVerify, verify, verifySubjectsVCs } = verifyRoutes

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
 * @property {string} id - The id of the the credential as an IRI
 * @property {array<string>} type.required - The types of the credential
 * @property {string} issuer.required - The DID of the issuer of the credential
 * @property {string} issuanceDate.required - The issuance date of the credential in ISO format 2022-09-26T09:01:07.437Z 
 * @property {string} expirationDate - The expiration date of the credential in ISO format 2022-09-26T09:01:07.437Z 
 * @property {CredentialSubject} credentialSubject.required - The actual claim of the credential
 * @property {object} proof.required - The cryptographic signature of the issuer over the credential
 */

/**
 * API model of a signed presentation
 * @summary Refers to W3C Presentation
 * @typedef {object} SignedPresentation
 * @property {array<string>} context.required - The JSON-LD context URIs of the presentation
 * @property {array<string>} type.required - The types of the presentation. Should be 'VerifiablePresentation'
 * @property {string} holder - The DID of the holder of the credentials, i.e. the presenter
 * @property {array<SignedCredential>} verifiableCredential - Array of included credentials
 * @property {object} proof.required - The cryptographic signature of the holder over the presentation
 */

/**
 * API model of a verifiable. Can be either a SignedCredentials or SignedPresentation
 * @typedef {object} Verifiable
 * @summary Refers to W3C verifiable credentials and presentation
 * @typedef {object} Verifiable
 * @property {array<string>} context.required - The JSON-LD context URIs of the presentation
 * @property {array<string>} type.required - The types of the verifiable
 * @property {object} proof.required - The cryptographic signature
 */

/**
 * Verifier response object
 * @summary The respsonse object of the verifier containing the original credential and the verification result
 * @typedef {object} VerifierResponse
 * @property {array<object>} results - Array of results including both successes and errors for credentials
 * @property {array<object>} credentialResults - Results of the credentials contained in the presentation
 * @property {array<object>} presentationResult - Result of the presentation
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
verifyRouter.get('/vc/:vcid', fetchAndVerify);

/**
 * POST /api/verifier
 * @summary Verifies an array of verifiables
 * @tags Verify
 * @param {array<Verifiable>} request.body.required - Array of verifiables either of type SignedPresentation or SignedCredential - application/json
 * @param {string} challenge.query - The presentation challenge/nonce to verify against. Will be set to the challenge in the presentation if not present.
 * @param {string} domain.query - The presentation domain/audience to verify against. No check will be made if not present.
 * @return {array<VerifierResponse>} 200 - success response - application/json
 * @return {object} 400 - bad request response - application/json
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
verifyRouter.post('/', verify);

/**
 * GET /api/verifier/id/{subjectId}
 * @summary Verifies a all queryable vcs of a subjectId
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

