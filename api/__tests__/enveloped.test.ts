import { readJsonFixture } from "../test-support/fixtures.js";
import request from "supertest";

import app from "../src/app";

const envelopedCredential: any = readJsonFixture("legacy/enveloped/enveloped-credential.json")

describe("Verifier API Test for EnvelopedCredentials", () => {

    test("verifies the envelope signature and reports an unavailable status list", async () => {
        const res = await request(app).post("/api/verifier").send([envelopedCredential]);
        expect(res.statusCode).toEqual(200);
        expect(res.body[0]).toHaveProperty('verified');
        expect(res.body[0].verified).toBe(false);
        expect(res.body[0]).toHaveProperty('results');
        expect(res.body[0].results[0]).toHaveProperty('verified');
        expect(res.body[0].results[0].verified).toBe(true);
        expect(res.body[0]).toHaveProperty('statusResult');
        expect(res.body[0].statusResult).toHaveProperty('verified');
        expect(res.body[0].statusResult.verified).toBe(false);
    });

});
