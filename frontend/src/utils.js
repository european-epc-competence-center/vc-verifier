
export function isURL(url) {
    return url.startsWith('https://');
}

export function getCredentialValue(value) {
    return typeof value === 'object' ? value.value || value['@value'] : value;
}

export function getPlainCredential(credential) {
    var clean_credential = {...credential};
    delete clean_credential.verified;
    delete clean_credential.revoked;
    delete clean_credential.status;
    return clean_credential;
}
