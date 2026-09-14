import { jest } from "@jest/globals";
import type { DIDResolutionResult, DIDResolver } from "did-resolver";

function successfulResolution(did: string): DIDResolutionResult {
  return {
    didResolutionMetadata: { contentType: "application/did+ld+json" },
    didDocument: {
      "@context": "https://www.w3.org/ns/did/v1",
      id: did,
    },
    didDocumentMetadata: {},
  };
}

const keyResolveMock = jest.fn<DIDResolver>(async (did: string) =>
  successfulResolution(did)
);
const webResolveMock = jest.fn<DIDResolver>(async (did: string) =>
  successfulResolution(did)
);
const webvhResolveMock = jest.fn<DIDResolver>(async (did: string) =>
  successfulResolution(did)
);

await jest.unstable_mockModule(
  "../src/services/documentLoader/custom/key",
  () => ({
    getResolver: () => ({ key: keyResolveMock }),
  })
);

await jest.unstable_mockModule("web-did-resolver", () => ({
  getResolver: () => ({ web: webResolveMock }),
}));

await jest.unstable_mockModule(
  "../src/services/documentLoader/custom/webvh",
  () => ({
    getResolver: () => ({ webvh: webvhResolveMock }),
  })
);

const { getResolver } = await import(
  "../src/services/documentLoader/didresolver.js"
);

beforeEach(() => {
  keyResolveMock.mockClear();
  webResolveMock.mockClear();
  webvhResolveMock.mockClear();
});

describe("DID resolver registry", () => {
  test.each([
    ["did:key:z6Mktest", keyResolveMock],
    ["did:web:example.com", webResolveMock],
    ["did:webvh:QmTest:example.com", webvhResolveMock],
  ])("dispatches %s to its registered method", async (did, methodResolver) => {
    const result = await getResolver().resolve(did);

    expect(result.didDocument?.id).toBe(did);
    expect(methodResolver).toHaveBeenCalledTimes(1);

    for (const otherResolver of [
      keyResolveMock,
      webResolveMock,
      webvhResolveMock,
    ]) {
      if (otherResolver !== methodResolver) {
        expect(otherResolver).not.toHaveBeenCalled();
      }
    }
  });

  test("does not fall back to did:web when webvh resolution fails", async () => {
    webvhResolveMock.mockResolvedValueOnce({
      didResolutionMetadata: {
        error: "invalidDid",
        message: "The DID log is invalid.",
      },
      didDocument: null,
      didDocumentMetadata: {},
    });

    const result = await getResolver().resolve("did:webvh:QmTest:example.com");

    expect(result.didResolutionMetadata.error).toBe("invalidDid");
    expect(webvhResolveMock).toHaveBeenCalledTimes(1);
    expect(webResolveMock).not.toHaveBeenCalled();
  });

  test("reuses one resolver instance without caching resolution results", async () => {
    const resolver = getResolver();
    const did = "did:web:example.com";

    expect(getResolver()).toBe(resolver);

    await resolver.resolve(did);
    await resolver.resolve(did);

    expect(webResolveMock).toHaveBeenCalledTimes(2);
  });
});
