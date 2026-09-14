import { jest } from "@jest/globals";
import { Resolver } from "did-resolver";

const resolveDIDMock = jest.fn<(did: string, options?: any) => Promise<any>>();

await jest.unstable_mockModule("didwebvh-ts", () => ({
  resolveDID: resolveDIDMock,
}));

const { getResolver } = await import(
  "../src/services/documentLoader/custom/webvh.js"
);

const did = "did:webvh:QmScid:example.com:api:registry:did:eecc";
const doc = { "@context": "https://www.w3.org/ns/did/v1", id: did };

// Resolve through did-resolver so DID URL parsing matches production.
const resolver = new Resolver(getResolver(), { cache: false });

function resolve(didUrl: string) {
  return resolver.resolve(didUrl);
}

beforeEach(() => {
  resolveDIDMock.mockReset();
});

describe("webvh resolver adapter", () => {
  test("maps a successful resolution and keeps log metadata", async () => {
    resolveDIDMock.mockResolvedValue({
      did,
      doc,
      meta: { versionId: "3-QmHash", deactivated: false, scid: "QmScid" },
      controlled: false,
    });

    const result = await resolve(did);

    expect(result.didDocument).toEqual(doc);
    expect(result.didResolutionMetadata).toEqual({
      contentType: "application/did+ld+json",
    });
    expect(result.didDocumentMetadata).toMatchObject({
      versionId: "3-QmHash",
      deactivated: false,
    });
  });

  test("maps resolver problem details onto resolution metadata", async () => {
    const problemDetails = {
      type: "https://w3id.org/security#INVALID_DID",
      title: "The resolved DID is invalid.",
      detail: "Proof 0 failed verification",
    };
    resolveDIDMock.mockResolvedValue({
      did,
      doc: {},
      meta: { error: "invalidDid", problemDetails },
      controlled: false,
    });

    const result = await resolve(did);

    expect(result.didDocument).toBeNull();
    expect(result.didResolutionMetadata).toEqual({
      error: "invalidDid",
      problemDetails,
    });
    // Log metadata must not leak an error into the document metadata.
    expect(result.didDocumentMetadata).toEqual({});
  });

  test("reports a thrown transport failure as a resolution error", async () => {
    resolveDIDMock.mockRejectedValue(new Error("fetch failed"));

    const result = await resolve(did);

    expect(result.didDocument).toBeNull();
    expect(result.didResolutionMetadata).toMatchObject({
      error: "notFound",
      message: "fetch failed",
    });
  });

  test("passes an Ed25519 log proof verifier", async () => {
    resolveDIDMock.mockResolvedValue({ did, doc, meta: {}, controlled: false });

    await resolve(did);

    const { verifier } = resolveDIDMock.mock.calls[0][1];
    expect(typeof verifier.verify).toBe("function");
    await expect(
      verifier.verify(new Uint8Array(64), new Uint8Array([1]), new Uint8Array(32))
    ).resolves.toBe(false);
  });

  test.each([
    ["versionId=3-QmHash", { versionId: "3-QmHash" }],
    ["versionNumber=2", { versionNumber: 2 }],
    ["versionTime=2026-09-01T00:00:00Z", { versionTime: new Date("2026-09-01T00:00:00Z") }],
  ])("forwards the %s selector", async (query, expected) => {
    resolveDIDMock.mockResolvedValue({ did, doc, meta: {}, controlled: false });

    await resolve(`${did}?${query}`);

    expect(resolveDIDMock).toHaveBeenCalledWith(did, expect.objectContaining(expected));
  });

  test("requests the latest version when no selector is given", async () => {
    resolveDIDMock.mockResolvedValue({ did, doc, meta: {}, controlled: false });

    await resolve(`${did}#next-test-key`);

    const [requestedDid, options] = resolveDIDMock.mock.calls[0];
    expect(requestedDid).toBe(did);
    expect(options).not.toHaveProperty("versionId");
    expect(options).not.toHaveProperty("versionTime");
  });
});
