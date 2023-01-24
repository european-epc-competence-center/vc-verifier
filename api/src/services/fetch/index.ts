
import parseLink from 'parse-link-header';

const JSON_HEADERS = {
    'Accept': 'application/json'
}

const JSONLD_HEADERS = {
    'Accept': 'application/ld+json'
}

export async function fetch_jsonld(url: string): Promise<object> {

    const response = await fetch(url, { method: 'GET', headers: JSONLD_HEADERS});

    // no json-ld returned -> search for json-ld link
    if (response.headers.get('content-type') != 'application/ld+json') {

        const link = parseLink(response.headers.get('Link'));

        if (link && link.alternate && link.alternate.rel == 'alternate' && link.alternate.type == 'application/ld+json') {

            const linkResponse = await fetch(url + link.alternate.url, { method: 'GET', headers: JSONLD_HEADERS});

            return await linkResponse.json();

        }

    }

    return await response.json();
    
}

export async function fetch_json(url: string): Promise<object> {

    const response = await fetch(url, { method: 'GET', headers: JSON_HEADERS});

    return await response.json();
    
}