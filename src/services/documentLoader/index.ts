// @ts-ignore
import jsonldSignatures from 'jsonld-signatures';

const BASE_CONTEXT_URL: string = 'https://ssi.eecc.de/api/registry/context'

const documentLoader: Promise<any> = jsonldSignatures.extendContextLoader(async (url: string) => {

    // Fetch did documents
    if (url.startsWith('did:')) {

        const didIdentifier = url.split(':')[2].split('#')[0]

        const verificationMethod = url.split(':')[2].split('#')[1]
        
        // TODO implement other methods besides did:web
        const didDocument = await (await fetch('https://' + didIdentifier + '/.well-known/did.json')).json();

        // if a verifcation method of the DID document is queried
        if (verificationMethod) {

            const verificationMethodDoc: any | undefined = didDocument.verificationMethod.filter(function(method: any) {
                                                                            return method.id === url || method.id === verificationMethod;
                                                                        })[0];

            if (!verificationMethodDoc)
                throw new jsonldSignatures.VerificationError(
                            new Error(`${verificationMethod} is an unknown verification method for ${didIdentifier}`)
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