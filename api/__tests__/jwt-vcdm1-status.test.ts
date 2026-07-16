import { jest } from "@jest/globals";
import { checkBitstringStatus } from "../src/services/verifier/status.js";
import { decodeVerifiableInput } from "../src/services/verifier/envelope.js";

const statusListUrl =
  "https://issuer.int.construct-x.net/statuslist/b82dfa22-b02d-4cd5-84cc-4d7acb219542";

const statusListCredentialJwt =
  "eyJraWQiOiJkaWQ6d2ViOmlzc3Vlci5pbnQuY29uc3RydWN0LXgubmV0Omlzc3VlciNrZXktMSIsImFsZyI6IkVkMjU1MTkifQ.eyJzdWIiOiJjOGIzMzYyMi1mODFlLTQyZmMtYjlhZi0wODc1MzU5ZDYyOTkiLCJuYmYiOjE3ODM2MTI3MTksImlzcyI6ImRpZDp3ZWI6aXNzdWVyLmludC5jb25zdHJ1Y3QteC5uZXQ6aXNzdWVyIiwiZXhwIjoxODE1MTQ4NzE5LCJpYXQiOjE3ODM2MTI3MTksInZjIjp7ImNyZWRlbnRpYWxTdWJqZWN0Ijp7InN0YXR1c1B1cnBvc2UiOiJyZXZvY2F0aW9uIiwidHlwZSI6IkJpdHN0cmluZ1N0YXR1c0xpc3QiLCJlbmNvZGVkTGlzdCI6InVINHNJQUFBQUFBQUFfMk5nR0FXallCU01nbEV3Q2tiQlNBTUFucnJvOFFBSUFBQSJ9LCJpc3N1YW5jZURhdGUiOiIyMDI2LTA3LTA5VDE1OjU4OjM5LjY0NDk2NjgxOFoiLCJpZCI6ImI4MmRmYTIyLWIwMmQtNGNkNS04NGNjLTRkN2FjYjIxOTU0MiIsInR5cGUiOlsiQml0c3RyaW5nU3RhdHVzTGlzdENyZWRlbnRpYWwiXSwiQGNvbnRleHQiOlsiaHR0cHM6Ly93d3cudzMub3JnLzIwMTgvY3JlZGVudGlhbHMvdjEiXSwiaXNzdWVyIjoiZGlkOndlYjppc3N1ZXIuaW50LmNvbnN0cnVjdC14Lm5ldDppc3N1ZXIiLCJleHBpcmF0aW9uRGF0ZSI6IjIwMjctMDctMDlUMTU6NTg6MzkuNjQ0OTY2ODE4WiJ9LCJqdGkiOiI0MjAxMTYyNi0zOTI2LTQ3M2MtYTRmYS0xYjUwMTY0YWI1NzMifQ.EbUGg-OixGIrfZbe6UGQQfzM5V3589vOqaqUD0TEoweNCyJ0594MQE6MkoWJDij58WbAkwQj3kMRfz2fXL9HDg";

const membershipCredentialVcdm1 = {
  iss: "did:web:issuer.int.construct-x.net:issuer",
  vc: {
    type: ["VerifiableCredential", "MembershipCredential"],
    issuer: "did:web:issuer.int.construct-x.net:issuer",
    credentialStatus: {
      id: "6d5f13b3-9ddc-4889-9640-a3adadeaff2b",
      type: "BitstringStatusListEntry",
      statusPurpose: "revocation",
      statusListIndex: 19,
      statusListCredential: statusListUrl,
    },
  },
};

describe("VC Data Model 1.1 JWT credential status", () => {
  test("unwraps nested vc claim including credentialStatus", () => {
    const body = decodeVerifiableInput(membershipCredentialVcdm1);
    expect(body.credentialStatus.type).toBe("BitstringStatusListEntry");
  });

  test("reads status list JWT with nested vc claim", async () => {
    const documentLoader = jest.fn().mockImplementation(async (_url: any) => ({
      contextUrl: null,
      documentUrl: statusListUrl,
      document: statusListCredentialJwt,
    }));

    const result = await checkBitstringStatus({
      credential: membershipCredentialVcdm1,
      documentLoader: documentLoader as any,
      verifyStatusListCredential: false,
      verifyMatchingIssuers: false,
    });

    expect(documentLoader).toHaveBeenCalledWith(statusListUrl);
    expect(result.verified).toBe(true);
  });
});
