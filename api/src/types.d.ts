
type Proof = {
    type: string;
    challenge?: string;
    domain?: string;
    cryptosuite?: string;
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
    id: string | URL;
    issuer: string | any;
    issuanceDate: string;
    credentialSubject: CredentialSubject;
}

type VerifiablePresentation = Verifiable & {
    id: string | URL;
    holder: string | any;
    verifiableCredential: VerifiableCredential | VerifiableCredential[];
}