
import parseLink from 'parse-link-header';
import fetch from 'node-fetch';

const HEADERS = {
    'Accept': 'application/ld+json, application/json'
}

const IPFS_GATEWAYS = ['ipfs.io', 'ipfs.ssi.eecc.de'].concat(process.env.IPFS_GATEWAYS ? process.env.IPFS_GATEWAYS.split(',') : []);


export async function fetch_jsonld(url: string): Promise<any> {

    const response = await fetch(url, { method: 'GET', headers: HEADERS });

    const contentType = response.headers.get("content-type");

    // return if proper json-ld is returned
    if (contentType && contentType.indexOf('application/ld+json') != -1) {

        return await response.json();

    }

    // search for json-ld link if no json-ld is returned
    const link = parseLink(response.headers.get('Link'));

    if (link?.alternate?.rel == 'alternate' && link?.alternate?.type == 'application/ld+json') {

        const linkResponse = await fetch(url + link.alternate.url, { method: 'GET', headers: HEADERS });

        return await linkResponse.json();

    }

    // try fetching json in any case
    return await response.json();

}

export async function fetch_json(url: string): Promise<any> {

    const response = await fetch(url, { method: 'GET', headers: HEADERS });

    return await response.json();

}

export async function fetchIPFS(IPFSUrl: string): Promise<any> {

    var document;

    await Promise.any(IPFS_GATEWAYS.map(async (gateway) => {

        return await fetch_jsonld(`https://${gateway}/ipfs/${IPFSUrl.split('ipfs://')[1]}`);

    }))
        .then((result) => {

            document = result;

        })
        .catch((error) => {

        })

    if (!document) throw Error('Fetching from IPFS failed');

    return document;

}
