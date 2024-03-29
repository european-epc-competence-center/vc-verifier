import request from "supertest";

import server from "../src/index";

afterAll(done => {
    server.close();
    done();
});

const revoked2020Credential: any = {
    "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://ssi.eecc.de/api/registry/context/productpassport",
        "https://w3id.org/vc-revocation-list-2020/v1",
        "https://w3id.org/security/suites/ed25519-2020/v1"
    ],
    "id": "https://ssi.eecc.de/api/registry/vc/0a720a69-34f0-4ed0-b767-a0a5f9212020",
    "type": [
        "VerifiableCredential",
        "ProductPassportCredential"
    ],
    "issuer": "did:web:ssi.eecc.de",
    "issuanceDate": "2023-01-03T13:54:14Z",
    "credentialStatus": {
        "id": "https://ssi.eecc.de/api/registry/vc/status/did:web:ssi.eecc.de/1#0",
        "type": "RevocationList2020Status",
        "revocationListIndex": 0,
        "revocationListCredential": "https://ssi.eecc.de/api/registry/vc/status/did:web:ssi.eecc.de/1"
    },
    "credentialSubject": {
        "id": "https://id.eecc.de/253/04047111020226acf129b8afd612b3",
        "country_of_origin": "Germany"
    },
    "proof": {
        "type": "Ed25519Signature2020",
        "created": "2023-01-03T13:54:14Z",
        "proofPurpose": "assertionMethod",
        "verificationMethod": "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
        "proofValue": "z4vkGt3B7x1p31kJpTrhwe8EGsTEmd48M4Jrzco86iw4n9pHRsx4wbwbNG14s39Vjxi9LzcQ9Ym595dZ54vetLrPS"
    }
}

const revoked2021Credential: any = {
    "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "ipfs://QmSsQwjhtA86KEAdUoUpwqHysTiTmoScdUes5BcjTEmHEf",
        "https://ssi.eecc.de/api/registry/context",
        "https://w3id.org/vc/status-list/2021/v1",
        "https://w3id.org/security/suites/ed25519-2020/v1"
    ],
    "id": "https://ssi.eecc.de/api/registry/vc/d8810623-e522-4962-bbc9-54dfd6aa9b8b",
    "type": [
        "VerifiableCredential",
        "GS1PrefixLicenceCredential"
    ],
    "issuer": {
        "id": "did:web:ssi.eecc.de",
        "image": "https://id.eecc.de/assets/img/logo_big.png",
        "name": "EECC"
    },
    "issuanceDate": "2023-09-01T13:58:11Z",
    "credentialStatus": {
        "id": "https://ssi.eecc.de/api/registry/vc/revocation/did:web:ssi.eecc.de/1#0",
        "type": "StatusList2021Entry",
        "statusPurpose": "revocation",
        "statusListIndex": 0,
        "statusListCredential": "https://ssi.eecc.de/api/registry/vc/revocation/did:web:ssi.eecc.de/1"
    },
    "credentialSubject": {
        "id": "https://test.de/test1",
        "licenceValue": "1"
    },
    "proof": {
        "type": "Ed25519Signature2020",
        "created": "2023-09-01T13:58:11Z",
        "proofPurpose": "assertionMethod",
        "verificationMethod": "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
        "proofValue": "z4QnfqAyD3mDHWwYRmXpAWkcnk3QkhhGuy4yNXY94S9iydTSjPYkNkkto1CBB5KYFqnvpmR7YC1mMVpSpegeJnZJq"
    }
}

const suspended2021Credential: any = {
    "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://ref.gs1.org/gs1/vc/licence-context/",
        "https://ssi.eecc.de/api/registry/context",
        "https://w3id.org/vc/status-list/2021/v1",
        "https://w3id.org/security/suites/ed25519-2020/v1"
    ],
    "id": "https://ssi.eecc.de/api/registry/vc/918aad61-4087-4495-9341-074655af6902",
    "type": [
        "VerifiableCredential",
        "GS1PrefixLicenceCredential"
    ],
    "issuer": {
        "id": "did:web:ssi.eecc.de",
        "image": "https://id.eecc.de/assets/img/logo_big.png",
        "name": "EECC"
    },
    "issuanceDate": "2023-09-01T14:07:10Z",
    "credentialStatus": {
        "id": "https://ssi.eecc.de/api/registry/vc/suspension/did:web:ssi.eecc.de/1#0",
        "type": "StatusList2021Entry",
        "statusPurpose": "suspension",
        "statusListIndex": 0,
        "statusListCredential": "https://ssi.eecc.de/api/registry/vc/suspension/did:web:ssi.eecc.de/1"
    },
    "credentialSubject": {
        "id": "https://test.de/test1",
        "alternativeLicenceValue": "1"
    },
    "proof": {
        "type": "Ed25519Signature2020",
        "created": "2023-09-01T14:07:10Z",
        "proofPurpose": "assertionMethod",
        "verificationMethod": "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
        "proofValue": "z361uVV9KVfpEWgf5HYss9WrBiRhzUDBpigcSLhYLqCwsV3v8e3VetVCHG4BCHaU7RN1V2RMx7nQRR2ikziwT6Apx"
    }
}

