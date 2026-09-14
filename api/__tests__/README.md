# API tests

Run from `api` on Node 24:

```sh
npm test -- --runInBand
npm run build-tsc
```

Tests use local fixtures. They do not need the wallet, GS1, W3C, IPFS gateways,
or any other external service to be reachable. Supertest still uses ephemeral
loopback HTTP sockets to exercise Express routes.

## Layout

- `*.test.ts`: assertions and test-specific setup.
- `fixtures/legacy/`: named credentials, presentations, JWTs, and DID documents
  extracted from the existing tests. See its provenance and README.
- `fixtures/http/`: recorded HTTP response bodies, with an exact URL-to-file map,
  response status, headers, source details, and checksums in `manifest.json`.
- `fixtures/didwebvh/`: the wallet webvh interoperability samples and log.
- `../test-support/fixtures.ts`: fixture readers that return fresh parsed objects.
- `../test-support/http-fixtures.ts`: shared HTTP response replay.
- `../test-support/setup-http.ts`: offline enforcement for every suite.

The shared setup replaces `node-fetch`, `cross-fetch` (used by did:web), and
native `fetch` (used by webvh). Only recorded GET requests are accepted. A missing
fixture fails the test even if verification catches the fetch error and returns
`verified: false`. Direct external `http`/`https` calls are also blocked; loopback
requests are reserved for Supertest. There is no record-on-miss or live fallback.

Some existing tests still override documents locally to isolate GS1 chains or
negative cases. Their remaining loader calls now go through the shared offline
transports. The webvh suite overrides those transports to exercise its exact
log bytes and deliberate log mutations. Cryptographic verification and status
decoding are not mocked by the shared transport setup.

## Adding or changing fixtures

1. Put large static inputs in a named JSON or JWT file and load them with the
   fixture readers. Keep the assertions in the test.
2. If verification loads another URL, capture that public response separately
   and add an exact manifest entry. Preserve the signed payload and the context
   representation it needs; record any formatting or generation steps.
3. Record provenance and SHA-256 checksums. Do not include private signing keys.
4. Run the relevant test, then the full suite. An unexpected-request failure
   means a fixture or explicit test stub is missing; do not enable live fallback.

API tests import `src/app.ts`, which constructs Express without a persistent
listener. Production still starts through `src/index.ts`. Cache housekeeping
uses an unreferenced timer, so Jest exits normally without `--forceExit`.

The pre-existing two skipped tests and their TODOs are retained. The GS1 custom
test-root warning comes from the existing fixture configuration in
`jest.setup.ts`; this cleanup does not change trust roots or verification rules.

Validation on 2026-09-14 under Node 24.19.0: all 14 suites passed (72 tests passed,
2 skipped), with external requests blocked; TypeScript build passed. Jest exited
normally. This tests fixture behavior, not the current availability or current
state of the remote services.
