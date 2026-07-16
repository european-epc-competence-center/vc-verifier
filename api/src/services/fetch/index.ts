
import parseLink from 'parse-link-header';
import fetch, { Response } from 'node-fetch';

// Multi-value Accept first (EECC registry). Fallbacks for issuers that reject
// multi-value Accept (e.g. Construct-X returns HTTP 415).
const ACCEPT_ATTEMPTS: Array<string | undefined> = [
    'application/ld+json, application/json, application/vc+jwt',
    'application/vc+jwt',
    'application/json',
    undefined,
];

const IPFS_GATEWAYS = ['ipfs.io', 'ipfs.ssi.eecc.de'].concat(process.env.IPFS_GATEWAYS ? process.env.IPFS_GATEWAYS.split(',') : []);

function isCompactJwt(value: string): boolean {
    return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value.trim());
}

async function fetchWithAcceptFallback(url: string): Promise<Response> {
    let lastResponse: Response | undefined;

    for (const accept of ACCEPT_ATTEMPTS) {
        const response = await fetch(url, {
            method: 'GET',
            ...(accept !== undefined ? { headers: { Accept: accept } } : {}),
        });

        if (response.ok) {
            return response;
        }

        lastResponse = response;
    }

    return lastResponse!;
}

export async function fetch_jsonld_or_jwt(url: string): Promise<any> {

    const response = await fetchWithAcceptFallback(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || '';
    const bodyText = await response.text();

    if (
        contentType.includes('application/vc+jwt') ||
        contentType.includes('application/jwt') ||
        isCompactJwt(bodyText)
    ) {
        return bodyText.trim();
    }

    if (contentType.includes('application/ld+json') || contentType.includes('application/json')) {
        return JSON.parse(bodyText);
    }

    // search for json-ld link if no json-ld is returned
    const link = parseLink(response.headers.get('Link'));

    if (link?.alternate?.rel == 'alternate' && link?.alternate?.type == 'application/ld+json') {

        const linkResponse = await fetchWithAcceptFallback(url + link.alternate.url);

        if (!linkResponse.ok) {
            throw new Error(`Failed to fetch linked JSON-LD for ${url}: HTTP ${linkResponse.status}`);
        }

        return await linkResponse.json();

    }

    try {
        return JSON.parse(bodyText);
    } catch (error) {
        return bodyText;
    }

}

export async function fetch_json(url: string): Promise<any> {

    const response = await fetchWithAcceptFallback(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
    }

    return await response.json();

}

export async function fetchIPFS(IPFSUrl: string): Promise<any> {

    var document;

    await Promise.any(IPFS_GATEWAYS.map(async (gateway) => {

        return await fetch_jsonld_or_jwt(`https://${gateway}/ipfs/${IPFSUrl.split('ipfs://')[1]}`);

    }))
        .then((result) => {

            document = result;

        })
        .catch((error) => {

        })

    if (!document) throw Error('Fetching from IPFS failed');

    return document;

}
