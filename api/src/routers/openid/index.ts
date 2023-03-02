import { Router } from 'express';
import { OpenIdRoutes } from '../../routes/index.js';


const openIdRoutes = new OpenIdRoutes();
const { generatePresentationRequest, getPresentationRequest, verifyPresentation, getPresentation } = openIdRoutes

export const openIdRouter = Router();


/** TODO
 * Create Resource response object
 * @summary Returns the id of a generated ressource and optionally the generated ressource
 * @typedef {object} CreateResourceResponse
 * @property {string} id.required - generated resource id
 * @property {object} resource - generated resource
 */



/**
 * GET /api/verifier/openid-presentation-request
 * @summary Generate and store a new presentation request
 * @tags open-id
 * @return {CreateResourceResponse} 200 - success response - application/json
 * @example response - 200 - presentation request generated
 {
    "id": "f14ddefa-b81c-11ed-a396-53d88f61898d",
  "resource": {
    "id": "8b5c3e3a-b81b-11ed-b718-3f8b2022e113",
    "input_descriptors": [
        {
            "id": "97aea718-b81b-11ed-96ff-631ef7d93435",
            "format": {
                "ldp_vc": {
                    "proof_type": [
                        "Ed25519Signature2020"
                    ]
                }
            },
            "constraints": {
                "fields": [
                    {
                        "path": [
                            "$.type"
                        ],
                        "filter": {
                            "type": "array",
                            "contains": {
                                "type": "string",
                                "const": "EMailCredential"
                            }
                        }
                    }
                ]
            }
        }
        ]
    }
}
 */
openIdRouter.get('/presentation-request', generatePresentationRequest);


/**
* GET /api/verifier/openid-presentation-request/{requestId}
* @summary Get a presentation request
* @tags open-id
* @param {string} requestId.path.required The identifier of the request
* @return {object} 404 - not found response - application/json
* @return {VerifierResponse} 200 - success response - application/json
* @example response - 200 - presentation request
{
  "id": "8b5c3e3a-b81b-11ed-b718-3f8b2022e113",
  "input_descriptors": [
      {
          "id": "97aea718-b81b-11ed-96ff-631ef7d93435",
          "format": {
              "ldp_vc": {
                  "proof_type": [
                      "Ed25519Signature2020"
                  ]
              }
          },
          "constraints": {
              "fields": [
                  {
                      "path": [
                          "$.type"
                      ],
                      "filter": {
                          "type": "array",
                          "contains": {
                              "type": "string",
                              "const": "EMailCredential"
                          }
                      }
                  }
              ]
          }
      }
  ]
  }
*/
openIdRouter.get('/presentation-request/:requestId', getPresentationRequest);


/**
* POST /api/verifier/openid-presentation
* @summary enpoint to receive presentations answering presentation requests
* @tags open-id
* @return {object} 404 - not found response - application/json
* @return {VerifierResponse} 200 - success response - application/json
* @example response - 200 
*/
openIdRouter.post('/presentation', verifyPresentation);




openIdRouter.get('/presentation/:presentationId', getPresentation);