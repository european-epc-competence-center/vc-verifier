import request from "supertest";

import app from "../src/index";

const GS1LicenceCredential: any = {
    "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://ref.gs1.org/gs1/vc/licence-context",
        "https://w3id.org/security/suites/ed25519-2020/v1",
        {
            "name": "https://schema.org/name",
            "description": "https://schema.org/description",
            "image": "https://schema.org/image"
        }
    ],
    "issuer": {
        "id": "did:web:id.gs1.org",
        "image": "https://ref.gs1.org/logos/gs1logo.png",
        "name": "GS1"
    },
    "name": "GS1 Prefix Licence",
    "description": "FOR DEMONSTRATION PURPOSES ONLY: NOT TO BE USED FOR PRODUCTION GRADE SYSTEMS! A company prefix that complies with GS1 Standards (a “GS1 Company Prefix”) is a unique identification number that is assigned to just your company by GS1 US. It’s the foundation of GS1 Standards and can be found in all of the GS1 Identification Numbers.",
    "issuanceDate": "2022-11-30T16:14:39.665Z",
    "id": "https://id.gs1.org/licence/gs1_prefix/05",
    "type": [
        "VerifiableCredential",
        "GS1PrefixLicenceCredential"
    ],
    "credentialSubject": {
        "id": "did:web:cbpvsvip-vc.gs1us.org",
        "partyGLN": "0614141000005",
        "organizationName": {
            "language": "en",
            "value": "GS1 US"
        },
        "licenceValue": "05",
        "alternativeLicenceValue": "5"
    },
    "proof": {
        "type": "Ed25519Signature2020",
        "created": "2022-11-30T16:14:39Z",
        "verificationMethod": "did:web:id.gs1.org#z6MkmyW9bMwkNv2imXTkdU36HEBKAgdk3zDcKCarXJPHgNfM",
        "proofPurpose": "assertionMethod",
        "proofValue": "z2ceQMZY7Zdn5GSGh7rCg3QoVemfpW7h8nm5ccD7omKyeDo5gdinNp6ERAShv7m7fEDGCbocZSB9GwbLvhcjSh9zv"
    }
}

const manipulatedCredential = Object.assign({ ...GS1LicenceCredential }, { issuanceDate: "2022-11-30T17:14:39.665Z" })

describe("Verifier API Test for Credentials", () => {

    test("Verify vc by id", async () => {
        const res = await request(app).get("/api/verifier/vc/https%253A%252F%252Fid.gs1.org%252Fvc%252Flicence%252Fgs1_prefix%252F05");
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('verified');
        expect(res.body.verified).toBe(true);
    });

    test("Verify single credential", async () => {
        const res = await request(app).post("/api/verifier").send([GS1LicenceCredential]);
        expect(res.statusCode).toEqual(200);
        expect(res.body[0]).toHaveProperty('verified');
        expect(res.body[0].verified).toBe(true);
    });

    test("Verify multiple credentials", async () => {
        const res = await request(app).post("/api/verifier").send([GS1LicenceCredential, GS1LicenceCredential]);
        expect(res.statusCode).toEqual(200);
        res.body.forEach((el: any) => {
            expect(el).toHaveProperty('verified');
            expect(el.verified).toBe(true);
        });
    });

    test("Falsify single credential", async () => {
        const res = await request(app).post("/api/verifier").send([manipulatedCredential]);
        expect(res.statusCode).toEqual(200);
        expect(res.body[0]).toHaveProperty('verified');
        expect(res.body[0].verified).toBe(false);
        expect(res.body[0]).toHaveProperty('error');
    });
});