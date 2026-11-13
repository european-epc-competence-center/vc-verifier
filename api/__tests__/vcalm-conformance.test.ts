import request from "supertest";
import app from "../src/app";
import { readJsonFixture } from "../test-support/fixtures";

/**
 * Rows from the suites canivc publishes under conformance:
 *
 * - VC API Verifier "Conformance Testing Results" / "Verify Credential - Data Integrity"
 *   (`w3c-ccg/vc-api-verifier-test-suite` `tests/10-vc-di.js`). The suite posts
 *   `{ verifiableCredential, options: { checks: ["proof"] } }` and accepts only
 *   HTTP 200 for a valid credential and HTTP 400 or 422 for each mutation.
 *   `result.status` in that file is the Fetch response status, not a JSON field.
 * - VC Data Model 2.0 "Basic Conformance" verifier statements
 *   (`w3c/vc-data-model-2.0-test-suite` `tests/1.03-conformance.js`). The second
 *   title is copied as published, including the missing space in "inSection".
 *
 * The JWT column (`tests/11-vc-jwt.js`) issues through a tagged issuer before
 * it mutates the credential. This repository has no issuer, so that column is
 * not reproduced here.
 */
const credential = readJsonFixture("legacy/credential/gs1-licence-credential.json");

const proofOptions = { checks: ["proof"] };

function postCredential(verifiableCredential: unknown) {
  return request(app)
    .post("/api/vcalm/credentials/verify")
    .send({ verifiableCredential, options: proofOptions });
}

function expectAccepted(res: request.Response): void {
  expect(res.status).toBe(200);
  expect(res.body.verified).toBe(true);
  expect(res.body.errors).toBeUndefined();
}

function expectRejected(res: request.Response, label: string): void {
  if (res.status !== 400 && res.status !== 422) {
    throw new Error(`${label} returned HTTP ${res.status}: ${JSON.stringify(res.body)}`);
  }
  expect(res.status).not.toBe(401);
  expect(res.body.verified).toBe(false);
}

describe("VC API verifier conformance (Data Integrity)", () => {
  test('MUST verify a valid VC.', async () => {
    expectAccepted(await postCredential(credential));
  }, 30_000);

  test.each([
    ['MUST not verify if "@context" property is missing.', (vc: any) => delete vc["@context"]],
    ['MUST not verify if "type" property is missing.', (vc: any) => delete vc.type],
    ['MUST not verify if "issuer" property is missing.', (vc: any) => delete vc.issuer],
    [
      'MUST not verify if "credentialSubject" property is missing.',
      (vc: any) => delete vc.credentialSubject,
    ],
    ['MUST not verify if "proof" property is missing.', (vc: any) => delete vc.proof],
    ['MUST not verify if "proof.type" property is missing.', (vc: any) => delete vc.proof.type],
    [
      'MUST not verify if "proof.created" property is missing.',
      (vc: any) => delete vc.proof.created,
    ],
    [
      'MUST not verify if "proof.verificationMethod" property is missing.',
      (vc: any) => delete vc.proof.verificationMethod,
    ],
    [
      'MUST not verify if "proof.proofValue" property is missing.',
      (vc: any) => delete vc.proof.proofValue,
    ],
    [
      'MUST not verify if "proof.proofPurpose" property is missing.',
      (vc: any) => delete vc.proof.proofPurpose,
    ],
  ])("%s", async (title, mutate) => {
    const vc = structuredClone(credential);
    mutate(vc);
    expectRejected(await postCredential(vc), title);
  }, 30_000);

  test('MUST not verify if "@context" is not an array.', async () => {
    for (const value of ["string", {}, null, undefined, 10, true]) {
      const vc = structuredClone(credential);
      vc["@context"] = value;
      expectRejected(await postCredential(vc), `@context=${JSON.stringify(value)}`);
    }
  }, 60_000);

  test('MUST not verify if "@context" items are not strings or objects.', async () => {
    for (const value of [[], null, undefined, 10, true]) {
      const vc = structuredClone(credential);
      vc["@context"] = [value];
      expectRejected(await postCredential(vc), `@context item=${JSON.stringify(value)}`);
    }
  }, 60_000);

  test('MUST not verify if "type" is not an array.', async () => {
    for (const value of ["string", {}, null, undefined, 10, true]) {
      const vc = structuredClone(credential);
      vc.type = value;
      expectRejected(await postCredential(vc), `type=${JSON.stringify(value)}`);
    }
  }, 60_000);

  test('MUST not verify if "type" items are not strings.', async () => {
    for (const value of [[], {}, null, undefined, 10, true]) {
      const vc = structuredClone(credential);
      vc.type = [value];
      expectRejected(await postCredential(vc), `type item=${JSON.stringify(value)}`);
    }
  }, 60_000);

  test('MUST not verify if "issuer" is not an object or a string.', async () => {
    for (const value of [[], null, undefined, 10, true]) {
      const vc = structuredClone(credential);
      vc.issuer = value;
      expectRejected(await postCredential(vc), `issuer=${JSON.stringify(value)}`);
    }
  }, 60_000);

  test('MUST not verify if "credentialSubject" is not an object.', async () => {
    for (const value of ["string", null, undefined, 10, true, []]) {
      const vc = structuredClone(credential);
      vc.credentialSubject = value;
      expectRejected(await postCredential(vc), `credentialSubject=${JSON.stringify(value)}`);
    }
  }, 60_000);

  test('MUST not verify if "proof" is not an object.', async () => {
    for (const value of ["string", null, undefined, 10, true, []]) {
      const vc = structuredClone(credential);
      vc.proof = value;
      expectRejected(await postCredential(vc), `proof=${JSON.stringify(value)}`);
    }
  }, 60_000);
});

describe("VC Data Model 2.0 basic conformance", () => {
  test(
    "A conforming verifier implementation MUST perform verification on a conforming document as described inSection 4.12 Securing Mechanisms.",
    async () => {
      expectAccepted(await postCredential(credential));
    },
    30_000
  );

  test(
    "A conforming verifier implementation MUST produce errors when non-conforming documents are detected.",
    async () => {
      const doc = { type: ["NonconformingDocument"] };
      expectRejected(await postCredential(doc), "credential");

      const presentation = await request(app)
        .post("/api/vcalm/presentations/verify")
        .send({ verifiablePresentation: doc, options: proofOptions });
      expectRejected(presentation, "presentation");
    },
    30_000
  );
});
