import { readFileSync } from "node:fs";

const fixtureDirectory = new URL("../__tests__/fixtures/", import.meta.url);

export function readTextFixture(name: string): string {
  return readFileSync(new URL(name, fixtureDirectory), "utf8").trim();
}

/** Parse on each read so tests can safely modify their own copy. */
export function readJsonFixture(name: string): any {
  return JSON.parse(readTextFixture(name));
}
