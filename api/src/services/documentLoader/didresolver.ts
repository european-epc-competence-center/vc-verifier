import { Resolver } from 'did-resolver';
import { getResolver as getWebvhResolver } from 'didwebvh-ts';
import * as key from './custom/key.js';
import * as web from 'web-did-resolver';

const resolver = new Resolver(
    {
        ...key.getResolver(),
        ...web.getResolver(),
        ...getWebvhResolver()
    },
    {
        cache: false
    }
);

export function getResolver() {
    return resolver;
}
