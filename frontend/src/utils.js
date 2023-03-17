import jsonld from 'jsonld';

export const VerifiableType = {
    CREDENTIAL: 'VerifiableCredential',
    PRESENTATION: 'VerifiablePresentation'
};

export function isURL(url) {
    if (typeof url != 'string') return false;
    return url.startsWith('https://');
}

export function getCredentialValue(value) {
    return typeof value === 'object' ? value.value || value['@value'] || JSON.stringify(value, null, 2) : value;
}

export function getPlainCredential(credential) {
    var clean_credential = { ...credential };
    delete clean_credential.verified;
    delete clean_credential.revoked;
    delete clean_credential.status;
    delete clean_credential.presentation;
    delete clean_credential.context;
    return clean_credential;
}

export function getVerifiableType(verifiable) {
    if (verifiable.type.includes(VerifiableType.PRESENTATION)) return VerifiableType.PRESENTATION;
    return VerifiableType.CREDENTIAL;
}

export function getHolder(presentation) {
    if (presentation.holder) return presentation.holder;
    const proof = Array.isArray(presentation.proof) ? presentation.proof[0] : presentation.proof
    return proof.verificationMethod.split('#')[0];
}

export async function getContext(credential) {
    const resolved = await jsonld.processContext(await jsonld.processContext(null, null), credential);
    return resolved.mappings;
}
