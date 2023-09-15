import { DIDDocument, DIDResolutionResult, DIDResolver, ParsedDID } from 'did-resolver';
// @ts-ignore
import { resolve as JWKResolve } from '@or13/did-jwk';


export function getResolver(): Record<string, DIDResolver> {
    async function resolve(did: string, parsed: ParsedDID): Promise<DIDResolutionResult> {

        let err = null

        const didDocumentMetadata = {}
        let didDocument: DIDDocument | null = null

        do {
            try {
                didDocument = await JWKResolve(did);
            } catch (error) {
                err = `resolver_error: DID must resolve to a valid https URL containing a JSON document: ${error}`
                break
            }

            // TODO: this excludes the use of query params
            const docIdMatchesDid = didDocument?.id === did
            if (!docIdMatchesDid) {
                err = 'resolver_error: DID document id does not match requested did'
                // break // uncomment this when adding more checks
            }
            // eslint-disable-next-line no-constant-condition
        } while (false)

        const contentType =
            typeof didDocument?.['@context'] !== 'undefined' ? 'application/did+ld+json' : 'application/did+json'



        if (err) {
            return {
                didDocument,
                didDocumentMetadata,
                didResolutionMetadata: {
                    error: 'notFound',
                    message: err,
                },
            }
        } else {
            return {
                didDocument,
                didDocumentMetadata,
                didResolutionMetadata: { contentType },
            }
        }
    }

    return { key: resolve }
}

