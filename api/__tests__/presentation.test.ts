import request from "supertest";

import server from "../src/index";

afterAll(done => {
    server.close();
    done();
});

const multiPresentation: any = {
    "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://w3id.org/security/suites/ed25519-2020/v1"
    ],
    "type": [
        "VerifiablePresentation"
    ],
    "verifiableCredential": [
        {
            "@context": [
                "https://www.w3.org/2018/credentials/v1",
                "https://ref.gs1.org/gs1/vc/licence-context/",
                "https://ssi.eecc.de/api/registry/context",
                "https://w3id.org/security/suites/ed25519-2020/v1"
            ],
            "id": "https://ssi.eecc.de/api/registry/vc/e8be5b36-f520-4bdf-ba34-1785b254f0a6",
            "type": [
                "VerifiableCredential",
                "GS1PrefixLicenceCredential"
            ],
            "issuer": {
                "id": "did:web:ssi.eecc.de",
                "image": "https://id.eecc.de/assets/img/logo_big.png",
                "name": "EECC"
            },
            "issuanceDate": "2023-05-16T11:11:04Z",
            "credentialSubject": {
                "id": "did:web:ssi.eecc.de",
                "partyGLN": "4047111000006",
                "licenceValue": "4047111",
                "organizationName": "European EPC Competence Center"
            },
            "proof": {
                "type": "Ed25519Signature2020",
                "created": "2023-05-16T11:11:04Z",
                "proofPurpose": "assertionMethod",
                "verificationMethod": "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
                "proofValue": "z4GKxTZzba6B4Bs2vCETRi3frX9vFn9m61ZsNKPaxH9yZBX382DLGY1yRvuKgwbxUag88eJQfALuBdBHhp3m2r5nA"
            }
        },
        {
            "@context": [
                "https://www.w3.org/2018/credentials/v1",
                "https://ref.gs1.org/gs1/vc/licence-context/",
                "https://ssi.eecc.de/api/registry/context",
                "https://w3id.org/security/suites/ed25519-2020/v1"
            ],
            "id": "https://ssi.eecc.de/api/registry/vc/740fb8fb-b530-4807-8c8f-6e0943581e4c",
            "type": [
                "VerifiableCredential",
                "GS1PrefixLicenceCredential"
            ],
            "issuer": {
                "id": "did:web:ssi.eecc.de",
                "image": "https://id.eecc.de/assets/img/logo_big.png",
                "name": "EECC"
            },
            "issuanceDate": "2023-05-16T10:49:51Z",
            "credentialSubject": {
                "id": "did:web:eecc.de",
                "partyGLN": "4047111000006",
                "organizationName": "European EPC Competence Center",
                "licenceValue": "4047111"
            },
            "proof": {
                "type": "Ed25519Signature2020",
                "created": "2023-05-16T10:49:51Z",
                "proofPurpose": "assertionMethod",
                "verificationMethod": "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
                "proofValue": "zmwT31nYTHhecy594pxMCMmuidTAEWsPSZsXAYj84bQfGSDUD8z5uCNy6WfyqwnkG58YQiZAYjevMdw6nBZaPTJ6"
            }
        }
    ],
    "holder": "did:web:ssi.eecc.de",
    "proof": {
        "type": "Ed25519Signature2020",
        "created": "2023-06-14T14:23:34Z",
        "verificationMethod": "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
        "proofPurpose": "authentication",
        "challenge": "12345",
        "proofValue": "z2aP6o5AeB9sD6N1H26X6bvwcLPjeRpAvBhYo6xixYX7AvieVNFH4K6brZxhdKnXCw7BKYnhf7wfqQTrmGugwL5hr"
    }
}

const domainPresentation: any = {
    "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://w3id.org/security/suites/ed25519-2020/v1"
    ],
    "type": [
        "VerifiablePresentation"
    ],
    "verifiableCredential": [
        {
            "@context": [
                "https://www.w3.org/2018/credentials/v1",
                "ipfs://QmUnuMAyvbhTsyvgcomPsDo8dx6K9bUsyo3EiFb8f1CfeY",
                "https://w3id.org/security/suites/ed25519-2020/v1"
            ],
            "id": "https://ssi.eecc.de/api/registry/vc/ee1a4d4e-abb7-4b38-b9a2-037ba33d6193",
            "type": [
                "VerifiableCredential",
                "ProductPassportCredential"
            ],
            "issuer": {
                "id": "did:web:ssi.eecc.de",
                "image": "https://id.eecc.de/assets/img/logo_big.png",
                "name": "EECC"
            },
            "issuanceDate": "2023-02-27T22:55:55Z",
            "credentialSubject": {
                "id": "did:iota:ebfeb1f712ebc6f1c276e12ec21",
                "brand": "Patek Philippe"
            },
            "proof": {
                "type": "Ed25519Signature2020",
                "created": "2023-02-27T22:55:55Z",
                "proofPurpose": "assertionMethod",
                "verificationMethod": "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
                "proofValue": "z5ti1RiEYjrc9177Cfir2jkmezMcBWr5GmeLo2MGaqoPcqxK8cRpg6Sx9WVMyDDGBNxkJPswTK9vaERhJLYD8jyLY"
            }
        }
    ],
    "holder": "did:web:ssi.eecc.de",
    "proof": {
        "type": "Ed25519Signature2020",
        "created": "2023-06-14T15:23:16Z",
        "verificationMethod": "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
        "proofPurpose": "authentication",
        "challenge": "12345",
        "domain": "ssi.eecc.de/verifier",
        "proofValue": "z3tHBT6WT7dgULQiEH6CDdp3izjVCQUVGY1XSzMHMUq4PoPg3HnsYSFnkbdJsp1zE6yYUXkzfy4ceFM6qHpS7LTxk"
    }
}

