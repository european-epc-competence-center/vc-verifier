import request from "supertest";
import app from "../src/app";
import { verify } from "../src/services/verifier/index";
import {
  VcalmInputError,
  failureToVcalmResponse,
  toVcalmResponse,
} from "../src/services/vcalm/response";
import { readJsonFixture } from "../test-support/fixtures";
import { httpRequests, resetHttpRequests } from "../test-support/http-fixtures";

const credential = readJsonFixture("legacy/credential/gs1-licence-credential.json");
const statusCredential = readJsonFixture("legacy/credential/multi-status-credential.json");
const holderPresentation = readJsonFixture("legacy/presentation/multi-presentation.json");

const closedFlags = {
  returnResults: false,
  returnCredential: false,
  returnPresentation: false,
};

function statusListUrls(verifiable: any): string[] {
  const statuses = Array.isArray(verifiable.credentialStatus)
    ? verifiable.credentialStatus
    : verifiable.credentialStatus
      ? [verifiable.credentialStatus]
      : [];
  return statuses
    .map((status: any) => status.statusListCredential)
    .filter((url: unknown): url is string => typeof url === "string");
}

function sawStatusList(verifiable: any): boolean {
  const lists = statusListUrls(verifiable);
  return httpRequests().some((url) => lists.some((list) => url.includes(list)));
}

describe("VCALM response mapping", () => {
  test("a verified result is HTTP 200 and omits errors", () => {
    const response = toVcalmResponse(
      { verified: true, errors: [{ message: "ignored" }] },
      { kind: "credential", options: closedFlags }
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      verified: true,
      problemDetails: [],
      results: {},
    });
    expect(response.body).not.toHaveProperty("errors");
  });

  test("a failed proof is HTTP 400 with a data-model problem type", () => {
    const response = toVcalmResponse(
      { verified: false, error: { message: "Invalid signature" } },
      { kind: "credential", options: closedFlags }
    );

    expect(response.status).toBe(400);
    expect(response.body.verified).toBe(false);
    expect(response.body.problemDetails).toEqual([
      {
        type: "https://www.w3.org/TR/vc-data-model-2.0#CRYPTOGRAPHIC_SECURITY_ERROR",
        title: "CRYPTOGRAPHIC_SECURITY_ERROR",
        detail: "Invalid signature",
      },
    ]);
  });

  test("a GS1 rules failure stays inside problemDetails", () => {
    const response = toVcalmResponse(
      {
        verified: false,
        gs1Result: { verified: false },
        errors: [{
          message: "GS1-140: The issuer of prefix license credential does not match the expected value.",
          type: "https://ssi.eecc.de/api/vcalm/problems/gs1-rules",
        }],
      },
      { kind: "credential", options: closedFlags }
    );

    expect(response.status).toBe(400);
    expect(response.body).not.toHaveProperty("gs1Result");
    expect(response.body.problemDetails).toEqual([
      {
        type: "https://ssi.eecc.de/api/vcalm/problems/gs1-rules",
        title: "gs1-rules",
        detail: "GS1-140: The issuer of prefix license credential does not match the expected value.",
      },
    ]);
  });

  test("a request that never reaches verification uses the invalid-input type", () => {
    const error = new VcalmInputError("Request body must include verifiableCredential");
    error.stack = "VcalmInputError: boom\n    at secret (service.ts:1:1)";
    const response = failureToVcalmResponse(error, { kind: "credential" });

    expect(response.status).toBe(400);
    expect(response.body.problemDetails[0].type).toBe(
      "https://ssi.eecc.de/api/vcalm/problems/invalid-input"
    );
    expect(response.body.problemDetails[0].detail).toBe(
      "Request body must include verifiableCredential"
    );
  });
});

describe("verify checkStatus option", () => {
  test("false skips status and the default still checks it", async () => {
    const skipped = await verify(statusCredential, { checkStatus: false });

    expect(skipped.verified).toBe(true);
    expect(skipped.statusResult).toBeUndefined();
    expect(sawStatusList(statusCredential)).toBe(false);

    resetHttpRequests();
    const checked = await verify(statusCredential);

    expect(checked.verified).toBe(true);
    expect(checked.statusResult?.verified).toBe(true);
    expect(sawStatusList(statusCredential)).toBe(true);
  });
});

