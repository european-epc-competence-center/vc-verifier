import { Router } from 'express';
import { VcalmRoutes } from '../../routes/index.js';

const vcalmRoutes = new VcalmRoutes();

export const vcalmRouter = Router();

/**
 * @tags VCALM - W3C VCALM verification of one credential or presentation per request
 */

/**
 * Problem Details object (RFC 9457) for a VCALM verification failure
 * @typedef {object} VcalmProblemDetail
 * @property {string} type.required - Problem type URL
 * @property {string} title.required - Short problem title
 * @property {string} detail.required - Human-readable explanation, without a stack trace
 */

/**
 * VCALM verification response
 * @summary Outcome of verifying one credential or presentation
 * @typedef {object} VcalmVerificationResponse
 * @property {boolean} verified.required - `true` only when every requested check passed
 * @property {array<VcalmProblemDetail>} problemDetails.required - Empty when `verified` is `true`
 * @property {object} results.required - Verification detail when `options.returnResults` is `true`, otherwise `{}`
 * @property {object} credential - Submitted credential, only when `options.returnCredential` is `true`
 * @property {object} verifiablePresentation - Submitted presentation, only when `options.returnPresentation` is `true`
 */

/**
 * Options accepted by both VCALM verify routes. Unknown keys are ignored.
 * @typedef {object} VcalmVerifyOptions
 * @property {array<string>} checks - `proof` selects cryptographic verification. `credentialStatus` selects status verification. `gs1Rules` selects `GS1Verifier` (the same verification as `POST /api/verifier/gs1`). A rules failure is `verified: false` with `problemDetails` and does not add `gs1Result`. Other names are ignored. Absent means proof plus status when `credentialStatus` is present
 * @property {boolean} returnResults - Include per-check results. Default `false`
 * @property {boolean} returnProblemDetails - Accepted and ignored; `problemDetails` is always present
 * @property {string} challenge - Presentation challenge. Credential route ignores it
 * @property {string} domain - Presentation domain. Credential route ignores it
 * @property {boolean} returnCredential - Return the credential in the response
 * @property {boolean} returnPresentation - Return the presentation in the response
 */

/**
 * POST /api/vcalm/credentials/verify
 * @summary Verify one verifiable credential
 * @description Verifies the single `verifiableCredential` in the body. The value may be a JSON-LD credential, an `EnvelopedVerifiableCredential`, or a compact JWT string. HTTP 200 means the credential was accepted (`verified: true`, no `errors` array). A failed proof, a failed status check that was requested, a failed GS1 rules check that was requested, or a document this verifier cannot process is HTTP 400 with `verified: false` and `problemDetails`. This profile does not use HTTP 401. Unknown `options` keys are accepted. When `options.checks` is omitted, the proof is checked and status is checked when `credentialStatus` is present. `checks: ["proof"]` does not fetch a status list. `checks` containing `gs1Rules` also applies GS1 VC rules and reports a failure as `problemDetails`, without a `gs1Result` field.
 * @tags VCALM
 * @operationId verifyVcalmCredential
 * @param {object} request.body.required - `{ verifiableCredential, options }` - application/json
 * @return {VcalmVerificationResponse} 200 - Credential accepted - application/json
 * @return {VcalmVerificationResponse} 400 - Credential rejected or the request could not be verified - application/json
 */
vcalmRouter.post('/credentials/verify', vcalmRoutes.verifyCredential);

/**
 * POST /api/vcalm/presentations/verify
 * @summary Verify one verifiable presentation
 * @description Verifies the single `verifiablePresentation` in the body, including its proof, each enclosed credential, and the holder binding between the presentation proof and its verification method. `options.challenge` and `options.domain` are applied to the presentation proof. Credential-subject-to-holder matching is not performed. HTTP 200 means the presentation was accepted. A failed proof, a bad challenge or domain, a failed GS1 rules check that was requested, or a presentation this verifier cannot process (including a missing proof) is HTTP 400. The VCALM draft returns 200 for a completed presentation check even when `verified` is false. This API returns 400 for that case so a W3C test harness does not treat the rejection as a pass. `verified` and `problemDetails` are still in the body. Enclosed credentials follow the same `options.checks` rule as `POST /api/vcalm/credentials/verify`. `gs1Rules` applies once to the presentation.
 * @tags VCALM
 * @operationId verifyVcalmPresentation
 * @param {object} request.body.required - `{ verifiablePresentation, options }` - application/json
 * @return {VcalmVerificationResponse} 200 - Presentation accepted - application/json
 * @return {VcalmVerificationResponse} 400 - Presentation rejected or the request could not be verified - application/json
 */
vcalmRouter.post('/presentations/verify', vcalmRoutes.verifyPresentation);
