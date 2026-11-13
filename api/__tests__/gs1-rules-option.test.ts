import { jest } from "@jest/globals";
import request from "supertest";
import { readJsonFixture } from "../test-support/fixtures";

const checkGS1CredentialWithoutPresentation = jest.fn<(...args: any[]) => Promise<any>>();
const checkGS1CredentialPresentationValidation = jest.fn<(...args: any[]) => Promise<any>>();

await jest.unstable_mockModule("@eecc/vc-verifier-rules", () => ({
  checkGS1CredentialWithoutPresentation,
  checkGS1CredentialPresentationValidation,
}));

const { verify } = await import("../src/services/verifier/index.js");
const { default: app } = await import("../src/app.js");

const credential = readJsonFixture("legacy/credential/gs1-licence-credential.json");
const holderPresentation = readJsonFixture("legacy/presentation/multi-presentation.json");

const issuerMismatch = {
  verified: false,
  credentialId: credential.id,
  credentialName: "GS1PrefixLicenceCredential",
  errors: [{
    code: "GS1-140",
    rule: "The issuer of prefix license credential does not match the expected value.",
  }],
};

describe("VCALM gs1Rules check", () => {
  beforeEach(() => {
    checkGS1CredentialWithoutPresentation.mockReset();
    checkGS1CredentialPresentationValidation.mockReset();
    checkGS1CredentialWithoutPresentation.mockResolvedValue({
      verified: true,
      credentialId: credential.id,
      credentialName: "GS1PrefixLicenceCredential",
      errors: [],
    });
    checkGS1CredentialPresentationValidation.mockResolvedValue({
      verified: true,
      result: [],
    });
  });

  test("leaves a credential on the cryptographic result when omitted", async () => {
    const result = await verify(credential);

    expect(result.verified).toBe(true);
    expect(result).not.toHaveProperty("gs1Result");
    expect(checkGS1CredentialWithoutPresentation).not.toHaveBeenCalled();
  });

  test("a passing GS1 rules check is accepted", async () => {
    const res = await request(app)
      .post("/api/vcalm/credentials/verify")
      .send({
        verifiableCredential: credential,
        options: { checks: ["proof", "gs1Rules"] },
      });

    expect(res.status).toBe(200);
    expect(res.body.verified).toBe(true);
    expect(res.body).not.toHaveProperty("gs1Result");
    expect(checkGS1CredentialWithoutPresentation).toHaveBeenCalledTimes(1);
  });

  test("VCALM reports a requested GS1 rules failure as problemDetails", async () => {
    checkGS1CredentialWithoutPresentation.mockResolvedValue(issuerMismatch);

    const res = await request(app)
      .post("/api/vcalm/credentials/verify")
      .send({
        verifiableCredential: credential,
        options: { checks: ["proof", "gs1Rules"] },
      });

    expect(res.status).toBe(400);
    expect(res.body.verified).toBe(false);
    expect(res.body).not.toHaveProperty("gs1Result");
    expect(res.body.problemDetails).toEqual([
      {
        type: "https://ssi.eecc.de/api/vcalm/problems/gs1-rules",
        title: "gs1-rules",
        detail: "GS1-140: The issuer of prefix license credential does not match the expected value.",
      },
    ]);
  });

  test("VCALM applies GS1 rules once to a presentation", async () => {
    checkGS1CredentialPresentationValidation.mockResolvedValue({
      verified: false,
      result: [{
        credentialId: "https://ssi.eecc.de/api/registry/vc/e8be5b36-f520-4bdf-ba34-1785b254f0a6",
        credentialName: "GS1PrefixLicenceCredential",
        verified: false,
        errors: [{ code: "GS1-200", rule: "Licence chain is incomplete." }],
      }],
    });

    const res = await request(app)
      .post("/api/vcalm/presentations/verify")
      .send({
        verifiablePresentation: holderPresentation,
        options: { challenge: "12345", checks: ["proof", "gs1Rules"] },
      });

    expect(res.status).toBe(400);
    expect(res.body.verified).toBe(false);
    expect(res.body).not.toHaveProperty("gs1Result");
    expect(res.body.problemDetails).toEqual([
      {
        type: "https://ssi.eecc.de/api/vcalm/problems/gs1-rules",
        title: "gs1-rules",
        detail: "GS1-200: Licence chain is incomplete.",
      },
    ]);
    expect(checkGS1CredentialPresentationValidation).toHaveBeenCalledTimes(1);
    expect(checkGS1CredentialWithoutPresentation).not.toHaveBeenCalled();
  });
});
