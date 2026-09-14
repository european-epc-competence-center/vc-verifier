import { Resolver } from 'did-resolver';
import * as key from './custom/key.js';
import * as webvh from './custom/webvh.js';
import * as web from 'web-did-resolver';

const resolver = new Resolver(
    {
        ...key.getResolver(),
        ...web.getResolver(),
        ...webvh.getResolver()
    },
    {
        cache: false
    }
);

export function getResolver() {
    return resolver;
}
