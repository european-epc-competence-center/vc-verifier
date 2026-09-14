import { readJsonFixture } from "../test-support/fixtures.js";
import request from "supertest";

import app from "../src/app";

const multiPresentation: any = readJsonFixture("legacy/presentation/multi-presentation.json")

const domainPresentation: any = readJsonFixture("legacy/presentation/domain-presentation.json")

const statusPresentation: any = readJsonFixture("legacy/presentation/status-presentation.json")

describe("Verifier API Test for Presentations", () => {

    test("Verify presentation with status", async () => {
        const res = await request(app).post("/api/verifier").send([statusPresentation]);
        expect(res.statusCode).toEqual(200);
        expect(res.body[0]).toHaveProperty('verified');
        expect(res.body[0].verified).toBe(true);
        expect(res.body[0]).toHaveProperty('credentialResults');
        res.body[0].credentialResults.forEach((el: any) => {
            expect(el).toHaveProperty('verified');
            expect(el.verified).toBe(true);
            expect(el.statusResult.verified).toBe(true);
        });
    });

    test("Verify single presentation with challenge", async () => {
        const res = await request(app).post("/api/verifier").query({ challenge: '12345' }).send([multiPresentation]);
        expect(res.statusCode).toEqual(200);
        expect(res.body[0]).toHaveProperty('verified');
        expect(res.body[0].verified).toBe(false);
        expect(res.body[0].presentationResult.verified).toBe(false);
        expect(res.body[0].presentationResult.results[0].purposeResult.valid).toBe(false);
        expect(res.body[0]).toHaveProperty('credentialResults');
        expect(res.body[0].credentialResults[0].verified).toBe(true);
        expect(res.body[0].credentialResults[1].verified).toBe(true);
    });

    /* todo: re enable + fix test
    test("Verify single presentation with challenge & domain", async () => {
        const res = await request(app).post("/api/verifier").query({ challenge: '12345', domain: 'ssi.eecc.de/verifier' }).send([domainPresentation]);
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
        const res = await request(app).post("/api/verifier").query({ challenge: 'falseChallenge', domain: 'ssi.eecc.de/verifier' }).send([domainPresentation]);
        expect(res.statusCode).toEqual(200);
        expect(res.body[0]).toHaveProperty('verified');
        expect(res.body[0].verified).toBe(false);
        expect(res.body[0]).toHaveProperty('error');
        expect(res.body[0].error.name).toBe('VerificationError');
    });

    */
});
