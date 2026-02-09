
type Proof = {
    type: string;
    challenge?: string;
    domain?: string;
    cryptosuite?: string;
}

type CredentialStatus = {
    id: string | URL,
    type: string;
    statusListIndex: string | number;
    statusListCredential: string | URL;
}

type Verifiable = {
    '@context': (string | any)[];
    type: string[];
    credentialStatus: CredentialStatus[] | CredentialStatus;
    proof: Proof | Proof[];
}

interface verifiableJwt {
    '@context'?: object | string[];
    id: string;
    type?: string[];
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