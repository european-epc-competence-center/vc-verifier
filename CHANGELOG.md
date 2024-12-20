VC Verifier Changelog
=================

WIP
---

- allow gs1 chaining library to access verification erros

2.0.3 (2024-07-23)

- fix container startup

2.0.2 (2024-07-23)

- fix api url

2.0.1 (2024-07-23)

- fix show version

2.0.0 (2024-07-23)

- add gs1 verification endpoint
- use gs1 endpoint on gs1 credential

1.7.8 (2024-06-13)
---

- fix status verification for SD


1.7.7 (2023-11-21)
---

- prevent caching of status credentials in document loader
- support mutli status list results in UI


1.7.6 (2023-11-15)
---

- allow multi status credentials
- update vc dependency


1.7.5 (2023-11-14)
---

- introduce static contexts
- manual status checks for SD credentials
  

1.7.4 (2023-10-10)
---

- fix build node version


1.7.3 (2023-10-09)
---

- support empty presentations for proof of possession
  

1.7.2 (2023-09-11)
---

- fix statusList in presentation


1.7.1 (2023-09-08)
---

- fix danger border on pending
- borderless icon


1.7.0 (2023-09-08)
---

- support status-list-2021
- introduce own logo


1.6.5 (2023-08-30)
---

- deduce credential type more accurately
- add query params to swagger
- update dependencies


1.6.4 (2023-06-29)
---

- use authentication for inital fetch if present
- general improvements to authentication


1.6.3 (2023-06-27)
---

- UI improvements
- add global authentication on entry page


1.6.2 (2023-06-22)
---

- fix authentication removed after disclosure


1.6.1 (2023-06-22)
---

- allow OID4VP for authenticated request
- rework SD request UI for OID4VC
- allow custom credential types for OID4VP
- small improvements


1.6.0 (2023-06-19)
---

- add ability to request disclosure of single credentials


1.5.3 (2023-06-14)
---

- always use id hash as the credential identifier
- add proof challenge & domain as query param


1.5.2 (2023-06-05)
---

- use hash of proof as COM identifier
- support Ed25519Signature2018 crypto suite


1.5.1 (2023-06-01)
---

- recognize ProductPassportCredential whn IPFS context
- fix QR-Code overflow
- support ipfs context fetching in frontend


1.5.0 (2023-05-31)
---

- add selective disclosure credential verification


1.4.2 (2023-05-02)
---

- update dpp recognition


1.4.2 (2023-03-30)
---

- fix error message


1.4.1 (2023-03-21)
---

- add EECC IPFS gateways as default
- fix IPFS promises
- UI improvements


1.4.0 (2023-03-15)
---

- add OpenId4VP functionality


1.3.0 (2023-02-28)
---

- allow fetching context from ipfs
- UI improvements


1.2.1 (2023-02-24)
---

- fix context in presentations [#28](https://github.com/european-epc-competence-center/vc-verifier/issues/28)
  

1.2.0 (2023-02-22)
---

- show JSON-LD context in credential details
- show JSON-LD context in product passport


1.1.2 (2023-02-17)
---

- trim batch values + tooltips and make them click to copy
- UI improvements
- fix pdf not displaying pure VCs

1.1.1 (2023-02-10)
---

- fix vpp not rendering without image
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