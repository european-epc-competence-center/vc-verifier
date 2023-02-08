
type Proof = {
    type: string;
    challenge: string | undefined;
}

type Verifiable = {
    '@context': (string | any)[];
    type: string[];
    proof: Proof | Proof[];
}

type CredentialSubject = {
    id: string | URL;
}

type VerifiableCredential = Verifiable & {
    id: URL;
    issuer: string | any;
    issuanceDate: string;
    credentialSubject: CredentialSubject;
}

type VerifiablePresentation = Verifiable & {
    id: URL;
    holder: string | any;
    verifiableCredential: VerifiableCredential | VerifiableCredential[];
}