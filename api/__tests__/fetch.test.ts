import { jest } from "@jest/globals";

const mockFetch = jest.fn() as any;

await jest.unstable_mockModule("node-fetch", () => ({
  default: mockFetch,
}));

const { fetch_jsonld_or_jwt } = await import("../src/services/fetch/index.js");

function mockResponse(status: number, contentType: string, body: string) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (name: string) =>
        name.toLowerCase() === "content-type" ? contentType : null,
    },
    text: async () => body,
    json: async () => JSON.parse(body),
  };
}

describe("fetch_jsonld_or_jwt", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  test("retries Accept headers after failure until vc+jwt succeeds", async () => {
    const jwt =
      "eyJhbGciOiJFZDI1NTE5In0.eyJ2YyI6eyJ0eXBlIjpbIkJpdHN0cmluZ1N0YXR1c0xpc3RDcmVkZW50aWFsIl19fQ.sig";

    mockFetch
      .mockResolvedValueOnce(
        mockResponse(415, "application/ld+json", "Unsupported Media Type")
      )
      .mockResolvedValueOnce(mockResponse(200, "application/vc+jwt", jwt));

    await expect(
      fetch_jsonld_or_jwt("https://issuer.example/statuslist/1")
    ).resolves.toBe(jwt);

    expect(mockFetch.mock.calls[1][1].headers.Accept).toBe("application/vc+jwt");
  });
});
