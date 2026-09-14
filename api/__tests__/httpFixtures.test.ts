import { jest } from "@jest/globals";
import { createFixtureFetch } from "../test-support/http-fixtures.js";

describe("offline HTTP fixtures", () => {
  const url = "https://ssi.eecc.de/.well-known/did.json";

  test("returns independent response bodies for repeated requests", async () => {
    const onUnexpected = jest.fn();
    const fetchFixture = createFixtureFetch(onUnexpected);
    const first = await (await fetchFixture(url)).json();
    first.id = "urn:modified";

    const second = await (await fetchFixture(url)).json();
    expect(second.id).toBe("did:web:ssi.eecc.de");
    expect(onUnexpected).not.toHaveBeenCalled();
  });

  test.each([
    ["https://unrecorded.example/context", "GET"],
    [url, "POST"],
  ])("reports and rejects unrecorded requests: %s %s", async (target, method) => {
    const onUnexpected = jest.fn();
    const fetchFixture = createFixtureFetch(onUnexpected);

    await expect(fetchFixture(target, { method })).rejects.toThrow("Unrecorded test HTTP request");
    expect(onUnexpected).toHaveBeenCalledWith(expect.stringContaining(`${method} ${target}`));
  });

  test("preserves the captured unavailable status response", async () => {
    const fetchFixture = createFixtureFetch(jest.fn());
    const response = await fetchFixture("https://vckit.untp.showthething.com/credentials/status/bitstring-status-list/3");

    expect(response.status).toBe(500);
    expect(response.ok).toBe(false);
  });
});
