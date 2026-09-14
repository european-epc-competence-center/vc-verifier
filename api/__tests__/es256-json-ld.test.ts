import { readJsonFixture, readTextFixture } from "../test-support/fixtures.js";
import { jest } from '@jest/globals'

// GS1 Prefix License Credential (JSON-LD with ES256 signature)
const gs1PrefixLicenseJsonLD = readJsonFixture("legacy/es256-json-ld/gs1-prefix-license-json-ld.json");

// Status List Credential JWT
const statusListCredentialJWT = readTextFixture("legacy/es256-json-ld/status-list-credential-jwt.jwt");

// DID Document for gs1_global with the prefixe key
const did_gs1_global: any = readJsonFixture("legacy/es256-json-ld/did-gs1-global.json");

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
// Global app variable
let app: any;

describe("Verifier API Test for JSON-LD Credentials with ES256", () => {

    beforeAll(async () => {
        // Import app after mocks are set up
        const { default: appModule } = await import("../src/app");
        app = appModule;
    });

    // Valid GS1 Prefix License Credential as JSON-LD with ES256 signature
    test("Verify valid GS1 Prefix License Credential as JSON-LD with ES256 signature", async () => {
        const res = await request(app)
            .post("/api/verifier/gs1")
            .send([gs1PrefixLicenseJsonLD]);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body[0].verified).toBe(true);
    });
});

