import request from "supertest";

import server from "../src/index";

afterAll((done) => {
  server.close();
  done();
});

const licenceKeyCredential: any = {
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://ref.gs1.org/gs1/vc/license-context",
    "https://w3id.org/security/suites/ed25519-2020/v1",
    {
      name: "https://schema.org/name",
      description: "https://schema.org/description",
      image: "https://schema.org/image",
    },
    "https://w3id.org/vc-revocation-list-2020/v1",
  ],
  id: "https://id.gs1.org/vc/license/gs1_prefix/08",
  type: ["VerifiableCredential", "GS1PrefixLicenseCredential"],
  issuer: "did:web:id.gs1.org",
  name: "GS1 Prefix License",
  description:
    "FOR DEMONSTRATION PURPOSES ONLY: NOT TO BE USED FOR PRODUCTION GRADE SYSTEMS! A company prefix that complies with GS1 Standards (a “GS1 Company Prefix”) is a unique identification number that is assigned to just your company by GS1 US. It’s the foundation of GS1 Standards and can be found in all of the GS1 Identification Numbers.",
  issuanceDate: "2023-05-19T13:39:41.368Z",
  credentialSubject: {
    id: "did:web:cbpvsvip-vc.gs1us.org",
    organization: {
      "gs1:partyGLN": "0614141000005",
      "gs1:organizationName": "GS1 US",
    },
    licenseValue: "08",
    alternativeLicenseValue: "8",
  },
  proof: {
    type: "Ed25519Signature2020",
    created: "2023-05-19T13:39:41Z",
    verificationMethod:
      "did:web:id.gs1.org#z6MkkzYByKSsaWusRbYNZGAMvdd5utsPqsGKvrc7T9jyvUrN",
    proofPurpose: "assertionMethod",
    proofValue:
      "z56N5j6WZRwAng8f12RNNPStBBmGLaozHkdPtDmMLwZmqo1EXW3juFZYpeyU7QRh6NRGxJtxMJvAXPq4PveR2bR7m",
  },
};

const companyPrefixCredential: any = {
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://ref.gs1.org/gs1/vc/license-context",
    "https://w3id.org/security/suites/ed25519-2020/v1",
    {
      name: "https://schema.org/name",
      description: "https://schema.org/description",
      image: "https://schema.org/image",
    },
    "https://w3id.org/vc-revocation-list-2020/v1",
  ],
  issuer: "did:web:cbpvsvip-vc.gs1us.org",
  name: "GS1 Company Prefix License",
  description:
    "THIS GS1 DIGITAL LICENSE CREDENTIAL IS FOR TESTING PURPOSES ONLY. A GS1 Company Prefix License is issued by a GS1 Member Organization or GS1 Global Office and allocated to a user company or to itself for the purpose of generating tier 1 GS1 identification keys.",
  issuanceDate: "2021-05-11T10:50:36.701Z",
  id: "http://did-vc.gs1us.org/vc/license/08600057694",
  type: ["VerifiableCredential", "GS1CompanyPrefixLicenseCredential"],
  credentialSubject: {
    id: "did:key:z6Mkfb3kW3kBP4UGqaBEQoCLBUJjdzuuuPsmdJ2LcPMvUreS/1",
    organization: {
      "gs1:partyGLN": "0860005769407",
      "gs1:organizationName": "Healthy Tots",
    },
    extendsCredential: "https://id.gs1.org/vc/license/gs1_prefix/08",
    licenseValue: "08600057694",
    alternativeLicenseValue: "8600057694",
  },
  credentialStatus: {
    id: "https://cbpvsvip-vc.dev.gs1us.org/status/2c0a1f02-d545-481b-902a-1e919cd706e2/1193",
    type: "RevocationList2020Status",
    revocationListIndex: 1193,
    revocationListCredential:
      "https://cbpvsvip-vc.dev.gs1us.org/status/2c0a1f02-d545-481b-902a-1e919cd706e2/",
  },
  proof: {
    type: "Ed25519Signature2020",
    created: "2023-05-22T16:55:59Z",
    verificationMethod:
      "did:web:cbpvsvip-vc.gs1us.org#z6Mkig1nTEAxna86Pjb71SZdbX3jEdKRqG1krDdKDatiHVxt",
    proofPurpose: "assertionMethod",
    proofValue:
      "zfWTiZ9CRLJBUUHRFa82adMZFwiAvYCsTwRjX7JaTpUnVuCTj44f9ErSGbTBWezv89MyKQ3jTLFgWUbUvB6nuJCN",
  },
};

describe("Verifier API Test for GS1 Credentials", () => {
  test("Verify GS1 licence prefix credentials", async () => {
    const res = await request(server)
      .post("/api/verifier/gs1")
      .send(licenceKeyCredential);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("verified");
    expect(res.body.verified).toBe(true);
  });

  test("Verify GS1 company licence prefix credentials", async () => {
    const res = await request(server)
      .post("/api/verifier/gs1")
      .send(companyPrefixCredential);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("verified");
    expect(res.body.verified).toBe(true);
  });
});
