import { Resolver } from 'did-resolver';
import * as key from './custom/key.js';
import * as web from 'web-did-resolver';

export function getResolver() {
    return new Resolver({
        ...key.getResolver(),
        ...web.getResolver()
        //...you can flatten multiple resolver methods into the Resolver
    })
    // Note: built-in cache disabled; TTL-based caching is handled in documentLoader
}