import { jest } from "@jest/globals";

const resolveMock = jest.fn<(...args: any[]) => Promise<any>>();

await jest.unstable_mockModule(
  "../src/services/documentLoader/didresolver",
  () => ({
    getResolver: () => ({ resolve: resolveMock }),
  })
);

const { DIDResolutionError, documentLoader } = await import(
  "../src/services/documentLoader/index.js"
);
const { Verifier } = await import("../src/services/verifier/index.js");

const did = "did:example:issuer";
const verificationMethodId = `${did}#key-1`;
const didDocument = {
  "@context": "https://www.w3.org/ns/did/v1",
  id: did,
  verificationMethod: [
    {
      id: verificationMethodId,
      type: "JsonWebKey2020",
      controller: did,
      publicKeyJwk: { kty: "EC", crv: "P-256", x: "x", y: "y" },
    },
  ],
};

function successfulResolution() {
  return {
    didResolutionMetadata: { contentType: "application/did+ld+json" },
    didDocument,
    didDocumentMetadata: {},
  };
}

function jwtFor(issuer: string, kid: string): string {
  const header = Buffer.from(JSON.stringify({ alg: "ES256", kid })).toString(
    "base64url"
  );
  const payload = Buffer.from(JSON.stringify({ issuer })).toString("base64url");
  return `${header}.${payload}.AA`;
}

beforeEach(() => {
  resolveMock.mockReset();
});

describe("DID document resolution", () => {
  test("returns a successfully resolved DID document", async () => {
    resolveMock.mockResolvedValue(successfulResolution());

    const result = await documentLoader(did);

    expect(result).toEqual({
      contextUrl: null,
      documentUrl: did,
      document: didDocument,
    });
  });

  test("returns a verification method from a successful resolution", async () => {
    resolveMock.mockResolvedValue(successfulResolution());

    const result = await documentLoader(verificationMethodId);

    expect(result.document).toMatchObject({
      id: verificationMethodId,
      controller: did,
      "@context": didDocument["@context"],
    });
  });

  test("rejects resolver error metadata even when a document is present", async () => {
    resolveMock.mockResolvedValue({
      didResolutionMetadata: {
        error: "invalidDid",
        problemDetails: { detail: "The DID log proof is invalid." },
      },
      didDocument,
      didDocumentMetadata: {},
    });

    await expect(documentLoader(did)).rejects.toMatchObject({
      name: "DIDResolutionError",
      code: "invalidDid",
      message: expect.stringContaining("The DID log proof is invalid."),
    });
  });

  test("rejects resolver error metadata without a document", async () => {
    resolveMock.mockResolvedValue({
      didResolutionMetadata: {
        error: "notFound",
        message: "No DID log was found.",
      },
      didDocument: null,
      didDocumentMetadata: {},
    });

    const resolution = documentLoader(did);

    await expect(resolution).rejects.toBeInstanceOf(DIDResolutionError);
    await expect(resolution).rejects.toMatchObject({
      code: "notFound",
      message: expect.stringContaining("No DID log was found."),
    });
  });

  test("rejects a deactivated DID", async () => {
    resolveMock.mockResolvedValue({
      didResolutionMetadata: {},
      didDocument,
      didDocumentMetadata: { deactivated: true },
    });

    await expect(documentLoader(did)).rejects.toMatchObject({
      code: "deactivated",
      message: expect.stringContaining("The DID is deactivated."),
    });
  });

  test("rejects a missing DID document without resolver error metadata", async () => {
    resolveMock.mockResolvedValue({
      didResolutionMetadata: {},
      didDocument: null,
      didDocumentMetadata: {},
    });

    await expect(documentLoader(did)).rejects.toMatchObject({
      code: "notFound",
      message: expect.stringContaining("no DID document"),
    });
  });

  test("preserves resolution details in the verifier response", async () => {
    resolveMock.mockResolvedValue({
      didResolutionMetadata: {
        error: "invalidDid",
        problemDetails: { detail: "The DID history hash does not match." },
      },
      didDocument: null,
      didDocumentMetadata: {},
    });

    const result = await Verifier.verify(jwtFor(did, verificationMethodId));
    const responseBody = JSON.parse(JSON.stringify(result));

    expect(result.verified).toBe(false);
    expect(responseBody.error.errors[0]).toMatchObject({
      name: "DIDResolutionError",
      code: "invalidDid",
      message: expect.stringContaining("The DID history hash does not match."),
    });
    expect(JSON.stringify(responseBody)).toContain("invalidDid");
  });
});