const multiStatusCredential: any = {
    "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://ref.gs1.org/gs1/vc/licence-context/",
        "https://ssi.eecc.de/api/registry/context",
        "https://w3id.org/vc/status-list/2021/v1",
        "https://w3id.org/security/suites/ed25519-2020/v1"
    ],
    "id": "https://ssi.eecc.de/api/registry/vc/8ee256f6-9374-4dd4-afc3-8916f4a29573",
    "type": [
        "VerifiableCredential",
        "GS1PrefixLicenceCredential"
    ],
    "issuer": {
        "id": "did:web:ssi.eecc.de",
        "image": "https://id.eecc.de/assets/img/logo_big.png",
        "name": "EECC"
    },
    "issuanceDate": "2023-11-22T13:20:58Z",
    "credentialStatus": [
        {
            "id": "https://ssi.eecc.de/api/registry/vc/revocation/did:web:ssi.eecc.de/1#12",
            "type": "StatusList2021Entry",
            "statusPurpose": "revocation",
            "statusListIndex": "12",
            "statusListCredential": "https://ssi.eecc.de/api/registry/vc/revocation/did:web:ssi.eecc.de/1"
        },
        {
            "id": "https://ssi.eecc.de/api/registry/vc/suspension/did:web:ssi.eecc.de/1#5",
            "type": "StatusList2021Entry",
            "statusPurpose": "suspension",
            "statusListIndex": "5",
            "statusListCredential": "https://ssi.eecc.de/api/registry/vc/suspension/did:web:ssi.eecc.de/1"
        }
    ],
    "credentialSubject": {
        "id": "did:web:eecc.de",
        "licenceValue": "040471110",
        "alternativeLicenceValue": "040471110",
        "organizationName": "European EPC Competence Center",
        "partyGLN": "40471110"
    },
    "proof": {
        "type": "Ed25519Signature2020",
        "created": "2023-11-22T13:20:58Z",
        "proofPurpose": "assertionMethod",
        "verificationMethod": "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
        "proofValue": "z3MmgAE6NWZMXdrk3ncbuBmxWNxNS3ZWF8samxd5mzAiqrR4Ru1TcxB92dQhC9GmgFd1d5Lz2dHM2WoVwoMBxehTF"
    }
}