describe("VCALM API", () => {
  test("a valid credential is accepted without an errors property", async () => {
    const res = await request(app)
      .post("/api/vcalm/credentials/verify")
      .send({ verifiableCredential: credential });

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/application\/json/);
    expect(res.body.verified).toBe(true);
    expect(res.body.problemDetails).toEqual([]);
    expect(res.body.results).toEqual({});
    expect(res.body).not.toHaveProperty("errors");
    expect(res.body).not.toHaveProperty("credential");
  });

  test("return flags include the credential and proof results", async () => {
    const res = await request(app)
      .post("/api/vcalm/credentials/verify")
      .send({
        verifiableCredential: credential,
        options: { returnCredential: true, returnResults: true, credentialFormat: "ldp_vc" },
      });

    expect(res.status).toBe(200);
    expect(res.body.credential).toEqual(credential);
    expect(res.body.results.proof[0].verified).toBe(true);
  });

  test("a corrupted proof is rejected", async () => {
    const broken = structuredClone(credential);
    broken.proof.proofValue = `${broken.proof.proofValue.slice(0, -4)}aaaa`;

    const res = await request(app)
      .post("/api/vcalm/credentials/verify")
      .send({ verifiableCredential: broken });

    expect(res.status).toBe(400);
    expect(res.body.verified).toBe(false);
    expect(res.body.problemDetails.length).toBeGreaterThan(0);
    expect(res.body.problemDetails[0].detail).not.toMatch(/\n\s+at /);

    const legacy = await request(app).post("/api/verifier").send([broken]);
    expect(legacy.status).toBe(200);
    expect(legacy.body[0].verified).toBe(false);
  });

  test("a raw credential or an array is rejected", async () => {
    const raw = await request(app).post("/api/vcalm/credentials/verify").send(credential);
    const list = await request(app).post("/api/vcalm/credentials/verify").send([credential]);

    expect(raw.status).toBe(400);
    expect(raw.body.verified).toBe(false);
    expect(list.status).toBe(400);
    expect(list.body.verified).toBe(false);
  });

  test("checks proof does not fetch a status list", async () => {
    const res = await request(app)
      .post("/api/vcalm/credentials/verify")
      .send({
        verifiableCredential: statusCredential,
        options: { checks: ["proof"] },
      });

    expect(res.status).toBe(200);
    expect(res.body.verified).toBe(true);
    expect(sawStatusList(statusCredential)).toBe(false);
  });

  test("checks credentialStatus verifies the recorded status list", async () => {
    const res = await request(app)
      .post("/api/vcalm/credentials/verify")
      .send({
        verifiableCredential: statusCredential,
        options: { checks: ["proof", "credentialStatus"] },
      });

    expect(res.status).toBe(200);
    expect(res.body.verified).toBe(true);
    expect(sawStatusList(statusCredential)).toBe(true);
  });

  test("a domain the presentation proof does not carry is rejected", async () => {
    const res = await request(app)
      .post("/api/vcalm/presentations/verify")
      .send({
        verifiablePresentation: holderPresentation,
        options: { challenge: "12345", domain: "ssi.eecc.de/verifier" },
      });

    expect(res.status).toBe(400);
    expect(res.body.verified).toBe(false);
    expect(res.body.problemDetails[0].detail).toMatch(/domain/i);
  });

  test("a presentation with the wrong challenge is rejected", async () => {
    const res = await request(app)
      .post("/api/vcalm/presentations/verify")
      .send({
        verifiablePresentation: holderPresentation,
        options: { challenge: "falseChallenge" },
      });

    expect(res.status).toBe(400);
    expect(res.body.verified).toBe(false);
    expect(res.body.problemDetails.length).toBeGreaterThan(0);
  });

  test("a presentation whose holder differs from the credential subject is accepted", async () => {
    const res = await request(app)
      .post("/api/vcalm/presentations/verify")
      .send({
        verifiablePresentation: holderPresentation,
        options: { challenge: "12345" },
      });

    expect(res.status).toBe(200);
    expect(res.body.verified).toBe(true);
    expect(res.body).not.toHaveProperty("errors");
    expect(res.body).not.toHaveProperty("verifiablePresentation");
  });

  test("a presentation without a proof is rejected", async () => {
    const res = await request(app)
      .post("/api/vcalm/presentations/verify")
      .send({
        verifiablePresentation: {
          "@context": ["https://www.w3.org/ns/credentials/v2"],
          type: ["VerifiablePresentation"],
        },
      });

    expect(res.status).toBe(400);
    expect(res.body.verified).toBe(false);
  });
});
