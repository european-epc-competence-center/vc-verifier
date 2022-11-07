// @ts-ignore
import jsonldSignatures from 'jsonld-signatures';
import Resolver from './didresolver.js'

const BASE_CONTEXT_URL: string = 'https://ssi.eecc.de/api/registry/context'

const documentLoader: Promise<any> = jsonldSignatures.extendContextLoader(async (url: string) => {

    // Fetch did documents
    if (url.startsWith('did:')) {

        const [did, verificationMethod] = url.split('#')

        // fetch document
        const didDocument: any = (await Resolver.resolve(did)).didDocument

        // if a verifcation method of the DID document is queried
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

    // Warn when context is fetched externally
    // TODO create list of trusted sources
    if (!url.startsWith(BASE_CONTEXT_URL)) console.warn(`Fetched @context from ${url}. Use with care!`)

    const document = await fetch(url);

    return {
        contextUrl: null,
        documentUrl: url,
        document: await document.json(),
    };

});

export { documentLoader, BASE_CONTEXT_URL }