const SDCredential: any = {
    "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "ipfs://QmQsgaZPy6zyFAMPvASjz9tyGpmS5LT1zrrNVqP7aorQrN",
        "https://w3id.org/security/data-integrity/v1"
    ],
    "id": "https://ssi.eecc.de/api/registry/vc/3187e4ca-9129-4059-af26-0f85650c2d0f",
    "type": [
        "VerifiableCredential",
        "ProductPassportCredential"
    ],
    "credentialSubject": {
        "id": "https://id.eecc.de/01/04012345999990/10/20210401-A/21/XYZ-1234",
        "digital_link": "https://id.eecc.de/01/04012345999990/10/20210401-A/21/XYZ-1234"
    },
    "issuanceDate": "2023-06-02T08:16:50Z",
    "issuer": {
        "id": "did:web:ssi.eecc.de",
        "image": "https://id.eecc.de/assets/img/logo_big.png",
        "name": "EECC"
    },
    "proof": {
        "type": "DataIntegrityProof",
        "created": "2023-06-02T08:16:50Z",
        "proofPurpose": "assertionMethod",
        "verificationMethod": "did:web:ssi.eecc.de#selective-disclosure",
        "proofValue": "u2V0BhVhAYf_lmn1aGK8R1IaMmLTSs4AN_l3qfDUqFSRmwjRCenPlGNq-0rtjpk4NX2JNWbd0brKeifHuG_P6sy_3AARmW1gkge0PzyPDCxH_sbVlcIuOsD5wLCtkCmL0Ub_IYEjit8Yk5CJBiFhAZ2uy2m5bkn3nQuC1ntJxW4AWjLGuCS2GwoKgBRDvBdh2Sc9_hIMhbMpAJ5x8UyTeoP7VTVZOKRttDeTwtIvgiFhATqtnXpYJdu7x_qtIZJOMsPgNkfbHEXlUMgRIDPEuiio_KzehUjV5LkjssclwrRh4Qlt9juy7GNAPGyZRohMOXFhA7i-IxotjHR3wbSppxyxIpLkJv-hYPuAmeVakDviRaZbMteI81J3tDYWh3e5-ZxGNNT0qnM1XyCybZWc0O_FdCFhAi7T8KEHO78BDBQPn6KJ-IQmfgLPtcbYFbSoTT8h3bR7pyI6UfvXNXlBMWR8IY4ELVWQZQ9iaYO0wsZKTOc-1gFhAUTYy8tvLsTH-ObyqDIcDNQ2OWSX9xh5KHvHOpM4UrGV4uzqYf9IW9mrQPXip2eTehLidmSdRuw7o58k61qeekFhAc7DqraObZRjq30_pi-EupCWIfy5PH7Qv6mnGnW5RR85rMyddhvvX0s2SLbOM6oi0wDBo_BGeDEIeCGboP4hA3FhAvvgfu48dgjGparKilA9tu0mf-MMycFd-3FSzCgs1dAWLxk9_WYS8_XI4OZ6xXjwGlUek0kN2y0eXQlA6fWAR01hAaqYlopNOIkzmIrRReci7A96S8BT96HUFH8qtN3yfh3T7mN5guKXnzSPmVzx1LKp4MkIwycb4O8c1-vv4mczbVaCA",
        "cryptosuite": "ecdsa-sd-2023"
    }
}

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
        const res = await request(server).get("/api/verifier/vc/https%253A%252F%252Fid.gs1.org%252Fvc%252Flicence%252Fgs1_prefix%252F05");
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('verified');
        expect(res.body.verified).toBe(true);
    });

    test("Verify single credential", async () => {
        const res = await request(server).post("/api/verifier").send([GS1LicenceCredential]);
        expect(res.statusCode).toEqual(200);
        expect(res.body[0]).toHaveProperty('verified');
        expect(res.body[0].verified).toBe(true);
    });

    /**
     * Test selective disclosure DataIntegrityProof credential 
     */
    test("Verify single DataIntegrityProof credential", async () => {
        const res = await request(server).post("/api/verifier").send([SDCredential]);
        expect(res.statusCode).toEqual(200);
        expect(res.body[0]).toHaveProperty('verified');
        expect(res.body[0].verified).toBe(true);
    });

    test("Verify multiple credentials", async () => {
        const res = await request(server).post("/api/verifier").send([GS1LicenceCredential, GS1LicenceCredential]);
        expect(res.statusCode).toEqual(200);
        res.body.forEach((el: any) => {
            expect(el).toHaveProperty('verified');
            expect(el.verified).toBe(true);
        });
    });

    /**
     * Test StatusList2020 revoked credential
     */
    test("Verify revoked credential - RevocationList2020", async () => {
        const res = await request(server).post("/api/verifier").send([revoked2020Credential]);
        expect(res.statusCode).toEqual(200);
        expect(res.body[0]).toHaveProperty('verified');
        expect(res.body[0].verified).toBe(false);
        expect(res.body[0]).toHaveProperty('statusResult');
        expect(res.body[0].statusResult.verified).toBe(false);
    });

    /**
     * Test StatusList2021 revoked credential
     */
    test("Verify revoked credential - StatusList2021", async () => {
        const res = await request(server).post("/api/verifier").send([revoked2021Credential]);
        expect(res.statusCode).toEqual(200);
        expect(res.body[0]).toHaveProperty('verified');
        expect(res.body[0].verified).toBe(false);
        expect(res.body[0]).toHaveProperty('statusResult');
        expect(res.body[0].statusResult.verified).toBe(false);
    });

    /**
     * Test StatusList2021 suspended credential
     */
    test("Verify suspended credential", async () => {
        const res = await request(server).post("/api/verifier").send([suspended2021Credential]);
        expect(res.statusCode).toEqual(200);
        expect(res.body[0]).toHaveProperty('verified');
        expect(res.body[0].verified).toBe(false);
        expect(res.body[0]).toHaveProperty('statusResult');
        expect(res.body[0].statusResult.verified).toBe(false);
    });

    /**
     * Test multi StatusList2021 credential
     */
    test("Verify suspended credential", async () => {
        const res = await request(server).post("/api/verifier").send([multiStatusCredential]);
        expect(res.statusCode).toEqual(200);
        expect(res.body[0]).toHaveProperty('verified');
        expect(res.body[0].verified).toBe(true);
        expect(res.body[0]).toHaveProperty('statusResult');
        expect(res.body[0].statusResult.verified).toBe(true);
        expect(res.body[0].statusResult).toHaveProperty('results');
        expect(res.body[0].statusResult.results.every((r: any) => r.verified)).toBe(true);
    });

    test("Falsify single credential", async () => {
        const res = await request(server).post("/api/verifier").send([manipulatedCredential]);
        expect(res.statusCode).toEqual(200);
        expect(res.body[0]).toHaveProperty('verified');
        expect(res.body[0].verified).toBe(false);
        expect(res.body[0]).toHaveProperty('error');
    });
});