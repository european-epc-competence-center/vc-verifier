import { readJsonFixture, readTextFixture } from "../test-support/fixtures.js";
import { jest } from '@jest/globals'

// url: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/2b5cedca-f18b-47ae-b9dc-fe36b82dd96d
// Regression: base64url JWT ProductDataCredential that previously failed with vc-verifier-rules
const productDataCredentialAsJwt = readTextFixture("legacy/product-data-credential/product-data-credential-as-jwt.jwt");

// url: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_key/01/04047111000006
// linked from productDataCredential.credentialSubject.keyAuthorization
const keyCredential: any = readJsonFixture("legacy/product-data-credential/key-credential.json");

// url: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_prefix/4047111
// linked from keyCredential.credentialSubject.extendsCredential
const companyPrefixLicenseCredential: any = readJsonFixture("legacy/product-data-credential/company-prefix-license-credential.json");

// url: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_prefix/40
// linked from companyPrefixLicenseCredential.credentialSubject.extendsCredential
const prefixLicenseCredential: any = readJsonFixture("legacy/product-data-credential/prefix-license-credential.json");

// Status list credentials:
// url: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/2a6afdb9-e632-4a43-9c31-683930f82284
// shared by productDataCredential and keyCredential (both issued by did:eecc)
const eeccStatusList: any = readJsonFixture("legacy/product-data-credential/eecc-status-list.json");

// url: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/b62c5591-5d85-4b91-abb0-816a326b0c7a
// for companyPrefixLicenseCredential (issued by did:gs1_germany)
const gs1GermanyStatusList: any = readJsonFixture("legacy/product-data-credential/gs1-germany-status-list.json");

// url: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/6a653675-887b-4256-9332-dd71c3add282
// for prefixLicenseCredential (issued by did:gs1_global)
const gs1GlobalStatusList: any = readJsonFixture("legacy/product-data-credential/gs1-global-status-list.json");


// DID documents:
// url (resolved): https://company-wallet-dev.prod-k8s.eecc.de/api/registry/did/eecc
// issues productDataCredential (JWT, #bpp_vc_issuance), keyCredential (DataIntegrityProof, #bpp_vc_issuance), and eeccStatusList
const did_eecc: any = readJsonFixture("legacy/product-data-credential/did-eecc.json");

// url (resolved): https://company-wallet-dev.prod-k8s.eecc.de/api/registry/did/gs1_germany
// issues companyPrefixLicenseCredential and gs1GermanyStatusList (both use #no_secret)
const did_gs1_germany: any = readJsonFixture("legacy/product-data-credential/did-gs1-germany.json");

// url (resolved): https://company-wallet-dev.prod-k8s.eecc.de/api/registry/did/gs1_global
// issues prefixLicenseCredential and gs1GlobalStatusList (both use #no_secret)
const did_gs1_global: any = readJsonFixture("legacy/product-data-credential/did-gs1-global.json");

function resolveDIDFragment(didDocument: any, fragmentId: string) {
    const verificationMethod = didDocument.verificationMethod?.find((vm: any) =>
        vm.id.endsWith(`#${fragmentId}`)
    );

    if (verificationMethod) {
        return verificationMethod;
    }

    return didDocument;
}

const { documentLoader: realDocumentLoader } = (await import("../src/services/documentLoader/index")) as any;

await jest.unstable_mockModule("../src/services/documentLoader/index", () => ({
    documentLoader: jest.fn().mockImplementation(async (url: any) => {
        if (url === "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/2b5cedca-f18b-47ae-b9dc-fe36b82dd96d") {
            return {
                contextUrl: null,
                documentUrl: url,
                document: productDataCredentialAsJwt
            };
        } else if (url === "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_key/01/04047111000006") {
            return {
                contextUrl: null,
                documentUrl: url,
                document: keyCredential
            };
        } else if (url === "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_prefix/4047111") {
            return {
                contextUrl: null,
                documentUrl: url,
                document: companyPrefixLicenseCredential
            };
        } else if (url === "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_prefix/40") {
            return {
                contextUrl: null,
                documentUrl: url,
                document: prefixLicenseCredential
            };
        } else if (url === "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/2a6afdb9-e632-4a43-9c31-683930f82284") {
            return {
                contextUrl: null,
                documentUrl: url,
                document: eeccStatusList
            };
        } else if (url === "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/b62c5591-5d85-4b91-abb0-816a326b0c7a") {
            return {
                contextUrl: null,
                documentUrl: url,
                document: gs1GermanyStatusList
            };
        } else if (url === "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/6a653675-887b-4256-9332-dd71c3add282") {
            return {
                contextUrl: null,
                documentUrl: url,
                document: gs1GlobalStatusList
            };
        }

        if (url.startsWith("did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:")) {
            const [didUrl, fragment] = url.split('#');

            if (didUrl === "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:eecc") {
                if (fragment) {
                    return {
                        contextUrl: null,
                        documentUrl: url,
                        document: resolveDIDFragment(did_eecc, fragment)
                    };
                } else {
                    return {
                        contextUrl: null,
                        documentUrl: url,
                        document: did_eecc
                    };
                }
            } else if (didUrl === "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_germany") {
                if (fragment) {
                    return {
                        contextUrl: null,
                        documentUrl: url,
                        document: resolveDIDFragment(did_gs1_germany, fragment)
                    };
                } else {
                    return {
                        contextUrl: null,
                        documentUrl: url,
                        document: did_gs1_germany
                    };
                }
            } else if (didUrl === "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global") {
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

        // Fall through to real document loader for JSON-LD contexts and other static documents
        return realDocumentLoader(url);
    })
}));

// Import modules after mocking
import request from "supertest";
// Global app variable
let app: any;

describe("Verifier API Regression Test for ProductDataCredential (base64url JWT)", () => {

    beforeAll(async () => {
        // Import app after mocks are set up
        const { default: appModule } = await import("../src/app");
        app = appModule;
    });

    test("Verify valid ProductDataCredential JWT with full GS1 chain via GS1 endpoint", async () => {
        const res = await request(app)
            .post("/api/verifier/gs1")
            .send([productDataCredentialAsJwt]);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body[0].verified).toBe(true);
    });

});
