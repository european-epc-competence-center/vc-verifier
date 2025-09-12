import request from "supertest";

import server from "../src/index";

afterAll(done => {
    server.close();
    done();
});

// non-gs1 credential without revocation
const jwtCredential = "eyJraWQiOiJkaWQ6d2ViOmVlY2MuZGUjQkNWbmtjbTdzZ19EWlk0T0ZBVW50RU5sdFVmak5nbGlpVC1XcVlGdk56MGZ1VDc1NW9nanEyQ1JORnRxd1BqWHpoQVBwWmtnT2Y2VWxpSjh3bm5zYTdRIiwiYWxnIjoiRVMyNTYifQ.eyJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiVW5pdmVyc2l0eURlZ3JlZUNyZWRlbnRpYWwiXSwiaXNzdWVyIjp7ImlkIjoiZGlkOndlYjplZWNjLmRlIiwibmFtZSI6IkVFQ0MifSwiY3JlZGVudGlhbFN1YmplY3QiOnsiaWQiOiJkaWQ6ZXhhbXBsZTpzdWJqZWN0IiwiZGVncmVlIjp7InR5cGUiOiJCYWNoZWxvckRlZ3JlZSIsIm5hbWUiOiJCYWNjYWxhdXLDqWF0IGVuIG11c2lxdWVzIG51bcOpcmlxdWVzIn19LCJpZCI6Imh0dHBzOi8vY29tcGFueS13YWxsZXQtZGV2LnByb2QtazhzLmVlY2MuZGUvYXBpL3JlZ2lzdHJ5L3ZjLzIyZjdmY2JmLWUyZWEtNGM0OS1hZDNiLWQ3NDAzMTQ1NDQwNSIsInZhbGlkRnJvbSI6IjIwMjQtMDEtMDFUMDA6MDA6MDBaIiwiY3JlZGVudGlhbFN0YXR1cyI6W3siaWQiOiJodHRwczovL2NvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlL2FwaS9yZWdpc3RyeS9zdGF0dXMvcmV2b2NhdGlvbi84NmViOWZlMS0wZjNhLTQyNDktYWY4Yi0yYWZkMzZmYzA1OWEjODE4IiwidHlwZSI6IkJpdHN0cmluZ1N0YXR1c0xpc3RFbnRyeSIsInN0YXR1c1B1cnBvc2UiOiJyZXZvY2F0aW9uIiwic3RhdHVzTGlzdEluZGV4Ijo4MTgsInN0YXR1c0xpc3RDcmVkZW50aWFsIjoiaHR0cHM6Ly9jb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZS9hcGkvcmVnaXN0cnkvc3RhdHVzL3Jldm9jYXRpb24vODZlYjlmZTEtMGYzYS00MjQ5LWFmOGItMmFmZDM2ZmMwNTlhIn1dLCJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvbnMvY3JlZGVudGlhbHMvdjIiLCJodHRwczovL3d3dy53My5vcmcvbnMvY3JlZGVudGlhbHMvZXhhbXBsZXMvdjIiXSwiaWF0IjoxNzU3NTg5OTk3fQ.0nVOo0iXL_35vibJR90I0XYDuE_zqtuU7z2nU37c5y7ke7hon1bclblrxgNlxxEs7FwcIqpDYEGwkyi0DDrcbQ";

describe("Verifier API Test for JWT Credentials", () => {
    test("Verify JWT credential", async () => {
        const res = await request(server).post("/api/verifier").send([jwtCredential]);
        expect(res.statusCode).toEqual(200);
        expect(res.body[0]).toHaveProperty('verified');
        expect(res.body[0].verified).toBe(true);
    });
});
