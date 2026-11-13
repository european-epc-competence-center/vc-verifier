import { verify } from "../src/services/verifier/index";
import { previousProofReferenceError } from "../src/services/verifier/previousProof";
import { ecdsaSdPublicKeyLength } from "../src/services/verifier/sdProof";
import { getSuite } from "../src/services/verifier/suites";
import { readJsonFixture } from "../test-support/fixtures";

const credential = readJsonFixture("legacy/credential/gs1-licence-credential.json");
const sdCredential = readJsonFixture("legacy/credential/sdcredential.json");

const proofValue35 =
  "u2V0BglhAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFgjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const proofValue36 =
  "u2V0BglhAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFgkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

describe("previousProof", () => {
  test("accepts a reference to another proof on the document", () => {
    expect(previousProofReferenceError([
      { id: "urn:proof:1" },
      { id: "urn:proof:2", previousProof: "urn:proof:1" },
      { previousProof: ["urn:proof:1", "urn:proof:2"] },
    ])).toBeUndefined();
  });

  test("rejects a previousProof that names no proof on the document", () => {
    const missing = previousProofReferenceError([
      { id: "urn:proof:1" },
      { previousProof: "urn:proof:missing" },
    ]);
    const missingList = previousProofReferenceError([
      { id: "urn:proof:1" },
      { previousProof: ["urn:proof:missing"] },
    ]);
    expect(missing?.message).toMatch(/previousProof/);
    expect(missingList?.message).toMatch(/previousProof/);
  });

  test("a signed credential without previousProof still verifies", async () => {
    const result = await verify(credential);
    expect(result.verified).toBe(true);
  });

  test("a dangling previousProof is rejected before the signature is accepted", async () => {
    const broken = structuredClone(credential);
    broken.proof.previousProof = "urn:uuid:test:missing:proof";
    const result = await verify(broken);
    expect(result.verified).toBe(false);
    expect(result.error?.message).toMatch(/previousProof/);
  });
});

describe("ecdsa-sd-2023 proof value", () => {
  test("reads the legacy 36-byte key and the current 35-byte key", () => {
    expect(ecdsaSdPublicKeyLength(sdCredential.proof.proofValue)).toBe(36);
    expect(ecdsaSdPublicKeyLength(proofValue35)).toBe(35);
    expect(ecdsaSdPublicKeyLength(proofValue36)).toBe(36);
  });

  test("builds a verify cryptosuite for both key lengths", () => {
    expect(getSuite({
      type: "DataIntegrityProof",
      cryptosuite: "ecdsa-sd-2023",
      proofValue: sdCredential.proof.proofValue,
    })).toBeDefined();
    expect(getSuite({
      type: "DataIntegrityProof",
      cryptosuite: "ecdsa-sd-2023",
      proofValue: proofValue35,
    })).toBeDefined();
  });
});
