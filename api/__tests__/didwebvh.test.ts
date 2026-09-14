import { jest } from "@jest/globals";
import { readFileSync } from "node:fs";

function readFixture(name: string): string {
  return readFileSync(new URL(`./fixtures/didwebvh/${name}`, import.meta.url), "utf8");
}

const credential = JSON.parse(readFixture("didwebvh-credential.json"));
const jwt = readFixture("didwebvh-credential.jwt").trim();
const originalLog = readFixture("didwebvh-history.jsonl");
const provenance = JSON.parse(readFixture("didwebvh-provenance.json"));
const did = credential.issuer.id;
const keyId = credential.proof.verificationMethod;
const logUrl = provenance.didLogUrl;
const contextResponses = new Map<string, string>(
  Object.entries(provenance.contextSources).map(([file, url]) => [
    url as string,
    readFixture(file),
  ])
);

let servedLog: string;
let unexpectedRequests: string[];
const logRequests: string[] = [];

// Mock only the HTTP transports. DID resolution, dereferencing, JSON-LD
// processing, and credential signature verification use the production code.
const contextFetch = jest.fn<typeof fetch>();
await jest.unstable_mockModule("node-fetch", () => ({ default: contextFetch }));

const { getResolver } = await import("../src/services/documentLoader/didresolver.js");
const { documentLoader } = await import("../src/services/documentLoader/index.js");
const { Verifier } = await import("../src/services/verifier/index.js");

beforeEach(() => {
  servedLog = originalLog;
  unexpectedRequests = [];
  logRequests.length = 0;
  // Freeze the validation date without delaying asynchronous crypto work.
  jest.useFakeTimers({
    now: new Date("2026-09-14T10:00:00Z"),
    doNotFake: ["nextTick", "queueMicrotask", "setImmediate", "clearImmediate"],
  });

  jest.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = String(input);
    if (url !== logUrl) {
      unexpectedRequests.push(url);
      throw new Error(`Unexpected native fetch: ${url}`);
    }
    logRequests.push(url);
    return new Response(servedLog, {
      headers: { "content-type": "application/jsonl" },
    });
  });

  contextFetch.mockReset();
  contextFetch.mockImplementation(async (input) => {
    const url = String(input);
    const body = contextResponses.get(url);
    if (body === undefined) {
      unexpectedRequests.push(url);
      throw new Error(`Unexpected context fetch: ${url}`);
    }
    return new Response(body, {
      headers: { "content-type": "application/ld+json" },
    });
  });
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
  // Fail even if a verification failure swallowed an unexpected HTTP request.
  expect(unexpectedRequests).toEqual([]);
});

const formats = ["JWT", "JSON-LD"] as const;
function inputFor(format: (typeof formats)[number]) {
  return format === "JWT" ? jwt : structuredClone(credential);
}

describe("wallet did:webvh interoperability", () => {
  test("validates the fetched history and dereferences the current P-256 assertion key", async () => {
    const resolution = await getResolver().resolve(did);

    expect(resolution.didResolutionMetadata.error).toBeUndefined();
    expect(resolution.didDocumentMetadata).toMatchObject({
      versionId: "3-QmTkxXz2XuP2v6i1fMZW7LDHz1RTYUw6rtFPaibJRc8ZJz",
      deactivated: false,
    });
    expect(resolution.didDocument?.id).toBe(did);
    expect(resolution.didDocument?.assertionMethod).toContain(keyId);

    const key = await documentLoader(keyId);
    expect(key.document).toMatchObject({
      id: keyId,
      type: "JsonWebKey",
      controller: did,
      publicKeyJwk: {
        kty: "EC",
        crv: "P-256",
        x: "Dee4e_ZSHxb2MJfb6bu3_QRRql90vrhpjgWA7U8lNLQ",
        y: "zCOzHBzAkkP8FASHyOeC_J-ivRXsI966-qkkgh2AkUU",
      },
    });
    expect(logRequests).toContain(logUrl);
  });

  test.each(formats)("verifies the wallet %s credential through the real resolver", async (format) => {
    const result = await Verifier.verify(inputFor(format));

    expect(result.verified).toBe(true);
    expect(result.results).toHaveLength(1);
    expect(result.results?.[0]).toMatchObject({
      verified: true,
      verificationMethod: { id: keyId },
    });
    expect(logRequests).toContain(logUrl);
  });

  test.each(formats)("rejects a modified %s credential subject", async (format) => {
    let input;
    if (format === "JWT") {
      const [header, payload, signature] = jwt.split(".");
      const modified = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
      modified.credentialSubject.id = "urn:tampered:subject";
      input = [header, Buffer.from(JSON.stringify(modified)).toString("base64url"), signature].join(".");
    } else {
      input = structuredClone(credential);
      input.credentialSubject.id = "urn:tampered:subject";
    }

    const result = await Verifier.verify(input);

    expect(result.verified).toBe(false);
    expect(result.results?.[0].verified).toBe(false);
    expect(result.results?.[0].error).toBeDefined();
    expect(logRequests).toContain(logUrl);
  });

  describe.each(["state", "proof"] as const)("tampered DID log %s", (part) => {
    beforeEach(() => {
      const entries = originalLog.trim().split("\n").map((line) => JSON.parse(line));
      const latest = entries[entries.length - 1];
      if (part === "state") {
        // Keep the recorded hashes and proofs, but replace the signing key.
        latest.state.verificationMethod[1].publicKeyJwk = latest.state.verificationMethod[0].publicKeyJwk;
      } else {
        // Proofs are excluded from the entry hash; this exercises log signature
        // validation separately from history-hash validation.
        const proof = latest.proof[0];
        proof.proofValue = `${proof.proofValue.slice(0, -1)}${proof.proofValue.endsWith("2") ? "3" : "2"}`;
      }
      servedLog = entries.map((entry) => JSON.stringify(entry)).join("\n");
    });

    test.each(formats)("rejects the unchanged wallet %s credential", async (format) => {
      const result = await Verifier.verify(inputFor(format));

      expect(result.verified).toBe(false);
      expect(result.results?.[0].error).toMatchObject({ code: "invalidDid" });
      expect(JSON.stringify(result)).toContain('"code":"invalidDid"');
      expect(logRequests).toContain(logUrl);
    });
  });
});
