VC Verifier Changelog
=================

WIP
---

- UI improvements

1.1.0 (2023-02-10)
---

- add PDF download of verified product passport
- use UTC time for credential PDF
- UI improvements

1.0.1 (2023-02-08)
---

- allow arrays in the proof field of a verifiable
- assign basic presentation props to credential before verification


1.0.0 (2023-02-07)
---

- Supported did methods
  - `did:key`
  - `did:web`
- Verification of [W3C verifiable presentations and credentials](https://www.w3.org/TR/vc-data-model/)
- Revocations using [RevocationList2020](https://w3c-ccg.github.io/vc-status-rl-2020/)
- Fetching verifiable credentials by id for verification
- Querying of a [credential registry](https://w3c.github.io/did-spec-registries/#credentialregistry) by subject id for verification
- Rendering of product passports if credentials refer to `https://ssi.eecc.de/api/registry/context/productpassport` or an inheriting context
- Download of credentials as pdf or json
- Credential rendering as QR-Code
- Merging properties of the same subject id if overwritten