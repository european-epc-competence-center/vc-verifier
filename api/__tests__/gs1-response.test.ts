import { jest } from "@jest/globals";

const verify = jest.fn<(...args: any[]) => Promise<any>>();
const checkGS1CredentialWithoutPresentation = jest.fn<(...args: any[]) => Promise<any>>();
const checkGS1CredentialPresentationValidation = jest.fn<(...args: any[]) => Promise<any>>();

await jest.unstable_mockModule("../src/services/verifier/index.js", () => ({
  Verifier: { verify },
}));

await jest.unstable_mockModule("@eecc/vc-verifier-rules", () => ({
  checkGS1CredentialWithoutPresentation,
  checkGS1CredentialPresentationValidation,
}));

const { GS1Verifier } = await import("../src/services/verifier/gs1.js");

const holderMethod = {
  id: "did:example:holder#key-1",
  controller: "did:example:holder",
};

describe("GS1Verifier response shape", () => {
  beforeEach(() => {
    verify.mockReset();
    checkGS1CredentialWithoutPresentation.mockReset();
    checkGS1CredentialPresentationValidation.mockReset();
  });

  test("keeps the presentation proof and enclosed credential results", async () => {
    const presentationResult = {
      verified: true,
      results: [
        {
          verified: true,
          verificationMethod: holderMethod,
          purposeResult: { valid: true },
        },
      ],
    };
    const credentialResults = [
      { verified: true, credentialId: "https://example.com/vc/product" },
    ];

    verify.mockResolvedValue({
      verified: true,
      presentationResult,
      credentialResults,
    });
    checkGS1CredentialPresentationValidation.mockResolvedValue({
      verified: true,
      result: [
        {
          credentialId: "https://example.com/vc/product",
          credentialName: "ProductDataCredential",
          verified: true,
          errors: [],
        },
      ],
    });

    const response = await GS1Verifier.verify({
      type: ["VerifiablePresentation"],
      verifiableCredential: [
        {
          type: ["VerifiableCredential", "ProductDataCredential"],
          id: "https://example.com/vc/product",
        },
      ],
    } as any);

    expect(response.verified).toBe(true);
    expect(response.presentationResult).toBe(presentationResult);
    expect(response.presentationResult.results[0].verificationMethod).toEqual(holderMethod);
    expect(response.credentialResults).toBe(credentialResults);
    expect(response.results).toBeUndefined();
  });

  test("leaves credential responses on results and statusResult", async () => {
    const results = [{ verified: true, purposeResult: { valid: true } }];
    const statusResult = { verified: true };

    verify.mockResolvedValue({
      verified: true,
      results,
      statusResult,
    });
    checkGS1CredentialWithoutPresentation.mockResolvedValue({
      verified: true,
      credentialId: "https://example.com/vc/prefix",
      credentialName: "GS1PrefixLicenseCredential",
      errors: [],
    });

    const response = await GS1Verifier.verify({
      type: ["VerifiableCredential", "GS1PrefixLicenseCredential"],
      id: "https://example.com/vc/prefix",
    });

    expect(response.verified).toBe(true);
    expect(response.results).toBe(results);
    expect(response.statusResult).toBe(statusResult);
    expect(response.presentationResult).toBeUndefined();
    expect(response.credentialResults).toBeUndefined();
  });
});
