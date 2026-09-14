import { readJsonFixture, readTextFixture } from "../test-support/fixtures.js";
import { jest } from '@jest/globals'
// url: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_key/01/09510010000002
const validKeyCredentialAsJwt = readTextFixture("legacy/jwt/valid-key-credential-as-jwt.jwt")
// extends from...
// url: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_prefix/0951001
const validCompanyPrefixLicenseAsJwt = readTextFixture("legacy/jwt/valid-company-prefix-license-as-jwt.jwt");
// extends from...
// url: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_prefix/0951
const validPrefixLicenseAsJwt = readTextFixture("legacy/jwt/valid-prefix-license-as-jwt.jwt");

// Status list credentials:
// url: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/c0470b49-d264-4a84-9cf4-267b1676e09c
const keyCredentialStatusListAsJwt = readTextFixture("legacy/jwt/key-credential-status-list-as-jwt.jwt");
// url: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/68ab4e25-de1e-4d06-b6ad-c0ec5d5c425b
const companyPrefixLicenseStatusListAsJwt = readTextFixture("legacy/jwt/company-prefix-license-status-list-as-jwt.jwt");
// url: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/9e859997-d387-4654-8d5e-7d35da1c7c47
const gs1PrefixLicenseStatusListAsJwt = readTextFixture("legacy/jwt/gs1-prefix-license-status-list-as-jwt.jwt");


const did_gs1_company: any = readJsonFixture("legacy/jwt/did-gs1-company.json")

const did_gs1_utopia: any = readJsonFixture("legacy/jwt/did-gs1-utopia.json")

const did_gs1_global: any = readJsonFixture("legacy/jwt/did-gs1-global.json")

function resolveDIDFragment(didDocument: any, fragmentId: string) {
    const verificationMethod = didDocument.verificationMethod?.find((vm: any) =>
        vm.id.endsWith(`#${fragmentId}`)
    );

    if (verificationMethod) {
        return verificationMethod;
    }

    return didDocument;
}

await jest.unstable_mockModule("../src/services/documentLoader/index", () => ({
    documentLoader: jest.fn().mockImplementation(async (url: any) => {
        if (url === "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_key/01/00951000000005") {
            return {
                contextUrl: null,
                documentUrl: url,
                document: validKeyCredentialAsJwt
            };
        } else if (url === "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_prefix/095100") {
            return {
                contextUrl: null,
                documentUrl: url,
                document: validCompanyPrefixLicenseAsJwt
            };
        } else if (url === "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_prefix/0951") {
            return {
                contextUrl: null,
                documentUrl: url,
                document: validPrefixLicenseAsJwt
            };
        } else if (url === "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/6a9c998b-c81c-48ec-aca5-82ce24da3e7f") {
            return {
                contextUrl: null,
                documentUrl: url,
                document: keyCredentialStatusListAsJwt
            };
        } else if (url === "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/3311655f-74df-4cf3-8774-09d134351e00") {
            return {
                contextUrl: null,
                documentUrl: url,
                document: companyPrefixLicenseStatusListAsJwt
            };
        } else if (url === "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/281ee0cc-7225-4bd7-a770-08b76acd3e5e") {
            return {
                contextUrl: null,
                documentUrl: url,
                document: gs1PrefixLicenseStatusListAsJwt
            };
        }

        if (url.startsWith("did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:")) {
            const [didUrl, fragment] = url.split('#');

            if (didUrl === "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:utopia_company") {
                if (fragment) {
                    return {
                        contextUrl: null,
                        documentUrl: url,
                        document: resolveDIDFragment(did_gs1_company, fragment)
                    };
                } else {
                    return {
                        contextUrl: null,
                        documentUrl: url,
                        document: did_gs1_company
                    };
                }
            } else if (didUrl === "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_utopia") {
                if (fragment) {
                    return {
                        contextUrl: null,
                        documentUrl: url,
                        document: resolveDIDFragment(did_gs1_utopia, fragment)
                    };
                } else {
                    return {
                        contextUrl: null,
                        documentUrl: url,
                        document: did_gs1_utopia
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

        // For unmocked URLs, log and throw error to identify what needs mocking
        console.log(`No mock available for URL: ${url}`);
        throw new Error(`Unmocked document loader URL called: ${url}`);
    })
}));

// Import modules after mocking
import request from "supertest";
// Global app variable
let app: any;

describe("Verifier API Test for JWT Credentials", () => {

    beforeAll(async () => {
        // Import app after mocks are set up
        const { default: appModule } = await import("../src/app");
        app = appModule;
    });

    test("Verify valid GS1 Key Credential as JWT with GS1 endpoint", async () => {
        const res = await request(app)
            .post("/api/verifier/gs1")
            .send([validKeyCredentialAsJwt]);
            
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body[0].verified).toBe(true);
    });

});
