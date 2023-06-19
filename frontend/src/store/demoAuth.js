export const demoAuthPresentation = {
    "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://w3id.org/security/suites/ed25519-2020/v1"
    ],
    "type": [
        "VerifiablePresentation"
    ],
    "verifiableCredential": [
        {
            "@context": [
                "https://www.w3.org/2018/credentials/v1",
                "ipfs://QmY9CDY2PoXLgHr2vG4u8mj27cfAyuzVxE2swt8wwFn7Rt",
                "https://w3id.org/vc-revocation-list-2020/v1",
                "https://w3id.org/security/suites/ed25519-2020/v1"
            ],
            "id": "https://ssi.eecc.de/api/registry/vc/b7440bf7-2317-43e4-9857-4c85032ac4a1",
            "type": [
                "VerifiableCredential",
                "EECCAccessCredential"
            ],
            "issuer": {
                "id": "did:web:ssi.eecc.de",
                "image": "https://id.eecc.de/assets/img/logo_big.png",
                "name": "EECC"
            },
            "issuanceDate": "2023-06-19T09:58:08Z",
            "credentialStatus": {
                "id": "https://ssi.eecc.de/api/registry/vc/status/did:web:ssi.eecc.de/1#1",
                "type": "RevocationList2020Status",
                "revocationListIndex": 1,
                "revocationListCredential": "https://ssi.eecc.de/api/registry/vc/status/did:web:ssi.eecc.de/1"
            },
            "credentialSubject": {
                "id": "https://ssi.eecc.de/verifier",
                "customer_name": "VC Verifier"
            },
            "proof": {
                "type": "Ed25519Signature2020",
                "created": "2023-06-19T09:58:08Z",
                "proofPurpose": "assertionMethod",
                "verificationMethod": "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
                "proofValue": "z247VYAm5GbG1sAAcqW7QwEL1mfXxaSa3N93EuLc4HeTUm219UjrPMC5gyq5xTAaDQCVMUEVTouyboY4UMTxzjekN"
            }
        }
    ],
    "holder": "did:web:ssi.eecc.de",
    "proof": {
        "type": "Ed25519Signature2020",
        "created": "2023-06-19T10:19:04Z",
        "verificationMethod": "did:web:ssi.eecc.de#z6MkoHWsmSZnHisAxnVdokYHnXaVqWFZ4H33FnNg13zyymxd",
        "proofPurpose": "authentication",
        "challenge": "demochallenge",
        "proofValue": "z3BCT7df4bRXXTa9i79apmiou76M8LVZXGFYHA18xT6wX3PfcpjfWaMc9xhFwmGi9XTj8tth1ai1ASeQoHiGWMn1V"
    }
}