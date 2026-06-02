import {
  unwrapEnvelopedCredential,
  unwrapPresentationVerifiableCredentials,
  decodeVerifiableInput,
  normalizePresentationInput,
} from "../src/services/verifier/envelope.js";

const sampleJwt = "eyJhbGciOiJFUzI1NiJ9.eyJzdWIiOiJ0ZXN0In0.signature";
const nestedCredentialJwt =
  "eyJhbGciOiJFUzI1NiJ9.eyJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiR1MxQ29tcGFueVByZWZpeExpY2Vuc2VDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImV4dGVuZHNDcmVkZW50aWFsIjoiaHR0cHM6Ly9leGFtcGxlLmNvbS9saWNlbnNlIn19.signature";

describe("envelope helpers", () => {
  test("unwraps data:application/vc-ld+jwt enveloped credential", () => {
    const enveloped = {
      type: ["EnvelopedVerifiableCredential"],
      id: `data:application/vc-ld+jwt,${sampleJwt}`,
    };

    expect(unwrapEnvelopedCredential(enveloped)).toBe(sampleJwt);
  });

  test("unwraps enveloped credentials inside a presentation array", () => {
    const presentation = {
      type: ["VerifiablePresentation"],
      verifiableCredential: [
        {
          type: ["EnvelopedVerifiableCredential"],
          id: `data:application/vc-ld+jwt,${sampleJwt}`,
        },
      ],
    };

    const unwrapped = unwrapPresentationVerifiableCredentials(presentation);
    expect(unwrapped.verifiableCredential[0]).toBe(sampleJwt);
  });

  test("decodes JWT presentation with nested JWT verifiableCredential entries", () => {
    const vpPayload = Buffer.from(
      JSON.stringify({
        type: ["VerifiablePresentation"],
        verifiableCredential: [nestedCredentialJwt],
      })
    ).toString("base64url");
    const presentationJwt = `eyJhbGciOiJFUzI1NiJ9.${vpPayload}.signature`;

    const normalized = normalizePresentationInput(presentationJwt);

    expect(normalized.type).toContain("VerifiablePresentation");
    expect(normalized.verifiableCredential[0].credentialSubject.extendsCredential).toBe(
      "https://example.com/license"
    );
  });

  test("unwraps vc claim payload from decoded verifiable JWT body", () => {
    const jwtPayloadWithVcClaim = {
      iss: "did:example:issuer",
      vc: {
        type: ["VerifiableCredential", "ExampleCredential"],
        credentialSubject: { id: "did:example:holder" },
      },
    };

    const decoded = decodeVerifiableInput(jwtPayloadWithVcClaim);
    expect(decoded.type).toContain("VerifiableCredential");
    expect(decoded.credentialSubject.id).toBe("did:example:holder");
  });
});
