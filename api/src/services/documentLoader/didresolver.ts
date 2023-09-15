import { Resolver } from 'did-resolver';
import * as key from './custom/key.js';
import * as web from 'web-did-resolver';
import * as jwk from './custom/jwk.js';

export function getResolver() {
    return new Resolver({
        ...jwk.getResolver(),
        ...key.getResolver(),
        ...web.getResolver()
        //...you can flatten multiple resolver methods into the Resolver
    },
        {
            cache: true
        })
}