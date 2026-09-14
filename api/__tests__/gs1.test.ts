import { readJsonFixture } from "../test-support/fixtures.js";
import { jest } from '@jest/globals';

// Production GS1 Global issuer for the id.gs1.org demo credential below
process.env.GS1_GLOBAL_DID = "did:web:id.gs1.org";

const did_gs1_org: any = readJsonFixture("legacy/gs1/did-gs1-org.json");

function resolveDIDFragment(didDocument: any, fragment: string) {
  const verificationMethod = didDocument.verificationMethod.find(
    (method: any) => method.id === `${didDocument.id}#${fragment}` || method.id.endsWith(`#${fragment}`)
  );

  if (verificationMethod) {
    return verificationMethod;
  }

  return didDocument;
}

const { documentLoader: realDocumentLoader } = (await import("../src/services/documentLoader/index")) as any;

await jest.unstable_mockModule("../src/services/documentLoader/index", () => ({
  documentLoader: jest.fn().mockImplementation(async (url: any) => {
    if (url.startsWith("did:web:id.gs1.org")) {
      const [didUrl, fragment] = url.split("#");

      if (fragment) {
        return {
          contextUrl: null,
          documentUrl: url,
          document: resolveDIDFragment(did_gs1_org, fragment)
        };
      }

      return {
        contextUrl: null,
        documentUrl: url,
        document: did_gs1_org
      };
    }

    return realDocumentLoader(url);
  })
}));

// Import modules after mocking
import request from "supertest";

const licenceKeyCredential: any = readJsonFixture("legacy/gs1/licence-key-credential.json");

const companyPrefixCredential: any = readJsonFixture("legacy/gs1/company-prefix-credential.json");

const orgDataCredentialPresentation: any = readJsonFixture("legacy/gs1/org-data-credential-presentation.json");

describe("Verifier API Test for GS1 Credentials", () => {
  let app: any;

  beforeAll(async () => {
    const { default: appModule } = await import("../src/app");
    app = appModule;
  });

  test("Verify GS1 licence prefix credentials", async () => {
    const res = await request(app)
      .post("/api/verifier/gs1")
      .send([licenceKeyCredential]);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body[0]).toHaveProperty("verified");
    expect(res.body[0].verified).toBe(true);
  });

  /*test("Verify GS1 company licence prefix credentials", async () => {
    const res = await request(app)
      .post("/api/verifier/gs1")
      .send([companyPrefixCredential]);
    
    console.log('GS1 company prefix response status:', res.statusCode);
    console.log('GS1 company prefix response body:', JSON.stringify(res.body, null, 2));
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("verified");
    expect(res.body.verified).toBe(true);
  });

  test("Verify GS1 data presentation", async () => {
    const res = await request(app)
      .post("/api/verifier/gs1")
      .send([orgDataCredentialPresentation]);
    
    console.log('GS1 presentation response status:', res.statusCode);
    console.log('GS1 presentation response body:', JSON.stringify(res.body, null, 2));
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("verified");
    expect(res.body.verified).toBe(true);
  });*/
});
