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

  test.each(["#key-1", "key-1"])(
    "normalizes the verification method ID %s without mutating the source",
    async (methodId) => {
      const sourceDocument = {
        "@context": "https://www.w3.org/ns/did/v1",
        id: did,
        verificationMethod: [
          {
            id: methodId,
            type: "JsonWebKey2020",
            controller: did,
            publicKeyJwk: { kty: "EC" },
          },
        ],
        assertionMethod: [methodId],
      };
      const originalDocument = structuredClone(sourceDocument);
      resolveMock.mockResolvedValue({
        didResolutionMetadata: {},
        didDocument: sourceDocument,
        didDocumentMetadata: {},
      });

      const result = await documentLoader(verificationMethodId);

      expect(result.document.id).toBe(verificationMethodId);
      expect(sourceDocument).toEqual(originalDocument);
    }
  );

  test("normalizes verification relationship references in returned DID documents", async () => {
    const sourceDocument = {
      "@context": "https://www.w3.org/ns/did/v1",
      id: did,
      verificationMethod: [{ id: "#key-1", controller: did }],
      assertionMethod: ["#key-1"],
    };
    resolveMock.mockResolvedValue({
      didResolutionMetadata: {},
      didDocument: sourceDocument,
      didDocumentMetadata: {},
    });

    const result = await documentLoader(did);

    expect(result.document.verificationMethod[0].id).toBe(
      verificationMethodId
    );
    expect(result.document.assertionMethod).toEqual([verificationMethodId]);
    expect(sourceDocument.verificationMethod[0].id).toBe("#key-1");
    expect(sourceDocument.assertionMethod).toEqual(["#key-1"]);
  });

  test("finds a verification method embedded in a relationship", async () => {
    resolveMock.mockResolvedValue({
      didResolutionMetadata: {},
      didDocument: {
        "@context": "https://www.w3.org/ns/did/v1",
        id: did,
        assertionMethod: [
          {
            id: "#key-1",
            type: "JsonWebKey2020",
            controller: did,
            publicKeyJwk: { kty: "EC" },
          },
        ],
      },
      didDocumentMetadata: {},
    });

    const result = await documentLoader(verificationMethodId);

    expect(result.document).toMatchObject({
      id: verificationMethodId,
      controller: did,
      "@context": "https://www.w3.org/ns/did/v1",
    });
  });

  test("does not treat a relationship reference object as another method", async () => {
    resolveMock.mockResolvedValue({
      didResolutionMetadata: {},
      didDocument: {
        "@context": "https://www.w3.org/ns/did/v1",
        id: did,
        verificationMethod: [
          {
            id: verificationMethodId,
            type: "JsonWebKey2020",
            controller: did,
            publicKeyJwk: { kty: "EC" },
          },
        ],
        assertionMethod: [{ id: "#key-1" }],
      },
      didDocumentMetadata: {},
    });

    const result = await documentLoader(verificationMethodId);

    expect(result.document).toMatchObject({
      id: verificationMethodId,
      type: "JsonWebKey2020",
      controller: did,
    });
  });

  test("rejects an unknown verification method", async () => {
    resolveMock.mockResolvedValue(successfulResolution());

    await expect(documentLoader(`${did}#unknown`)).rejects.toThrow(
      "unknown is an unknown verification method"
    );
  });

  const embeddedMethod = {
    id: "#key-1",
    type: "JsonWebKey2020",
    controller: did,
  };

  test.each([
    [
      "differing definitions",
      {
        verificationMethod: [
          { id: verificationMethodId, type: "Multikey", controller: did },
        ],
        assertionMethod: [embeddedMethod],
      },
    ],
    [
      "identical embedded copies",
      {
        assertionMethod: [embeddedMethod],
        authentication: [embeddedMethod],
      },
    ],
  ])(
    "rejects a verification method ID defined more than once (%s)",
    async (_case: string, methods: Record<string, unknown>) => {
      resolveMock.mockResolvedValue({
        didResolutionMetadata: {},
        didDocument: {
          "@context": "https://www.w3.org/ns/did/v1",
          id: did,
          ...methods,
        },
        didDocumentMetadata: {},
      });

      await expect(documentLoader(verificationMethodId)).rejects.toThrow(
        "key-1 is defined more than once"
      );
    }
  );

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
