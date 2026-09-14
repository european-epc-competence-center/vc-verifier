import { jest, afterAll, afterEach } from "@jest/globals";
import http from "node:http";
import https from "node:https";
import { createFixtureFetch } from "./http-fixtures.js";

const unexpectedRequests: string[] = [];
const fixtureFetch = createFixtureFetch((message) => unexpectedRequests.push(message));
const originalFetch = globalThis.fetch;

// Install before application modules load, covering all three fetch transports
// used by the API and its DID resolvers.
const fetchExports = () => ({
  default: fixtureFetch,
  fetch: fixtureFetch,
  Headers,
  Request,
  Response,
});
await jest.unstable_mockModule("node-fetch", fetchExports);
await jest.unstable_mockModule("cross-fetch", fetchExports);
globalThis.fetch = fixtureFetch;

// Keep Supertest's ephemeral loopback HTTP server usable, but fail immediately
// if any code bypasses the fixture transports to make an external request.
const originals = [http, https].map((transport) => ({
  transport,
  request: transport.request,
  get: transport.get,
}));
for (const { transport, request, get } of originals) {
  function guard(original: typeof http.request): typeof http.request {
    return function (...args: any[]) {
      const input = args[0];
      const options = typeof args[1] === "object" ? args[1] : {};
      const parsed = typeof input === "string" || input instanceof URL
        ? new URL(input)
        : input;
      const host = options.hostname ?? options.host ?? parsed.hostname ?? parsed.host ?? "localhost";
      if (!["localhost", "127.0.0.1", "::1", "[::1]"].includes(host)) {
        const message = `External HTTP is disabled in tests: ${host}`;
        unexpectedRequests.push(message);
        throw new Error(message);
      }
      return (original as (...args: any[]) => http.ClientRequest).apply(transport, args);
    } as typeof http.request;
  }
  // Direct replacement keeps this guard active across jest.restoreAllMocks().
  transport.request = guard(request);
  transport.get = guard(get);
}

afterEach(() => {
  const requests = unexpectedRequests.splice(0);
  // Verification normally catches errors. Still fail the test if it caught
  // an unrecorded request and happened to satisfy a negative assertion.
  expect(requests).toEqual([]);
});

afterAll(() => {
  globalThis.fetch = originalFetch;
  for (const { transport, request, get } of originals) {
    transport.request = request;
    transport.get = get;
  }
});
