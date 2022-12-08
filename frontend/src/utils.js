
export function isURL(url) {
    return url.startsWith('https://');
}

export function getCredentialValue(value) {
    return typeof value === 'object' ? value.value || value['@value'] : value;
}

export async function documentLoader(url) {

    const document = await fetch(url);

    return {
        contextUrl: null,
        documentUrl: url,
        document: await document.json(),
    };
}
