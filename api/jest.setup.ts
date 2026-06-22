/**
 * Jest environment defaults for API integration tests.
 *
 * GS1_GLOBAL_DID: trusted issuer for GS1PrefixLicenseCredential chain roots.
 * Dev/test credentials use the company-wallet gs1_global DID; tests with
 * production id.gs1.org credentials must override this (see gs1.test.ts).
 */
process.env.GS1_GLOBAL_DID =
  process.env.GS1_GLOBAL_DID ??
  "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global";