const statusPresentation: any = {
    "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://w3id.org/security/suites/ed25519-2020/v1"
    ],
    "type": [
        "VerifiablePresentation"
    ],
    "verifiableCredential": [
        {
            "@context": [
                "https://www.w3.org/2018/credentials/v1",
                "ipfs://QmY9CDY2PoXLgHr2vG4u8mj27cfAyuzVxE2swt8wwFn7Rt",
                "https://w3id.org/vc-revocation-list-2020/v1",
                "https://w3id.org/security/suites/ed25519-2020/v1"
            ],
            "id": "https://ssi.eecc.de/api/registry/vc/b7440bf7-2317-43e4-9857-4c85032ac4a1",
            "type": [
                "VerifiableCredential",
                "EECCAccessCredential"
            ],
            "issuer": {
                "id": "did:web:ssi.eecc.de",
                "image": "https://id.eecc.de/assets/img/logo_big.png",
                "name": "EECC"
            },
            "issuanceDate": "2023-06-19T09:58:08Z",
            "credentialStatus": {
                "id": "https://ssi.eecc.de/api/registry/vc/status/did:web:ssi.eecc.de/1#1",
                "type": "RevocationList2020Status",
                "revocationListIndex": 1,
                "revocationListCredential": "https://ssi.eecc.de/api/registry/vc/status/did:web:ssi.eecc.de/1"
            },
            "credentialSubject": {
                "id": "https://ssi.eecc.de/verifier",
                "customer_name": "VC Verifier"
            },
            "proof": {
                "type": "Ed25519Signature2020",
                "created": "2023-06-19T09:58:08Z",
                "proofPurpose": "assertionMethod",
                "verificationMethod": "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
                "proofValue": "z247VYAm5GbG1sAAcqW7QwEL1mfXxaSa3N93EuLc4HeTUm219UjrPMC5gyq5xTAaDQCVMUEVTouyboY4UMTxzjekN"
            }
        }
    ],
    "holder": "did:web:ssi.eecc.de",
    "proof": {
        "type": "Ed25519Signature2020",
        "created": "2023-06-19T10:19:04Z",
        "verificationMethod": "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
        "proofPurpose": "authentication",
        "challenge": "demochallenge",
        "proofValue": "z3BCT7df4bRXXTa9i79apmiou76M8LVZXGFYHA18xT6wX3PfcpjfWaMc9xhFwmGi9XTj8tth1ai1ASeQoHiGWMn1V"
    }
}

describe("Verifier API Test for Presentations", () => {

    test("Verify presentation with status", async () => {
        const res = await request(server).post("/api/verifier").send([statusPresentation]);
        expect(res.statusCode).toEqual(200);
        expect(res.body[0]).toHaveProperty('verified');
        expect(res.body[0].verified).toBe(true);
        expect(res.body[0]).toHaveProperty('credentialResults');
        res.body[0].credentialResults.forEach((el: any) => {
            expect(el).toHaveProperty('verified');
            expect(el.verified).toBe(true);
        });
    });

    test("Verify single presentation with challenge", async () => {
        const res = await request(server).post("/api/verifier").query({ challenge: '12345' }).send([multiPresentation]);
        expect(res.statusCode).toEqual(200);
        expect(res.body[0]).toHaveProperty('verified');
        expect(res.body[0].verified).toBe(true);
        expect(res.body[0]).toHaveProperty('credentialResults');
        res.body[0].credentialResults.forEach((el: any) => {
            expect(el).toHaveProperty('verified');
            expect(el.verified).toBe(true);
        });
    });

    test("Verify single presentation with challenge & domain", async () => {
        const res = await request(server).post("/api/verifier").query({ challenge: '12345', domain: 'ssi.eecc.de/verifier' }).send([domainPresentation]);
        expect(res.statusCode).toEqual(200);
        expect(res.body[0]).toHaveProperty('verified');
        expect(res.body[0].verified).toBe(true);
        expect(res.body[0]).toHaveProperty('credentialResults');
        res.body[0].credentialResults.forEach((el: any) => {
            expect(el).toHaveProperty('verified');
            expect(el.verified).toBe(true);
        });
    });

    test("Falsify single presentation with wrong challenge", async () => {
        const res = await request(server).post("/api/verifier").query({ challenge: 'falseChallenge', domain: 'ssi.eecc.de/verifier' }).send([domainPresentation]);
        expect(res.statusCode).toEqual(200);
        expect(res.body[0]).toHaveProperty('verified');
        expect(res.body[0].verified).toBe(false);
        expect(res.body[0]).toHaveProperty('error');
        expect(res.body[0].error.name).toBe('VerificationError');
    });

});