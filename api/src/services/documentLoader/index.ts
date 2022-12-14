// @ts-ignore
import jsonldSignatures from 'jsonld-signatures';
import { getResolver } from './didresolver.js';
import { fetch_get } from '../fetch/index.js';

const TRUSTED_CONTEXT_DOMAINS: [string] = ['https://ssi.eecc.de']

const cache = new Map();

const documentLoader: Promise<any> = jsonldSignatures.extendContextLoader(async (url: string) => {

    // Fetch did documents
    if (url.startsWith('did:')) {

        const [did, verificationMethod] = url.split('#')

        // fetch document
        const didDocument: any = (await getResolver().resolve(url)).didDocument

        // if a verifcation method of the DID document is queried (not yet implemented in the official resolver)
        if (verificationMethod && didDocument) {

            const verificationMethodDoc: any | undefined = didDocument.verificationMethod.filter(function(method: any) {
                                                                            return method.id === url || method.id === verificationMethod;
                                                                        })[0];

            if (!verificationMethodDoc)
                throw new jsonldSignatures.VerificationError(
                            new Error(`${verificationMethod} is an unknown verification method for ${did}`)
                            );

            return {
                contextUrl: null,
                documentUrl: url,
                // deliver verification method with the DID doc context
                document: Object.assign(verificationMethodDoc, {'@context': didDocument['@context']}),
            };

        }

        return {
            contextUrl: null,
            documentUrl: url,
            document: didDocument,
        };
    }

    let document = cache.get(url);

    // fetch if not in cache
    if (!document) {

        document = await(await fetch_get(url)).json();

        // cache and warn if external
        if (!TRUSTED_CONTEXT_DOMAINS.some((trusted) => url.startsWith(trusted))) {

            console.warn(`Fetched and cached @context from ${url}. Use with care!`);

            cache.set(url, document);

        }

    }

    return {
        contextUrl: null,
        documentUrl: url,
        document: document,
    };

});

export { documentLoader }