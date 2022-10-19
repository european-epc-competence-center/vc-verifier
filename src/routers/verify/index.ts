import { Router } from 'express';
import { VerifyRoutes } from '../../routes/index.js';


const verifyRoutes = new VerifyRoutes();
const { verifyCredential, verifyCredentials, verifySubjectsVCs } = verifyRoutes

export const verifyRouter = Router();

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
 * @property {SignedCredentail} credential.required - The JSON-LD context URIs of the credential
 * @property {boolean} verified.required - The id of the the credential as an IRI
 */

/**
 * GET /verify/vc/{vcid}
 * @summary Verifies a single VC given its id
 * @tags Verify
 * @param {string} vcid.path.required The identifier of the verifiable credential
 * @return {VerifierRespsonse} 200 - success response - application/json
 * @return {object} 404 - not found response - application/json
 */
 verifyRouter.get('/vc/:vcid', verifyCredential);

/**
 * POST /verify/vc
 * @summary Verifies an array of VCs
 * @tags Verify
 * @param {array<VerifierRespsonse>} request.body.required - Array of verifiable credentials
 * @return {array<object>} 200 - success response - application/json
 * @return {object} 404 - not found response - application/json
 */
 verifyRouter.post('/vc', verifyCredentials);

/**
 * GET /verify/id/{subjectId}
 * @summary Verifies a all queryable vcs of an subjectId
 * @tags Verify
 * @param {string} subjectId.path.required The identifier of the verifiable credential
 * @return {array<VerifierRespsonse>} 200 - success response - application/json
 * @return {object} 404 - not found response - application/json
 */
 verifyRouter.get('/id/:subjectId', verifySubjectsVCs);

