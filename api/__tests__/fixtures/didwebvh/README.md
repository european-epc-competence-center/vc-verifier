# Wallet webvh interoperability fixtures

These are the wallet-issued ProductDataCredential samples supplied on 2026-09-14,
with their public DID history and the JSON-LD contexts captured during successful
live verification. See [didwebvh-provenance.json](./didwebvh-provenance.json) for source URLs,
capture details, SHA-256 checksums, runtime, and resolver snapshot.

- `didwebvh-credential.jwt` preserves the supplied compact JWT (ES256).
- `didwebvh-credential.json` contains the supplied JSON-LD VC (`ecdsa-rdfc-2019`), with
  Markdown-wrapped URLs restored to plain URLs. The proof is unchanged.
- `didwebvh-history.jsonl` preserves the downloaded response bytes. Its three entries use
  `did:webvh:1.0` and Ed25519 `eddsa-jcs-2022` log proofs. The credential signing
  key is a separate P-256 JWK, `#next-test-key`, added in entry 3.
- `contexts/` contains the parsed W3C credentials-v2 and GS1 product contexts.

No private signing keys are included. The wallet build SHA was not supplied.
The old `#test-key` remains authorized in this log; entry 3 adds a key rather
than revoking one. There are no required witnesses or credential status entries.

`../../didwebvh.test.ts` runs the actual resolver, document loader, and verifier.
Only HTTP transports are mocked: native `fetch` serves the log and `node-fetch`
serves the contexts. Unknown URLs fail the test, including attempts to fetch a
fallback `did.json`. The clock is fixed at 2026-09-14. Mutated credentials, log
states, and log proofs are derived in memory; the signed fixtures stay intact.

The shared Jest setup also makes the older API tests offline; see
[the test guide](../../README.md). This suite overrides the shared transports
to serve its exact webvh log and context snapshots, including tampered variants.

Run from `api`:

```sh
npm test -- --runInBand __tests__/didwebvh.test.ts
```

Validation on 2026-09-14: all 9 fixture tests passed under Node 24.19.0,
the API TypeScript build passed, and the full API regression run passed all
13 suites (68 tests passed, 2 skipped). All fixture checksums match provenance.

This establishes log validation and signature interoperability for these two
formats. It does not establish that all credential paths enforce issuer
authorization: JWT issuance checks and the Data Integrity issuance-purpose
correction remain separate planned changes. Request-scoped DID-state reuse,
key removal/deactivation, required witnesses, credential status, presentations,
and production-container/release validation also remain outside this fixture
coverage. The recorded live HTTPS check used the host Node 24 runtime.
