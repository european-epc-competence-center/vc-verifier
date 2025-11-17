import { jest } from '@jest/globals'

// Set environment variable for GS1 Global DID used in tests
process.env.GS1_GLOBAL_DID = "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global";

// GS1 Prefix License Credential (JSON-LD with ES256 signature)
const gs1PrefixLicenseJsonLD = {
  "type": [
    "VerifiableCredential",
    "GS1PrefixLicenseCredential"
  ],
  "proof": {
    "type": "JsonWebSignature2020",
    "created": "2025-11-14T08:02:15Z",
    "verificationMethod": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global#prefixe",
    "proofPurpose": "assertionMethod",
    "proofValue": "z5Rt4AbjehhmWFeJtXSUJZq6BsUErmvg7Wj5AuSvYozBv3zCooAZajn4F6i6KgiWNkKwzxGujbQXiVsiCSt5SnPXN"
  },
  "issuer": {
    "id": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global",
    "name": "GS1 Global"
  },
  "credentialSubject": {
    "id": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_utopia",
    "alternativeLicenseValue": "951",
    "licenseValue": "0951",
    "organization": {
      "gs1:partyGLN": "0951000000005",
      "gs1:organizationName": "GS1 Utopia"
    }
  },
  "id": "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_prefix/0951",
  "validFrom": "2025-11-14T08:01:53Z",
  "credentialStatus": {
    "id": "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/e2daaf0a-b6c3-4ed1-89b0-77d2505e182a#121874",
    "type": "BitstringStatusListEntry",
    "statusPurpose": "revocation",
    "statusListIndex": "121874",
    "statusListCredential": "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/e2daaf0a-b6c3-4ed1-89b0-77d2505e182a"
  },
  "credentialSchema": {
    "id": "https://id.gs1.org/vc/schema/v1/prefix",
    "type": "JsonSchema"
  },
  "@context": [
    "https://www.w3.org/ns/credentials/v2",
    "https://ref.gs1.org/gs1/vc/license-context",
    "https://w3id.org/vc/render-method/v1",
    "https://w3id.org/security/suites/jws-2020/v1"
  ],
  "renderMethod": [
    {
      "type": "SvgRenderingTemplate2023",
      "id": "https://gs1.github.io/GS1DigitalLicenses/templates/gs1-sample-license-template.svg",
      "name": "Web Display",
      "css3MediaQuery": "@media (min-aspect-ratio: 3/1)"
    }
  ],
  "name": "GS1 Prefix License",
  "description": "Verifies the authorized assignment of a GS1 prefix to a Member Organization by GS1 Global. This credential establishes the foundational authority that enables the Member Organization to issue Company Prefix Licenses to member companies within their geographic region or market sector. The prefix forms the basis for creating globally unique identifiers in the GS1 system."
};

// Status List Credential JWT
const statusListCredentialJWT = "eyJraWQiOiJkaWQ6d2ViOmNvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlOmFwaTpyZWdpc3RyeTpkaWQ6Z3MxX2dsb2JhbCNwcmVmaXhlIiwiYWxnIjoiRVMyNTYifQ.eyJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiQml0c3RyaW5nU3RhdHVzTGlzdENyZWRlbnRpYWwiXSwiaXNzdWVyIjp7ImlkIjoiZGlkOndlYjpjb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZTphcGk6cmVnaXN0cnk6ZGlkOmdzMV9nbG9iYWwiLCJuYW1lIjoiR1MxIEdsb2JhbCJ9LCJjcmVkZW50aWFsU3ViamVjdCI6eyJpZCI6Imh0dHBzOi8vY29tcGFueS13YWxsZXQtZGV2LnByb2QtazhzLmVlY2MuZGUvYXBpL3JlZ2lzdHJ5L3N0YXR1cy9yZXZvY2F0aW9uL2UyZGFhZjBhLWI2YzMtNGVkMS04OWIwLTc3ZDI1MDVlMTgyYSNsaXN0Iiwic3RhdHVzUHVycG9zZSI6InJldm9jYXRpb24iLCJ0eXBlIjoiQml0c3RyaW5nU3RhdHVzTGlzdCIsImVuY29kZWRMaXN0IjoiSDRzSUFBQUFBQUFBXy0zQk1RRUFBQURDb1BWUGJRd2ZvQUFBQUFBQUFBQUFBQUFBQUFBQUFJQzNBWWJTVktzQVFBQUEifSwiaWQiOiJodHRwczovL2NvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlL2FwaS9yZWdpc3RyeS9zdGF0dXMvcmV2b2NhdGlvbi9lMmRhYWYwYS1iNmMzLTRlZDEtODliMC03N2QyNTA1ZTE4MmEiLCJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvbnMvY3JlZGVudGlhbHMvdjIiLCJodHRwczovL3d3dy53My5vcmcvbnMvY3JlZGVudGlhbHMvc3RhdHVzL3YxIl0sImlhdCI6MTc2MjUwMjQ4M30.XsWoqw-_Hhbo-rmK9f5Qo4jAGvaaUEYTjfvCJlPaZExa6RzS9xxElyLSI1k-9YF76yfrmOTO-Hi4wRA2ackuPw";

