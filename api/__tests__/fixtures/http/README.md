# Offline HTTP responses

`manifest.json` maps exact request URLs to response bodies, status codes, retained
content-type/link headers, and SHA-256 checksums. Responses were captured from
the existing API tests on 2026-09-14 using Node 24.19.0. Redirects were followed
before capture; bodies are preserved. Matching bodies shared by URL aliases or
IPFS gateways use the same file. No cookie or authentication headers are saved.

The W3C/GS1 contexts, public DID documents, and signed EECC status-list credentials
are captured snapshots. Their cryptographic validation and status decoding still
run through the normal verifier.

`vckit-status-unavailable.json` records an actual HTTP 500 response. The envelope
test explicitly verifies its JWT signature and reports the unavailable status
list. This fixture does not claim that the credential is revoked.

`generated-revocation-list-2020.json` is the sole generated response, for the
replacement presentation described in [the legacy fixture notes](../legacy/README.md).
It is a real signed status-list credential, with index 1 unrevoked. Its URL is a
test-only identifier and is served locally by the fixture transport.

These files cover active tests only. Enabling an existing skipped test may need
additional dependencies; the offline guard will identify missing URLs.
