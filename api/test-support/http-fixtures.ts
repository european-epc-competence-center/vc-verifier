import { readFileSync } from "node:fs";

interface RecordedResponse {
  file: string;
  status: number;
  headers: Record<string, string>;
  sha256: string;
}

const fixtureDirectory = new URL("../__tests__/fixtures/http/", import.meta.url);
const manifest = JSON.parse(
  readFileSync(new URL("manifest.json", fixtureDirectory), "utf8")
) as { responses: Record<string, RecordedResponse> };

/** Each call returns a fresh response; no live-network fallback is possible. */
export function createFixtureFetch(onUnexpected: (message: string) => void): typeof fetch {
  return async (input, init) => {
    const url = typeof input === "string" || input instanceof URL
      ? String(input)
      : input.url;
    const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
    const fixture = manifest.responses[url];
    if (method !== "GET" || !fixture) {
      const message = `Unrecorded test HTTP request: ${method} ${url}`;
      onUnexpected(message);
      throw new Error(message);
    }

    return new Response(readFileSync(new URL(fixture.file, fixtureDirectory), "utf8"), {
      status: fixture.status,
      headers: fixture.headers,
    });
  };
}