// DID Document for gs1_global with the prefixe key
const did_gs1_global: any = {
  "id": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global",
  "verificationMethod": [
    {
      "id": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global#prefixe",
      "type": "JsonWebKey",
      "controller": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global",
      "publicKeyJwk": {
        "kty": "EC",
        "crv": "P-256",
        "x": "zifUTgLixW0LaG-IdFnBRa-nvRBMPCmiLS6_J7Luzpw",
        "y": "rADgVn94vOwRLZjYICYj7WVddHUWrQrfyxoms3Q6p_k",
        "kid": "prefixe"
      }
    }
  ],
  "controller": [
    "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global"
  ],
  "@context": [
    "https://www.w3.org/ns/did/v1"
  ],
  "assertionMethod": [
    "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global#prefixe"
  ],
  "authentication": [
    "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global#prefixe"
  ]
};

// Helper function to resolve DID fragments
function resolveDIDFragment(didDocument: any, fragmentId: string) {
    // Find the verification method with the matching fragment ID
    const verificationMethod = didDocument.verificationMethod?.find((vm: any) =>
        vm.id.endsWith(`#${fragmentId}`)
    );

    if (verificationMethod) {
        return verificationMethod;
    }

    // If not found in verificationMethod, return the whole document
    return didDocument;
}

// Import the real document loader first to use as fallback
const documentLoaderModule = await import("../src/services/documentLoader/index.js");
const realDocumentLoader = documentLoaderModule.documentLoader;

// Mock the document loader with fallback to real implementation
await jest.unstable_mockModule("../src/services/documentLoader/index", () => ({
    documentLoader: jest.fn().mockImplementation(async (url: any) => {
        // Handle status list credential URL
        if (url === "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/e2daaf0a-b6c3-4ed1-89b0-77d2505e182a") {
            return {
                contextUrl: null,
                documentUrl: url,
                document: statusListCredentialJWT
            };
        }

        // Handle DIDs with fragments
        if (url.startsWith("did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:")) {
            const [didUrl, fragment] = url.split('#');

            if (didUrl === "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global") {
                if (fragment) {
                    return {
                        contextUrl: null,
                        documentUrl: url,
                        document: resolveDIDFragment(did_gs1_global, fragment)
                    };
                } else {
                    return {
                        contextUrl: null,
                        documentUrl: url,
                        document: did_gs1_global
                    };
                }
            }
        }

        // For all other URLs (contexts, etc.), use the real document loader
        return realDocumentLoader(url);
    })
}));

// Import modules after mocking
import request from "supertest";
// Global server variable
let server: any;

describe("Verifier API Test for JSON-LD Credentials with ES256", () => {

    beforeAll(async () => {
        // Import server after mocks are set up
        const { default: serverModule } = await import("../src/index");
        server = serverModule;
    });

    afterAll(done => {
        if (server) {
            server.close();
        }
        done();
    });

    // Valid GS1 Prefix License Credential as JSON-LD with ES256 signature
    test("Verify valid GS1 Prefix License Credential as JSON-LD with ES256 signature", async () => {
        const res = await request(server)
            .post("/api/verifier/gs1")
            .send([gs1PrefixLicenseJsonLD]);

        console.log("Response:", JSON.stringify(res.body, null, 2));
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body[0].verified).toBe(true);
    });
});

