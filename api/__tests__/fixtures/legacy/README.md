# Existing verification inputs

These named fixtures replace large inline literals in the existing API tests.
Thirty-five retain their original values from verifier commit
`0685868e0a8b26929f6cff3c2722e54143f07db8`. JSON objects were formatted; compact
JWTs are unchanged with a trailing file newline trimmed by the reader.
`provenance.json` records each source declaration and file checksum. Test
assertions and the two existing skipped tests were retained.

## Replacement for the unavailable presentation context

`presentation/status-presentation.json` is the one regenerated input. Its old
version depended on IPFS context
`QmY9CDY2PoXLgHr2vG4u8mj27cfAyuzVxE2swt8wwFn7Rt`, which timed out on both configured
gateways and an alternate gateway during capture. No copy was available.

The replacement was generated locally on 2026-09-14 using the installed
`@digitalbazaar/vc`, `@digitalbazaar/ed25519-signature-2020`,
`@digitalbazaar/ed25519-verification-key-2020`, and
`@digitalbazaar/vc-revocation-list` packages. It uses an ephemeral Ed25519 key,
a self-contained did:key issuer/holder, issuance/proof timestamps of
2026-09-04T10:00:00Z, challenge `demochallenge`, and a 131072-bit signed
RevocationList2020 with index 1 unrevoked. Private key material was discarded.
The matching status-list response is `../http/generated-revocation-list-2020.json`.

The presentation and embedded access credential both have real
Ed25519Signature2020 proofs. An inline access context removes the unavailable
dependency. The existing success assertions still exercise presentation proof,
credential proof, and status verification, with an additional explicit assertion
on the status result. This is a replacement test scenario, not a reconstruction
of the missing IPFS content. IPFS loading remains covered by the captured context
used in the StatusList2021 credential test.
