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

const orgDataCredentialPresentation: any = {
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://w3id.org/security/suites/ed25519-2020/v1",
  ],
  type: ["VerifiablePresentation"],
  verifiableCredential: [
    {
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
    },
    {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://ref.gs1.org/gs1/vc/license-context",
        "https://ref.gs1.org/gs1/vc/declaration-context",
        "https://w3id.org/security/suites/ed25519-2020/v1",
        {
          name: "https://schema.org/name",
          description: "https://schema.org/description",
          image: "https://schema.org/image",
        },
        "https://w3id.org/vc-revocation-list-2020/v1",
      ],
      issuer: "did:web:cbpvsvip-vc.gs1us.org",
      name: "GS1 Key Credential",
      description:
        "THIS GS1 DIGITAL LICENSE CREDENTIAL IS FOR TESTING PURPOSES ONLY. This is the Verifiable Credential that indicates that something has been identified. It contains no data about what has been identified as that is done via the association process. This credential is used only to indicate that the key that it contains exists and is valid.",
      id: "did:key:z6MkkzTNsyFfx4VQFkSs3R7q8nKN5twGrM8538Xu7YXym6mW",
      type: ["VerifiableCredential", "KeyCredential"],
      credentialSubject: {
        id: "https://id.gs1.org/417/0860005769407",
        extendsCredential: "http://did-vc.gs1us.org/vc/license/08600057694",
      },
      credentialStatus: {
        id: "https://cbpvsvip-vc.dev.gs1us.org/status/2c0a1f02-d545-481b-902a-1e919cd706e2/1195",
        type: "RevocationList2020Status",
        revocationListIndex: 1195,
        revocationListCredential:
          "https://cbpvsvip-vc.dev.gs1us.org/status/2c0a1f02-d545-481b-902a-1e919cd706e2/",
      },
      issuanceDate: "2023-05-22T17:02:41Z",
      proof: {
        type: "Ed25519Signature2020",
        created: "2023-05-22T17:02:41Z",
        verificationMethod:
          "did:web:cbpvsvip-vc.gs1us.org#z6Mkig1nTEAxna86Pjb71SZdbX3jEdKRqG1krDdKDatiHVxt",
        proofPurpose: "assertionMethod",
        proofValue:
          "zsZsQaGwTpbDNAwPDDK4aPoiVWYDTQcgmgRzb7CP74eEyGE4atrudRjFx7EMndFsNnWx1qh1WUSgEWa6ZTTeBPdb",
      },
    },
    {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://ref.gs1.org/gs1/vc/license-context",
        "https://ref.gs1.org/gs1/vc/declaration-context",
        "https://ref.gs1.org/gs1/vc/organization-context",
        "https://w3id.org/security/suites/ed25519-2020/v1",
        {
          name: "https://schema.org/name",
          description: "https://schema.org/description",
          image: "https://schema.org/image",
        },
        "https://w3id.org/vc-revocation-list-2020/v1",
      ],
      issuer: "did:web:cbpvsvip-vc.gs1us.org",
      name: "GS1 Party Identification Credential",
      description:
        "THIS GS1 DIGITAL LICENSE CREDENTIAL IS FOR TESTING PURPOSES ONLY. The party data credential is the Verifiable Credential that is shared with parties interested in the basic information associated with a party identified by a GLN.",
      issuanceDate: "2021-05-11T10:50:36.701Z",
      id: "did:key:z6MkfEHKfq5vmXXDs6AuE1xt58WySEoLPKLGLoWHHuF1pmVm",
      type: ["VerifiableCredential", "OrganizationDataCredential"],
      credentialSubject: {
        id: "did:key:z6MktUvJtDf1tx6TFuxEb3NxAV3KmWx6j8BVp3jM9TheiFsX/1",
        sameAs: "https://id.gs1.org/417/0860005769407",
        keyAuthorization:
          "did:key:z6MkkzTNsyFfx4VQFkSs3R7q8nKN5twGrM8538Xu7YXym6mW",
        organization: {
          "gs1:partyGLN": "0860005769407",
          "gs1:organizationName": "Healthy Tots",
        },
      },
      credentialStatus: {
        id: "https://cbpvsvip-vc.dev.gs1us.org/status/2c0a1f02-d545-481b-902a-1e919cd706e2/1194",
        type: "RevocationList2020Status",
        revocationListIndex: 1194,
        revocationListCredential:
          "https://cbpvsvip-vc.dev.gs1us.org/status/2c0a1f02-d545-481b-902a-1e919cd706e2/",
      },
      proof: {
        type: "Ed25519Signature2020",
        created: "2023-05-22T17:01:12Z",
        verificationMethod:
          "did:web:cbpvsvip-vc.gs1us.org#z6Mkig1nTEAxna86Pjb71SZdbX3jEdKRqG1krDdKDatiHVxt",
        proofPurpose: "assertionMethod",
        proofValue:
          "z43LLp9h8SKASz3bGKYfy68SaWutdzH9Jz542LHjKwTHWEJafcPorDazU2NPydzHknmxj9rEbrr9Lkzkh5ikpxQcp",
      },
    },
  ],
  id: "urn:uuid:c1lb4rsf9cfamox0e1qfr5",
  holder: "urn:uuid:c1lb4rsf9cfamox0e1qfr5:holder",
  proof: {
    type: "Ed25519Signature2020",
    created: "2023-05-22T17:04:10Z",
    verificationMethod:
      "did:web:cbpvsvip-vc.gs1us.org#z6Mkig1nTEAxna86Pjb71SZdbX3jEdKRqG1krDdKDatiHVxt",
    proofPurpose: "authentication",
    challenge: "tst123",
    proofValue:
      "z2Mv46TpVBzJn5LM9WBg5CkBGScKkVhUyf34xmzvURXVWoqg4r3Xywwbg9AbD54Aus9KAoWFkmGhFeGUZi3fwck7G",
  },
};

describe("Verifier API Test for GS1 Credentials", () => {
  test("Verify GS1 licence prefix credentials", async () => {
    const res = await request(server)
      .post("/api/verifier/gs1")
      .send([licenceKeyCredential]);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("verified");
    expect(res.body.verified).toBe(true);
  });

  test("Verify GS1 company licence prefix credentials", async () => {
    const res = await request(server)
      .post("/api/verifier/gs1")
      .send([companyPrefixCredential]);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("verified");
    expect(res.body.verified).toBe(true);
  });

  test("Verify GS1 data presentation", async () => {
    const res = await request(server)
      .post("/api/verifier/gs1")
      .send([orgDataCredentialPresentation]);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("verified");
    expect(res.body.verified).toBe(true);
  });
});
