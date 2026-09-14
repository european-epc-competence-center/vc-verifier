import { readJsonFixture } from "../test-support/fixtures.js";
import request from "supertest";

import app from "../src/app";

const revoked2020Credential: any = readJsonFixture("legacy/credential/revoked2020-credential.json")

const revoked2021Credential: any = readJsonFixture("legacy/credential/revoked2021-credential.json")

const suspended2021Credential: any = readJsonFixture("legacy/credential/suspended2021-credential.json")

const multiStatusCredential: any = readJsonFixture("legacy/credential/multi-status-credential.json")

const SDCredential: any = readJsonFixture("legacy/credential/sdcredential.json")

const GS1LicenceCredential: any = readJsonFixture("legacy/credential/gs1-licence-credential.json")

const manipulatedCredential = Object.assign({ ...GS1LicenceCredential }, { issuanceDate: "2022-11-30T17:14:39.665Z" })

describe("Verifier API Test for Credentials", () => {

    test("Verify single credential", async () => {
        const res = await request(app).post("/api/verifier").send([GS1LicenceCredential]);
        expect(res.statusCode).toEqual(200);
        expect(res.body[0]).toHaveProperty('verified');
        expect(res.body[0].verified).toBe(true);
    });

    /**
     * Test selective disclosure DataIntegrityProof credential 
     * TODO: Test credential needs to be regenerated with @digitalbazaar/ecdsa-sd-2023-cryptosuite v3.x format
     * The v3.x cryptosuite has stricter validation requiring publicKey as Uint8Array of length 35
     */
    test.skip("Verify single DataIntegrityProof credential", async () => {
        const res = await request(app).post("/api/verifier").send([SDCredential]);
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

    /**
     * Test StatusList2020 revoked credential
     * TODO: Test may be affected by @digitalbazaar/vc-revocation-list v7.0 changes
     * Consider updating test credential or migrating to BitstringStatusListEntry
     */
    test.skip("Verify revoked credential - RevocationList2020", async () => {
        const res = await request(app).post("/api/verifier").send([revoked2020Credential]);
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
        const res = await request(app).post("/api/verifier").send([revoked2021Credential]);
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
        const res = await request(app).post("/api/verifier").send([suspended2021Credential]);
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
        const res = await request(app).post("/api/verifier").send([multiStatusCredential]);
        expect(res.statusCode).toEqual(200);
        expect(res.body[0]).toHaveProperty('verified');
        expect(res.body[0].verified).toBe(true);
        expect(res.body[0]).toHaveProperty('statusResult');
        expect(res.body[0].statusResult.verified).toBe(true);
        expect(res.body[0].statusResult).toHaveProperty('results');
        expect(res.body[0].statusResult.results.every((r: any) => r.verified)).toBe(true);
    });

    test("Falsify single credential", async () => {
        const res = await request(app).post("/api/verifier").send([manipulatedCredential]);
        expect(res.statusCode).toEqual(200);
        expect(res.body[0]).toHaveProperty('verified');
        expect(res.body[0].verified).toBe(false);
        expect(res.body[0]).toHaveProperty('error');
    });
});